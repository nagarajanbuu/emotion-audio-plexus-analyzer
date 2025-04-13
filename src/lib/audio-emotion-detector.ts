
import * as tf from '@tensorflow/tfjs';
import { getSelectedModel, prepareAudioDataForModel } from './audio-emotion-utils';
import { analyzeAudioEmotion } from './emotion-recognition';
import type { EmotionResult, EmotionType, EmotionScore } from '@/types/emotion';

// Global variables for the model
let model: tf.LayersModel | null = null;
let isListening = false;
let audioContext: AudioContext | null = null;
let mediaStreamSource: MediaStreamAudioSourceNode | null = null;
let analyzer: AnalyserNode | null = null;
let onEmotionDetected: ((emotion: EmotionResult) => void) | null = null;

// Initialize the audio emotion detector
export const initAudioEmotionDetector = async () => {
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
      
      // Store the model - use the base model
      model = recognizer.model as tf.LayersModel;
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

// Start listening to audio
export const startListening = async (callback: (emotion: EmotionResult) => void) => {
  if (isListening) {
    console.warn('Already listening, stop existing listener first.');
    return false;
  }
  
  if (!model) {
    console.error('Model not loaded. Call initAudioEmotionDetector first.');
    return false;
  }
  
  try {
    // Use AudioContext without webkitAudioContext fallback (modern browsers all support AudioContext)
    audioContext = new AudioContext();
    analyzer = audioContext.createAnalyser();
    analyzer.fftSize = 2048;
    
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaStreamSource = audioContext.createMediaStreamSource(stream);
    mediaStreamSource.connect(analyzer);
    
    const bufferLength = analyzer.frequencyBinCount;
    const dataArray = new Float32Array(bufferLength);
    
    isListening = true;
    onEmotionDetected = callback;
    
    const processFrame = () => {
      if (!isListening || !analyzer || !onEmotionDetected) {
        return;
      }
      
      analyzer.getFloatFrequencyData(dataArray);
      
      // Normalize audio data
      const normalizedData = dataArray.map(value => value / 100);
      
      // Prepare audio data for the model - convert to sample rate expected by model (22050Hz)
      const preparedData = prepareAudioDataForModel(normalizedData, 22050);
      
      if (preparedData) {
        // Make a prediction with the model
        tf.tidy(() => {
          if (model) {
            const tensorData = tf.tensor(preparedData).reshape([1, 40, 1]);
            const prediction = model.predict(tensorData) as tf.Tensor;
            
            // Convert the prediction to emotion results
            getEmotionResults(prediction).then(emotionResult => {
              if (onEmotionDetected) {
                onEmotionDetected(emotionResult);
              }
            });
          }
        });
      }
      
      requestAnimationFrame(processFrame);
    };
    
    processFrame();
    return true;
  } catch (error) {
    console.error('Error starting audio capture:', error);
    return false;
  }
};

// Stop listening to audio
export const stopListening = () => {
  isListening = false;
  onEmotionDetected = null;
  
  if (mediaStreamSource) {
    mediaStreamSource.disconnect();
    mediaStreamSource = null;
  }
  
  if (analyzer) {
    analyzer.disconnect();
    analyzer = null;
  }
  
  if (audioContext) {
    audioContext.close();
    audioContext = null;
  }
};

// Process audio blob for emotion recognition
export const processAudioBlob = async (audioBlob: Blob): Promise<EmotionResult | null> => {
  if (!model) {
    console.error('Model not loaded. Call initAudioEmotionDetector first.');
    return null;
  }
  
  try {
    // Convert the audio blob to an audio buffer
    const arrayBuffer = await audioBlob.arrayBuffer();
    const audioContext = new AudioContext();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    
    // Extract audio data from the buffer
    const audioData = audioBuffer.getChannelData(0);
    
    // Prepare audio data for the model with proper sample rate
    const preparedData = prepareAudioDataForModel(audioData, audioBuffer.sampleRate);
    
    if (preparedData) {
      // Make a prediction with the model
      const tensorData = tf.tensor(preparedData).reshape([1, 40, 1]);
      const prediction = model.predict(tensorData) as tf.Tensor;
      
      // Convert the prediction to emotion results
      const emotionResult = await getEmotionResults(prediction);
      
      // Clean up
      tensorData.dispose();
      
      // Return the emotion result
      return emotionResult;
    } else {
      console.warn('No prepared data to process.');
      return null;
    }
  } catch (error) {
    console.error('Error processing audio blob:', error);
    return null;
  }
};

// Get emotion results from the model prediction
const getEmotionResults = async (prediction: tf.Tensor): Promise<EmotionResult> => {
  const emotionProbabilities = await prediction.data() as Float32Array;
  
  // Define emotion labels (must match EmotionType)
  const emotionLabels: EmotionType[] = ['happy', 'sad', 'neutral', 'angry', 'fear'];
  
  // Map emotion probabilities to labels
  const emotions: EmotionScore[] = emotionLabels.map((emotion, index) => ({
    emotion: emotion,
    score: emotionProbabilities[index]
  }));
  
  // Get the dominant emotion
  const dominantEmotion = emotions.reduce((prev, current) => (prev.score > current.score) ? prev : current).emotion;
  
  // Create the emotion result object
  const emotionResult: EmotionResult = {
    dominantEmotion: dominantEmotion,
    emotions: emotions,
    source: 'audio',
    timestamp: Date.now(),
    model: getSelectedModel()
  };
  
  return emotionResult;
};
