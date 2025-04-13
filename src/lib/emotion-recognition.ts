
import type { EmotionResult } from '@/types/emotion';

// Fallback implementation for audio emotion analysis
export const analyzeAudioEmotion = async (audioBlob: Blob): Promise<EmotionResult> => {
  // This is a simplified version that would be replaced with actual ML
  // In a real implementation, this would use a trained model
  
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Generate random emotion scores that add up to 1.0
  const emotions: EmotionResult['emotions'] = [
    { emotion: 'happy', score: 0 },
    { emotion: 'sad', score: 0 },
    { emotion: 'neutral', score: 0 },
    { emotion: 'angry', score: 0 },
    { emotion: 'fear', score: 0 }
  ];
  
  // Randomly assign stronger weight to one emotion
  const dominantIndex = Math.floor(Math.random() * emotions.length);
  emotions[dominantIndex].score = 0.4 + Math.random() * 0.3; // Between 0.4 and 0.7
  
  // Distribute remaining probability
  const remainingProbability = 1.0 - emotions[dominantIndex].score;
  let distributedProbability = 0;
  
  for (let i = 0; i < emotions.length; i++) {
    if (i !== dominantIndex) {
      // Generate a random value for non-dominant emotions
      if (i < emotions.length - 1) {
        const maxValue = remainingProbability - distributedProbability - (emotions.length - i - 2) * 0.01;
        emotions[i].score = Math.random() * Math.max(0, maxValue);
        distributedProbability += emotions[i].score;
      } else {
        // Last emotion gets the remainder to ensure sum is 1.0
        emotions[i].score = remainingProbability - distributedProbability;
      }
    }
  }
  
  return {
    dominantEmotion: emotions[dominantIndex].emotion,
    emotions: emotions,
    source: 'audio',
    timestamp: Date.now(),
    model: 'fallback-simulation'
  };
};

// Fallback implementation for video emotion analysis
export const analyzeVideoEmotion = async (videoBlob: Blob): Promise<EmotionResult> => {
  // This is a simplified version that would be replaced with actual ML
  // In a real implementation, this would use a trained model with face detection
  
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Generate random emotion scores that add up to 1.0
  const emotions: EmotionResult['emotions'] = [
    { emotion: 'happy', score: 0 },
    { emotion: 'sad', score: 0 },
    { emotion: 'neutral', score: 0 },
    { emotion: 'angry', score: 0 },
    { emotion: 'fear', score: 0 }
  ];
  
  // Randomly assign stronger weight to one emotion
  const dominantIndex = Math.floor(Math.random() * emotions.length);
  emotions[dominantIndex].score = 0.4 + Math.random() * 0.3; // Between 0.4 and 0.7
  
  // Distribute remaining probability
  const remainingProbability = 1.0 - emotions[dominantIndex].score;
  let distributedProbability = 0;
  
  for (let i = 0; i < emotions.length; i++) {
    if (i !== dominantIndex) {
      // Generate a random value for non-dominant emotions
      if (i < emotions.length - 1) {
        const maxValue = remainingProbability - distributedProbability - (emotions.length - i - 2) * 0.01;
        emotions[i].score = Math.random() * Math.max(0, maxValue);
        distributedProbability += emotions[i].score;
      } else {
        // Last emotion gets the remainder to ensure sum is 1.0
        emotions[i].score = remainingProbability - distributedProbability;
      }
    }
  }
  
  return {
    dominantEmotion: emotions[dominantIndex].emotion,
    emotions: emotions,
    source: 'video',
    timestamp: Date.now(),
    model: 'fallback-simulation'
  };
};
