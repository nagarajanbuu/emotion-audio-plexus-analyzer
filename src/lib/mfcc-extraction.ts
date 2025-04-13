
// MFCC Feature Extraction
// This file handles Mel-frequency cepstral coefficients extraction for audio processing

import * as tf from '@tensorflow/tfjs';

// Constants for MFCC extraction
const NUM_MFCC = 40;
const FFT_SIZE = 1024;
const HOP_LENGTH = 512;
const SAMPLE_RATE = 22050;

// Extract MFCC features from audio data
export const extractMFCC = async (audioData: Float32Array): Promise<Float32Array[][]> => {
  if (!audioData || audioData.length === 0) {
    return [];
  }
  
  // Create tensor from audio data
  const audioTensor = tf.tensor1d(audioData);
  
  // Apply short-time Fourier transform
  const stft = await applySTFT(audioData, FFT_SIZE, HOP_LENGTH);
  
  // Calculate power spectrogram
  const powerSpectrogramTensor = tf.abs(stft).pow(2);
  
  // Create mel filterbank
  const melFilterbank = createMelFilterbank(FFT_SIZE / 2 + 1, SAMPLE_RATE, NUM_MFCC);
  const melFilterbankTensor = tf.tensor2d(melFilterbank);
  
  // Apply mel filterbank to power spectrogram
  const melSpectrogramTensor = tf.matMul(powerSpectrogramTensor, melFilterbankTensor.transpose());
  
  // Apply log transform
  const logMelSpectrogram = tf.log(tf.add(melSpectrogramTensor, tf.scalar(1e-10)));
  
  // Apply discrete cosine transform to get MFCC
  const mfcc = await applyDCT(await logMelSpectrogram.array() as number[][], NUM_MFCC);
  
  // Clean up tensors
  audioTensor.dispose();
  powerSpectrogramTensor.dispose();
  melFilterbankTensor.dispose();
  melSpectrogramTensor.dispose();
  logMelSpectrogram.dispose();
  
  return mfcc;
};

// Extract frames from audio data
export const extractFrames = (audioData: Float32Array, frameLength: number, hopLength: number) => {
  const frames = [];
  for (let i = 0; i < audioData.length - frameLength; i += hopLength) {
    const frame = audioData.slice(i, i + frameLength);
    frames.push(frame);
  }
  return frames;
};

// Apply Short-time Fourier transform (STFT)
const applySTFT = async (
  audioData: Float32Array,
  fftSize: number,
  hopLength: number
): Promise<tf.Tensor2D> => {
  // Number of frames
  const numFrames = Math.floor((audioData.length - fftSize) / hopLength) + 1;
  
  // Create frames
  const frames = extractFrames(audioData, fftSize, hopLength);
  
  // Apply window function (Hann window)
  const windowFunction = hannWindow(fftSize);
  const windowedFrames = frames.map(frame => {
    return frame.map((sample, i) => sample * windowFunction[i]);
  });
  
  // Apply FFT to each frame
  const complexOutput = await applyFFT(windowedFrames);
  
  // Create tensors for real and imaginary parts
  const realTensor = tf.tensor2d(complexOutput.map(c => c.real));
  const imagTensor = tf.tensor2d(complexOutput.map(c => c.imag));
  
  // Combine into complex tensor
  const result = tf.complex(realTensor, imagTensor);
  
  // Clean up intermediate tensors
  realTensor.dispose();
  imagTensor.dispose();
  
  return result as tf.Tensor2D;
};

// Apply Fast Fourier Transform
export const applyFFT = async (windowedFrames: number[][]) => {
  const complexOutput: { real: number[]; imag: number[] }[] = [];
  for (let i = 0; i < windowedFrames.length; i++) {
    const fftResult = await tf.spectral.rfft(tf.tensor1d(windowedFrames[i]));
    
    // Get real and imaginary components safely using typed arrays
    const realValues: number[] = Array.from(await fftResult.real().array() as Float32Array);
    const imagValues: number[] = Array.from(await fftResult.imag().array() as Float32Array);
    
    complexOutput.push({ 
      real: realValues, 
      imag: imagValues 
    });
    
    fftResult.dispose();
  }
  return complexOutput;
};

