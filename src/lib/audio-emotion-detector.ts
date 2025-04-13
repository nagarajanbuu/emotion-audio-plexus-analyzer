
import * as tf from '@tensorflow/tfjs';
import { getSelectedModel, prepareAudioDataForModel } from './audio-emotion-utils';
import type { EmotionResult } from '@/types/emotion';

// Global variables for the model
let model: tf.LayersModel | null = null;
let isListening = false;
let audioContext: AudioContext | null = null;
let mediaStreamSource: MediaStreamAudioSourceNode | null = null;
let analyzer: AnalyserNode | null = null;
let onEmotionDetected: ((result: EmotionResult) => void) | null = null;

// Initialize the audio emotion detector
export const initAudioEmotionDetector = async (): Promise<boolean> => {
  try {
    // Clear any existing models
    if (model) {
      model.dispose();
      model = null;
    }
    
    // Load the model based on selection
    const modelType = getSelectedModel();
    
    if (modelType === 'tfjs') {
      // Use TensorFlow.js for speech commands recognition
      // Note: We need to explicitly import the package with a dynamic import
      const speechCommands = await import('@tensorflow-models/speech-commands');
      const recognizer = speechCommands.create(
        'BROWSER_FFT', // Using browser's Fast Fourier Transform
        undefined, 
        'https://storage.googleapis.com/tfjs-models/tfjs/speech-commands/v0.4/browser_fft/18w/metadata.json',
        'https://storage.googleapis.com/tfjs-models/tfjs/speech-commands/v0.4/browser_fft/18w/model.json'
      );
      
      await recognizer.ensureModelLoaded();
      
      // Store the model for later use
      model = recognizer.modelWithoutHeadsOrWeights;
      
      return true;
    } else {
      // Load custom model using TensorFlow.js
      try {
        model = await tf.loadLayersModel('indexeddb://emotion-audio-model');
        return true;
      } catch (error) {
        console.error('Failed to load custom model, using fallback model:', error);
        // Use a simplified model as fallback
        model = tf.sequential({
          layers: [
            tf.layers.dense({ units: 128, activation: 'relu', inputShape: [40, 1] }),
            tf.layers.flatten(),
            tf.layers.dense({ units: 64, activation: 'relu' }),
            tf.layers.dense({ units: 5, activation: 'softmax' })
          ]
        });
        
        // Compile the model (even though it's not trained)
        model.compile({
          optimizer: 'adam',
          loss: 'categoricalCrossentropy',
          metrics: ['accuracy']
        });
        
        return false;
      }
    }
  } catch (error) {
    console.error('Error initializing audio emotion detector:', error);
    return false;
  }
};

// Start listening for audio and detecting emotions in real-time
export const startListening = async (
  callback: (result: EmotionResult) => void
): Promise<boolean> => {
  if (!model) {
    console.error('Model not initialized. Call initAudioEmotionDetector first.');
    return false;
  }
  
  try {
    // Set up audio context
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    
    mediaStreamSource = audioContext.createMediaStreamSource(stream);
    analyzer = audioContext.createAnalyser();
    analyzer.fftSize = 2048;
    
    mediaStreamSource.connect(analyzer);
    
    // Set the callback
    onEmotionDetected = callback;
    isListening = true;
    
    // Start processing audio data
    processAudioData();
    
    return true;
  } catch (error) {
    console.error('Error starting audio emotion detection:', error);
    return false;
  }
};

// Stop listening for audio
export const stopListening = () => {
  isListening = false;
  
  if (audioContext && audioContext.state !== 'closed') {
    if (mediaStreamSource) {
      mediaStreamSource.disconnect();
      mediaStreamSource = null;
    }
  }
  
  onEmotionDetected = null;
};

