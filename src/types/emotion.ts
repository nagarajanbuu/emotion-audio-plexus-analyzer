
export type EmotionType = 'happy' | 'sad' | 'neutral' | 'angry' | 'fear' | 'fearful';

export interface EmotionScore {
  emotion: EmotionType;
  score: number;
}

export interface EmotionResult {
  dominantEmotion: EmotionType;
  emotions: EmotionScore[];
  source: 'audio' | 'video' | 'multimodal';
  timestamp: number;
  model?: string;
}
