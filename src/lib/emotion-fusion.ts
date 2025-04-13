
import type { EmotionResult } from '@/types/emotion';

// Weights for audio and video modalities
const AUDIO_WEIGHT = 0.4;
const VIDEO_WEIGHT = 0.6;

// Fuse audio and video emotion results
export const fuseEmotionResults = (
  audioEmotion: EmotionResult | null,
  videoEmotion: EmotionResult | null
): EmotionResult | null => {
  // If only one modality has results, return that one
  if (audioEmotion && !videoEmotion) {
    return audioEmotion;
  } else if (!audioEmotion && videoEmotion) {
    return videoEmotion;
  } else if (!audioEmotion && !videoEmotion) {
    return null;
  }
  
  // We have both audio and video results, perform fusion
  const audioEmotions = audioEmotion!.emotions;
  const videoEmotions = videoEmotion!.emotions;
  
  // Create a map of emotions from audio result for easy lookup
  const audioEmotionMap = new Map(
    audioEmotions.map(item => [item.emotion, item.score])
  );
  
  // Weighted fusion of audio and video emotions
  const fusedEmotions = videoEmotions.map(videoItem => {
    const audioScore = audioEmotionMap.get(videoItem.emotion) || 0;
    return {
      emotion: videoItem.emotion,
      score: videoItem.score * VIDEO_WEIGHT + audioScore * AUDIO_WEIGHT
    };
  });
  
  // Sort by score to find dominant emotion
  fusedEmotions.sort((a, b) => b.score - a.score);
  const dominantEmotion = fusedEmotions[0].emotion;
  
  return {
    dominantEmotion,
    emotions: fusedEmotions,
    source: 'multimodal',
    timestamp: Date.now(),
    model: 'audio-visual-fusion'
  };
};