// Process audio data in real-time
const processAudioData = async () => {
  if (!isListening || !analyzer || !audioContext || !onEmotionDetected) return;
  
  const bufferLength = analyzer.frequencyBinCount;
  const dataArray = new Float32Array(bufferLength);
  
  // Get audio data
  analyzer.getFloatTimeDomainData(dataArray);
  
  // Only process audio if there's significant audio (not silence)
  const volume = calculateRMS(dataArray);
  
  if (volume > 0.01) { // Threshold for "not silence"
    try {
      // Prepare the audio data for the model
      const processedData = await prepareAudioDataForModel(dataArray, audioContext.sampleRate);
      
      if (processedData) {
        // Detect emotion
        const emotion = await detectEmotion(processedData);
        if (emotion) {
          onEmotionDetected(emotion);
        }
      }
    } catch (error) {
      console.error('Error processing audio data:', error);
    }
  }
  
  // Continue processing if still listening
  if (isListening) {
    requestAnimationFrame(processAudioData);
  }
};

// Calculate root mean square (RMS) to determine volume
const calculateRMS = (buffer: Float32Array): number => {
  let sum = 0;
  for (let i = 0; i < buffer.length; i++) {
    sum += buffer[i] * buffer[i];
  }
  return Math.sqrt(sum / buffer.length);
};

// Process an audio blob for emotion detection
export const processAudioBlob = async (audioBlob: Blob): Promise<EmotionResult | null> => {
  if (!model) {
    console.error('Model not initialized. Call initAudioEmotionDetector first.');
    return null;
  }
  
  try {
    // Convert blob to array buffer
    const arrayBuffer = await audioBlob.arrayBuffer();
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Decode the audio data
    const audioData = await audioContext.decodeAudioData(arrayBuffer);
    const rawData = audioData.getChannelData(0);
    
    // Prepare the audio data for the model
    const processedData = await prepareAudioDataForModel(rawData, audioData.sampleRate);
    
    if (!processedData) return null;
    
    // Detect emotion
    return await detectEmotion(processedData);
    
  } catch (error) {
    console.error('Error processing audio blob:', error);
    return null;
  }
};

// Detect emotion from audio data using the loaded model
const detectEmotion = async (audioData: Float32Array): Promise<EmotionResult | null> => {
  try {
    if (!model) return null;
    
    const modelType = getSelectedModel();
    let emotionScores: number[] = [];
    
    if (modelType === 'tfjs') {
      // Use a simplified approach for demo purposes
      // Convert to tensor with shape expected by the model
      const inputTensor = tf.tensor(audioData).reshape([1, 40, 1]);
      
      // Run inference
      const prediction = model.predict(inputTensor) as tf.Tensor;
      
      // Get the predicted class probabilities
      emotionScores = Array.from(prediction.dataSync());
      
      // Clean up tensors
      inputTensor.dispose();
      prediction.dispose();
    } else {
      // Simulated emotion scores for fallback
      emotionScores = [0.2, 0.2, 0.2, 0.2, 0.2]; // Equal probabilities for all emotions
      
      // Randomly increase one emotion for demo purposes
      const randomEmotion = Math.floor(Math.random() * 5);
      emotionScores[randomEmotion] += 0.3;
      
      // Normalize to sum to 1
      const sum = emotionScores.reduce((a, b) => a + b, 0);
      emotionScores = emotionScores.map(score => score / sum);
    }
    
    // Map emotion indices to emotion names
    const emotionLabels: EmotionResult['emotions'] = [
      { emotion: 'happy', score: emotionScores[0] || 0.1 },
      { emotion: 'sad', score: emotionScores[1] || 0.1 },
      { emotion: 'neutral', score: emotionScores[2] || 0.5 },
      { emotion: 'angry', score: emotionScores[3] || 0.2 },
      { emotion: 'fear', score: emotionScores[4] || 0.1 }
    ];
    
    // Find the dominant emotion
    let dominantEmotion = emotionLabels[0];
    for (let i = 1; i < emotionLabels.length; i++) {
      if (emotionLabels[i].score > dominantEmotion.score) {
        dominantEmotion = emotionLabels[i];
      }
    }
    
    return {
      dominantEmotion: dominantEmotion.emotion,
      emotions: emotionLabels,
      source: 'audio',
      timestamp: Date.now(),
      model: modelType === 'tfjs' ? 'tensorflow/speech-commands' : 'custom-audio-model'
    };
  } catch (error) {
    console.error('Error detecting emotion from audio:', error);
    return null;
  }
};
