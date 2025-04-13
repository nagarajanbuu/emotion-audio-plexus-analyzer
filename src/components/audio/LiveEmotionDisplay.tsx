
import type { EmotionResult } from '@/types/emotion';

interface LiveEmotionDisplayProps {
  isRecording: boolean;
  emotion: EmotionResult | null;
}

const LiveEmotionDisplay = ({ isRecording, emotion }: LiveEmotionDisplayProps) => {
  if (!isRecording || !emotion) return null;
  
  return (
    <div className="bg-background/80 backdrop-blur-sm p-4 rounded-md text-sm border space-y-2">
      <div className="flex justify-between items-center">
        <div>
          <span className="font-medium">Primary emotion: </span>
          <span className="capitalize font-bold">{emotion.dominantEmotion}</span>
        </div>
        {emotion.model && (
          <div className="text-xs text-muted-foreground">
            <span>Model: {emotion.model.split('/').pop()}</span>
          </div>
        )}
      </div>
      
      <div className="grid gap-1 mt-2">
        {emotion.emotions.map(item => (
          <div key={item.emotion} className="flex items-center justify-between">
            <span className="capitalize">{item.emotion}:</span>
            <div className="flex items-center gap-2">
              <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full" 
                  style={{ width: `${item.score * 100}%` }}
                />
              </div>
              <span className="text-xs w-10 text-right">
                {Math.round(item.score * 100)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LiveEmotionDisplay;
