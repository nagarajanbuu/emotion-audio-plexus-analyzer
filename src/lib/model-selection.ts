
// Model selection utilities

// Audio model options
export const audioModelOptions = [
  {
    id: 'tfjs',
    name: 'TensorFlow.js Speech Commands',
    description: 'Pre-trained model optimized for speech recognition, adapted for emotion detection.'
  },
  {
    id: 'ravdess',
    name: 'RAVDESS Dataset Model',
    description: 'Custom model trained on the RAVDESS emotional speech dataset.'
  },
  {
    id: 'crema',
    name: 'CREMA-D Dataset Model',
    description: 'Custom model trained on the CREMA-D emotional speech dataset.'
  },
  {
    id: 'combined',
    name: 'Combined RAVDESS + CREMA-D',
    description: 'Model trained on both RAVDESS and CREMA-D datasets for better generalization.'
  },
  {
    id: 'custom-audio',
    name: 'Custom Audio Model',
    description: 'Your uploaded custom audio emotion recognition model.'
  }
];

// Video model options
export const videoModelOptions = [
  {
    id: 'face-api',
    name: 'Face-API.js',
    description: 'Pre-trained facial expression recognition model.'
  },
  {
    id: 'ravdess-video',
    name: 'RAVDESS Video Model',
    description: 'Model trained on the RAVDESS emotional video dataset.'
  },
  {
    id: 'custom-video',
    name: 'Custom Video Model',
    description: 'Your uploaded custom video emotion recognition model.',
    usesAudio: false
  },
  {
    id: 'multimodal',
    name: 'Multimodal Model',
    description: 'Combined audio-visual model for improved accuracy.',
    usesAudio: true
  }
];

// Local storage keys
const AUDIO_MODEL_KEY = 'emotion-recognition-audio-model';
const VIDEO_MODEL_KEY = 'emotion-recognition-video-model';
const CUSTOM_AUDIO_MODEL_PATH_KEY = 'emotion-recognition-custom-audio-model-path';
const CUSTOM_VIDEO_MODEL_PATH_KEY = 'emotion-recognition-custom-video-model-path';

// Get selected audio model
export const getSelectedAudioModel = (): string => {
  return localStorage.getItem(AUDIO_MODEL_KEY) || 'tfjs';
};

// Set selected audio model
export const setSelectedAudioModel = (model: string): void => {
  localStorage.setItem(AUDIO_MODEL_KEY, model);
};

// Get selected video model
export const getSelectedVideoModel = (): string => {
  return localStorage.getItem(VIDEO_MODEL_KEY) || 'face-api';
};

// Set selected video model
export const setSelectedVideoModel = (model: string): void => {
  localStorage.setItem(VIDEO_MODEL_KEY, model);
};

// Get custom model path
export const getCustomModelPath = (modelType: 'audio' | 'video'): string | null => {
  const key = modelType === 'audio' 
    ? CUSTOM_AUDIO_MODEL_PATH_KEY
    : CUSTOM_VIDEO_MODEL_PATH_KEY;
  return localStorage.getItem(key);
};

// Set custom model path
export const setCustomModelPath = (
  modelType: 'audio' | 'video',
  path: string
): void => {
  const key = modelType === 'audio'
    ? CUSTOM_AUDIO_MODEL_PATH_KEY
    : CUSTOM_VIDEO_MODEL_PATH_KEY;
  localStorage.setItem(key, path);
};

// Store a custom model file
export const storeCustomModel = async (
  file: File,
  modelType: 'audio' | 'video'
): Promise<string> => {
  try {
    // In a real app, you would upload to a server or use IndexedDB
    // For this example, we'll use object URLs (not persistent across sessions)
    const modelUrl = URL.createObjectURL(file);
    
    // In a real implementation, you'd want to use IndexedDB for the model
    // For now, we'll just store the URL
    return modelUrl;
  } catch (error) {
    console.error(`Error storing custom ${modelType} model:`, error);
    throw error;
  }
};
