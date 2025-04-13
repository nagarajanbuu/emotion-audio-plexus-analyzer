
import { useState, useEffect } from 'react';
import { Smile, Frown, Meh, Angry, AlertCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import type { EmotionResult } from '@/types/emotion';

interface EmotionDisplayProps {
  emotionData: EmotionResult;
}

const EmotionDisplay = ({ emotionData }: EmotionDisplayProps) => {
  const [animate, setAnimate] = useState(false);
  
  useEffect(() => {
    setAnimate(false);
    // Trigger animation after a small delay to ensure the change is noticed
    const timeout = setTimeout(() => setAnimate(true), 100);
    return () => clearTimeout(timeout);
  }, [emotionData]);

  const getEmotionIcon = (emotion: string) => {
    switch (emotion.toLowerCase()) {
      case 'happy':
        return <Smile className="h-6 w-6 text-emotion-happy" />;
      case 'sad':
        return <Frown className="h-6 w-6 text-emotion-sad" />;
      case 'neutral':
        return <Meh className="h-6 w-6 text-emotion-neutral" />;
      case 'angry':
        return <Angry className="h-6 w-6 text-emotion-angry" />;
      case 'fear':
        return <AlertCircle className="h-6 w-6 text-emotion-fear" />;
      default:
        return <Meh className="h-6 w-6 text-muted-foreground" />;
    }
  };

  const getEmotionColor = (emotion: string) => {
    switch (emotion.toLowerCase()) {
      case 'happy':
        return 'text-emotion-happy';
      case 'sad':
        return 'text-emotion-sad';
      case 'neutral':
        return 'text-emotion-neutral';
      case 'angry':
        return 'text-emotion-angry';
      case 'fear':
        return 'text-emotion-fear';
      default:
        return 'text-muted-foreground';
    }
  };

  const getEmotionBarColor = (emotion: string) => {
    switch (emotion.toLowerCase()) {
      case 'happy':
        return 'bg-emotion-happy';
      case 'sad':
        return 'bg-emotion-sad';
      case 'neutral':
        return 'bg-emotion-neutral';
      case 'angry':
        return 'bg-emotion-angry';
      case 'fear':
        return 'bg-emotion-fear';
      default:
        return 'bg-muted';
    }
  };

  const sortedEmotions = [...emotionData.emotions].sort((a, b) => b.score - a.score);
  const dominantEmotion = sortedEmotions[0]?.emotion || 'neutral';
  
  return (
    <div className="bg-card rounded-lg border p-6 shadow-sm transition-all duration-300 animate-fade-in">
      <h2 className="text-xl font-medium mb-6">Emotion Analysis</h2>
      
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col items-center justify-center p-4 bg-muted/20 rounded-lg">
          <div className="text-center mb-3">
            <div className="inline-flex items-center justify-center p-3 bg-background rounded-full mb-3 subtle-shadow">
              {getEmotionIcon(dominantEmotion)}
            </div>
            <h3 className={cn("text-lg font-medium capitalize", getEmotionColor(dominantEmotion))}>
              {dominantEmotion}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">Dominant Emotion</p>
          </div>
          
          <div className="text-xs text-muted-foreground">
            Confidence: {Math.round(sortedEmotions[0]?.score * 100)}%
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Emotion Breakdown</h3>
          
          {sortedEmotions.map((item, index) => (
            <div key={item.emotion} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getEmotionIcon(item.emotion)}
                  <span className="text-sm font-medium capitalize">{item.emotion}</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {Math.round(item.score * 100)}%
                </span>
              </div>
              <Progress 
                value={item.score * 100} 
                className={cn(
                  "h-2 transition-all duration-500 ease-out", 
                  animate ? "opacity-100" : "opacity-50",
                  getEmotionBarColor(item.emotion)
                )}
                style={{ 
                  width: animate ? '100%' : '0%', 
                  transitionDelay: `${index * 100}ms`
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EmotionDisplay;
