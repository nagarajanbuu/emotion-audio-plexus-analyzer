
import { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { processAudioBlob } from '@/lib/audio-emotion-detector';
import { analyzeAudioEmotion } from '@/lib/emotion-recognition';
import type { EmotionResult } from '@/types/emotion';

interface AudioRecorderProps {
  isRecording: boolean;
  setIsRecording: (isRecording: boolean) => void;
  setIsProcessing: (isProcessing: boolean) => void;
  setRecordingTime: (time: number) => void;
  onEmotionDetected: (emotion: EmotionResult) => void;
  onLiveEmotionUpdate: (emotion: EmotionResult | null) => void;
}

const AudioRecorder = ({
  isRecording,
  setIsRecording,
  setIsProcessing,
  setRecordingTime,
  onEmotionDetected,
  onLiveEmotionUpdate
}: AudioRecorderProps) => {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Handle starting recording
  const startRecording = async () => {
    try {
      // Traditional MediaRecorder for saving audio
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        
        setIsProcessing(true);
        
        try {
          // Process audio with the preferred model
          const result = await processAudioBlob(audioBlob);
          
          if (result) {
            // If we got a result from the audio model, use it
            onEmotionDetected(result);
            toast.success('Audio analysis complete');
          } else {
            // Fall back to simulated analysis
            await processAudio(audioBlob);
          }
        } catch (error) {
          console.error('Error processing audio:', error);
          toast.error('Error analyzing audio', {
            description: 'Falling back to basic analysis.',
          });
          await processAudio(audioBlob);
        } finally {
          setIsProcessing(false);
          // Stop all tracks to release the microphone
          stream.getTracks().forEach(track => track.stop());
        }
      };

      // Start recording with MediaRecorder
      mediaRecorder.start(1000);
      
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timer - Fixed: Using setRecordingTime with a direct number instead of function
      let seconds = 0;
      timerRef.current = setInterval(() => {
        seconds += 1;
        setRecordingTime(seconds);
      }, 1000);
      
      toast('Recording started');
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast.error('Could not access microphone', {
        description: 'Ensure you have granted microphone access in your browser settings.',
        duration: 5000,
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      toast('Recording stopped');
      onLiveEmotionUpdate(null);
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    try {
      // Fall back to the simulated analysis
      const fallbackResult = await analyzeAudioEmotion(audioBlob);
      onEmotionDetected(fallbackResult);
      toast('Used fallback audio analysis', {
        description: 'Advanced model not available',
      });
    } catch (error) {
      console.error('Error with fallback audio processing:', error);
      
      // If all else fails, create a basic neutral result
      const basicFallbackResult: EmotionResult = {
        dominantEmotion: 'neutral',
        emotions: [
          { emotion: 'happy', score: 0.1 },
          { emotion: 'sad', score: 0.1 },
          { emotion: 'neutral', score: 0.5 },
          { emotion: 'angry', score: 0.2 },
          { emotion: 'fear', score: 0.1 }
        ],
        source: 'audio',
        timestamp: Date.now()
      };
      
      onEmotionDetected(basicFallbackResult);
      toast.error('Error analyzing audio', {
        description: 'Used basic fallback analysis.',
      });
    }
  };
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
      }
    };
  }, [isRecording]);
  
  return { startRecording, stopRecording, processAudio };
};

export default AudioRecorder;