// Create a Hann window function
const hannWindow = (size: number): Float32Array => {
  const window = new Float32Array(size);
  for (let i = 0; i < size; i++) {
    window[i] = 0.5 * (1 - Math.cos(2 * Math.PI * i / (size - 1)));
  }
  return window;
};

// Create a mel filterbank
const createMelFilterbank = (
  nFft: number,
  sampleRate: number,
  nMels: number
): number[][] => {
  // Convert Hz to mel
  const hzToMel = (hz: number): number => {
    return 2595 * Math.log10(1 + hz / 700);
  };
  
  // Convert mel to Hz
  const melToHz = (mel: number): number => {
    return 700 * (Math.pow(10, mel / 2595) - 1);
  };
  
  // Frequency range in mel scale
  const minMel = hzToMel(0);
  const maxMel = hzToMel(sampleRate / 2);
  
  // Equally spaced points in mel scale
  const melPoints = Array.from({ length: nMels + 2 }, (_, i) => {
    return minMel + (i * (maxMel - minMel)) / (nMels + 1);
  });
  
  // Convert mel points to frequency
  const hzPoints = melPoints.map(melToHz);
  
  // Convert to FFT bin indices
  const bins = hzPoints.map(hz => {
    return Math.floor((nFft - 1) * hz / (sampleRate / 2));
  });
  
  // Create filterbank
  const filterbank = Array.from({ length: nMels }, (_, i) => {
    return Array.from({ length: nFft }, () => 0);
  });
  
  for (let i = 0; i < nMels; i++) {
    for (let j = bins[i]; j < bins[i + 2]; j++) {
      if (j < bins[i + 1]) {
        filterbank[i][j] = (j - bins[i]) / (bins[i + 1] - bins[i]);
      } else {
        filterbank[i][j] = (bins[i + 2] - j) / (bins[i + 2] - bins[i + 1]);
      }
    }
  }
  
  return filterbank;
};

// Apply Discrete Cosine Transform (DCT)
const applyDCT = async (
  input: number[][],
  numCoefficients: number
): Promise<Float32Array[][]> => {
  const numFrames = input.length;
  const numFeatures = input[0].length;
  
  const output: Float32Array[][] = Array.from({ length: numFrames }, () => {
    return Array.from({ length: numCoefficients }, () => new Float32Array(numFeatures));
  });
  
  for (let i = 0; i < numFrames; i++) {
    for (let j = 0; j < numCoefficients; j++) {
      for (let k = 0; k < numFeatures; k++) {
        const value = input[i][k] * Math.cos((Math.PI * j * (k + 0.5)) / numFeatures);
        output[i][j][k] = value;
      }
    }
  }
  
  return output;
};

// Normalize MFCC features
export const normalizeMFCC = (mfcc: Float32Array[][]): Float32Array[][] => {
  if (!mfcc || mfcc.length === 0) {
    return [];
  }
  
  const numFrames = mfcc.length;
  const numCoefficients = mfcc[0].length;
  const numFeatures = mfcc[0][0].length;
  
  const mean = new Float32Array(numCoefficients);
  const std = new Float32Array(numCoefficients);
  
  // Calculate mean for each coefficient
  for (let j = 0; j < numCoefficients; j++) {
    let sum = 0;
    let count = 0;
    
    for (let i = 0; i < numFrames; i++) {
      for (let k = 0; k < numFeatures; k++) {
        sum += mfcc[i][j][k];
        count++;
      }
    }
    
    mean[j] = sum / count;
  }
  
  // Calculate standard deviation for each coefficient
  for (let j = 0; j < numCoefficients; j++) {
    let sum = 0;
    let count = 0;
    
    for (let i = 0; i < numFrames; i++) {
      for (let k = 0; k < numFeatures; k++) {
        sum += Math.pow(mfcc[i][j][k] - mean[j], 2);
        count++;
      }
    }
    
    std[j] = Math.sqrt(sum / count);
  }
  
  // Apply normalization
  const normalized: Float32Array[][] = Array.from({ length: numFrames }, () => {
    return Array.from({ length: numCoefficients }, () => new Float32Array(numFeatures));
  });
  
  for (let i = 0; i < numFrames; i++) {
    for (let j = 0; j < numCoefficients; j++) {
      for (let k = 0; k < numFeatures; k++) {
        normalized[i][j][k] = (mfcc[i][j][k] - mean[j]) / (std[j] || 1);
      }
    }
  }
  
  return normalized;
};
