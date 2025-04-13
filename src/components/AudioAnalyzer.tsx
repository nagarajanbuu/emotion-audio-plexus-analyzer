
import { useState, useEffect } from 'react';
import InputCard from './InputCard';
import { toast } from 'sonner';
import { analyzeAudioEmotion } from '@/lib/emotion-recognition';
import { 
  startListening, 
  stopListening,
  processAudioBlob
} from '@/lib/audio-emotion-detector';
import ModelSettingsDialog from './ModelSettingsDialog';
import type { EmotionResult } from '@/types/emotion';

// Import the component files
import RecordButton from './audio/RecordButton';
import UploadButton from './audio/UploadButton';
import LiveEmotionDisplay from './audio/LiveEmotionDisplay';
import StatusMessages from './audio/StatusMessages';
import AudioRecorder from './audio/AudioRecorder';
import AudioModelLoader from './audio/AudioModelLoader';

interface AudioAnalyzerProps {
  onEmotionDetected: (emotion: EmotionResult) => void;
}

const AudioAnalyzer = ({ onEmotionDetected }: AudioAnalyzerProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [liveEmotion, setLiveEmotion] = useState<EmotionResult | null>(null);
  const [modelLoadingError, setModelLoadingError] = useState(false);

  // Use the AudioRecorder component for recording functionality
  const { startRecording, stopRecording, processAudio } = AudioRecorder({
    isRecording,
    setIsRecording,
    setIsProcessing,
    setRecordingTime,
    onEmotionDetected,
    onLiveEmotionUpdate: setLiveEmotion
  });

  // Handle file upload - improved to handle multiple formats
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.includes('audio')) {
      toast.error('Please upload an audio file', {
        description: 'Supported formats include: mp3, wav, ogg',
      });
      return;
    }
    
    setIsProcessing(true);
    try {
      // First try processing with the selected audio model
      const result = await processAudioBlob(file);
      
      if (result) {
        // If we got a result, use it
        onEmotionDetected(result);
        toast.success('Audio analysis complete');
      } else {
        // Fall back to the simulated analysis
        await processAudio(file);
      }
    } catch (error) {
      console.error('Error processing audio file:', error);
      toast.error('Error analyzing audio file', {
        description: 'Falling back to basic analysis.',
      });
      await processAudio(file);
    } finally {
      setIsProcessing(false);
      e.target.value = '';
    }
  };

  const handleStartRecording = async () => {
    await startRecording();
    
    // Start real-time emotion detection
    const success = await startListening(result => {
      setLiveEmotion(result);
      // We don't call onEmotionDetected here to avoid constant updates
      // The final result will be sent when recording stops
    });
    
    if (!success && !modelLoadingError) {
      toast('Could not start real-time emotion detection', {
        description: 'Will use basic analysis when recording finishes.',
      });
    }
  };

  const handleStopRecording = () => {
    // Stop real-time emotion detection
    stopListening();
    stopRecording();
  };

  // Handle model settings change
  const handleSettingsChange = () => {
    // Reload audio models when settings change
    setIsModelLoading(true);
    setModelLoadingError(false);
    
    // Reset any existing emotion data
    setLiveEmotion(null);
  };

  return (
    <InputCard 
      title="Audio Input" 
      onSettingsClick={() => {}}
      rightElement={
        <ModelSettingsDialog onSettingsChange={handleSettingsChange} />
      }
    >
      <AudioModelLoader 
        setIsModelLoading={setIsModelLoading}
        setModelLoadingError={setModelLoadingError} 
      />
      
      <div className="space-y-4">
        <UploadButton 
          isRecording={isRecording}
          isProcessing={isProcessing}
          isModelLoading={isModelLoading}
          onFileUpload={handleFileUpload}
        />
        
        <RecordButton 
          isRecording={isRecording}
          isProcessing={isProcessing}
          isModelLoading={isModelLoading}
          recordingTime={recordingTime}
          onStartRecording={handleStartRecording}
          onStopRecording={handleStopRecording}
        />
        
        <LiveEmotionDisplay 
          isRecording={isRecording}
          emotion={liveEmotion}
        />
        
        <StatusMessages 
          isProcessing={isProcessing}
          isModelLoading={isModelLoading}
          modelLoadingError={modelLoadingError}
        />
      </div>
    </InputCard>
  );
};

export default AudioAnalyzer;
