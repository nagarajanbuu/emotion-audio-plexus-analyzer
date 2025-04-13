
// Audio emotion utility functions

// Global state variables
let isModelLoading = false;
let selectedModel = 'tfjs';

// Get/set model loading state
export const getModelLoading = () => isModelLoading;
export const setModelLoading = (loading: boolean) => {
  isModelLoading = loading;
};

// Get/set selected model
export const getSelectedModel = () => selectedModel;
export const setSelectedModel = (model: string) => {
  selectedModel = model;
};

// Utility function to convert audio data to the format needed for model inference
export const prepareAudioDataForModel = async (audioData: Float32Array, sampleRate: number) => {
  try {
    // We'll use TensorFlow.js for audio processing
    const { tensor } = await import('@tensorflow/tfjs');
    
    // Assume a standard length for the audio data
    const standardLength = 22050; // 1 second at 22050Hz
    
    // Resize or pad the audio data to the standard length
    let processedData;
    if (audioData.length > standardLength) {
      // Take a section from the middle
      const startIndex = Math.floor((audioData.length - standardLength) / 2);
      processedData = audioData.slice(startIndex, startIndex + standardLength);
    } else if (audioData.length < standardLength) {
      // Pad with zeros
      processedData = new Float32Array(standardLength);
      processedData.set(audioData);
    } else {
      processedData = audioData;
    }
    
    // Normalize the audio data
    const maxAbsValue = Math.max(...processedData.map(Math.abs));
    if (maxAbsValue > 0) {
      for (let i = 0; i < processedData.length; i++) {
        processedData[i] = processedData[i] / maxAbsValue;
      }
    }
    
    return processedData;
  } catch (error) {
    console.error('Error preparing audio data:', error);
    return null;
  }
};
