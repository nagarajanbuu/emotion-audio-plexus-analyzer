
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from '@/components/Header';
import AudioAnalyzer from '@/components/AudioAnalyzer';
import VideoAnalyzer from '@/components/VideoAnalyzer';
import EmotionDisplay from '@/components/EmotionDisplay';
import EmotionChart from '@/components/EmotionChart';
import { fuseEmotionResults } from '@/lib/emotion-fusion';
import type { EmotionResult } from '@/types/emotion';

const Index = () => {
  const [audioEmotion, setAudioEmotion] = useState<EmotionResult | null>(null);
  const [videoEmotion, setVideoEmotion] = useState<EmotionResult | null>(null);
  const [combinedEmotion, setCombinedEmotion] = useState<EmotionResult | null>(null);
  const [activeTab, setActiveTab] = useState<'audio' | 'video' | 'combined'>('audio');
  
  // Update combined emotion when either audio or video emotion changes
  useEffect(() => {
    if (audioEmotion || videoEmotion) {
      const fusedResult = fuseEmotionResults(audioEmotion, videoEmotion);
      if (fusedResult) {
        setCombinedEmotion(fusedResult);
        
        // Switch to combined tab if both sources have data
        if (audioEmotion && videoEmotion) {
          setActiveTab('combined');
        }
      }
    }
  }, [audioEmotion, videoEmotion]);
  
  // Handle audio emotion detection
  const handleAudioEmotionDetected = (emotion: EmotionResult) => {
    setAudioEmotion(emotion);
    
    // Switch to audio tab when we get a new audio emotion
    setActiveTab('audio');
  };
  
  // Handle video emotion detection
  const handleVideoEmotionDetected = (emotion: EmotionResult) => {
    setVideoEmotion(emotion);
    
    // Switch to video tab when we get a new video emotion
    setActiveTab('video');
  };
  
  // Helper function to determine which emotion to display
  const getSelectedEmotion = (): EmotionResult | null => {
    switch (activeTab) {
      case 'audio':
        return audioEmotion;
      case 'video':
        return videoEmotion;
      case 'combined':
        return combinedEmotion;
      default:
        return audioEmotion || videoEmotion || combinedEmotion;
    }
  };
  
  // Get the current emotion to display
  const currentEmotion = getSelectedEmotion();
  
  return (
    <div className="min-h-screen bg-muted/20">
      <Header />
      
      <main className="container px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-8">
            <AudioAnalyzer onEmotionDetected={handleAudioEmotionDetected} />
            <VideoAnalyzer onEmotionDetected={handleVideoEmotionDetected} />
          </div>
          
          <div className="space-y-8">
            {currentEmotion ? (
              <>
                <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="audio" disabled={!audioEmotion}>Audio</TabsTrigger>
                    <TabsTrigger value="video" disabled={!videoEmotion}>Video</TabsTrigger>
                    <TabsTrigger value="combined" disabled={!combinedEmotion}>Combined</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value={activeTab} className="mt-6">
                    <EmotionDisplay emotionData={currentEmotion} />
                  </TabsContent>
                </Tabs>
                
                <EmotionChart emotionData={currentEmotion} />
              </>
            ) : (
              <Card>
                <CardContent className="p-10 flex flex-col items-center justify-center text-center">
                  <div className="text-6xl mb-4">😊</div>
                  <h2 className="text-xl font-medium mb-2">Welcome to Emotion Recognition</h2>
                  <p className="text-muted-foreground">
                    Upload or record audio or video to get started with emotion detection.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
      
      <footer className="py-6 border-t mt-12">
        <div className="container text-center text-xs text-muted-foreground">
          <p>Multimodal Emotion Recognition System</p>
          <p className="mt-1">Using RAVDESS and CREMA-D datasets for training</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
