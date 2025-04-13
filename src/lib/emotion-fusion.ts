
import type { EmotionResult } from '@/types/emotion';

// Enhanced weights for audio and video modalities
// These can be adjusted based on confidence or context
const AUDIO_WEIGHT = 0.4;
const VIDEO_WEIGHT = 0.6;

// Advanced fusion strategies
type FusionStrategy = 'weighted' | 'adaptive' | 'confidence' | 'decision';

/**
 * Fuse audio and video emotion results with improved multi-modal integration
 */
export const fuseEmotionResults = (
  audioEmotion: EmotionResult | null,
  videoEmotion: EmotionResult | null,
  strategy: FusionStrategy = 'weighted'
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
  
  // Create maps of emotions for easy lookup
  const audioEmotionMap = new Map(
    audioEmotions.map(item => [item.emotion, item.score])
  );
  
  const videoEmotionMap = new Map(
    videoEmotions.map(item => [item.emotion, item.score])
  );
  
  // Get unique emotion types from both sources
  const allEmotionTypes = new Set([
    ...audioEmotions.map(e => e.emotion),
    ...videoEmotions.map(e => e.emotion)
  ]);
  
  let fusedEmotions;
  
  switch (strategy) {
    case 'adaptive':
      // Adapt weights based on confidence levels
      const audioConfidence = calculateConfidence(audioEmotions);
      const videoConfidence = calculateConfidence(videoEmotions);
      const totalConfidence = audioConfidence + videoConfidence;
      
      const adaptiveAudioWeight = totalConfidence > 0 ? audioConfidence / totalConfidence : 0.5;
      const adaptiveVideoWeight = totalConfidence > 0 ? videoConfidence / totalConfidence : 0.5;
      
      fusedEmotions = Array.from(allEmotionTypes).map(emotion => {
        const audioScore = audioEmotionMap.get(emotion) || 0;
        const videoScore = videoEmotionMap.get(emotion) || 0;
        
        return {
          emotion,
          score: audioScore * adaptiveAudioWeight + videoScore * adaptiveVideoWeight
        };
      });
      break;
      
    case 'confidence':
      // Choose the modality with higher confidence for the final decision
      const audioMaxScore = Math.max(...audioEmotions.map(e => e.score));
      const videoMaxScore = Math.max(...videoEmotions.map(e => e.score));
      
      fusedEmotions = audioMaxScore > videoMaxScore ? audioEmotions : videoEmotions;
      break;
      
    case 'decision':
      // Take the highest scoring emotion from either modality
      fusedEmotions = Array.from(allEmotionTypes).map(emotion => {
        const audioScore = audioEmotionMap.get(emotion) || 0;
        const videoScore = videoEmotionMap.get(emotion) || 0;
        
        return {
          emotion,
          score: Math.max(audioScore, videoScore)
        };
      });
      break;
      
    case 'weighted':
    default:
      // Standard weighted fusion (default)
      fusedEmotions = Array.from(allEmotionTypes).map(emotion => {
        const audioScore = audioEmotionMap.get(emotion) || 0;
        const videoScore = videoEmotionMap.get(emotion) || 0;
        
        return {
          emotion,
          score: audioScore * AUDIO_WEIGHT + videoScore * VIDEO_WEIGHT
        };
      });
      break;
  }
  
  // Sort by score to find dominant emotion
  fusedEmotions.sort((a, b) => b.score - a.score);
  const dominantEmotion = fusedEmotions[0].emotion;
  
  return {
    dominantEmotion,
    emotions: fusedEmotions,
    source: 'multimodal',
    timestamp: Date.now(),
    model: `audio-visual-fusion-${strategy}`
  };
};

/**
 * Calculate confidence level based on emotion score distribution
 * Higher values when one emotion has much higher score than others
 */
const calculateConfidence = (emotions: EmotionResult['emotions']): number => {
  if (!emotions || emotions.length === 0) return 0;
  
  // Sort emotions by score in descending order
  const sortedEmotions = [...emotions].sort((a, b) => b.score - a.score);
  
  // If there's a clear dominant emotion (large gap between top and second scores), confidence is high
  if (sortedEmotions.length > 1) {
    const gap = sortedEmotions[0].score - sortedEmotions[1].score;
    return gap * 5; // Scale the gap for better confidence representation
  }
  
  // If only one emotion, use its score directly
  return sortedEmotions[0].score;
};
