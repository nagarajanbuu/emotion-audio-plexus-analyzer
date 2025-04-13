
import { Video, Square, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import InputCard from './InputCard';
import { useVideoRecorder } from '@/hooks/use-video-recorder';
import ModelSettingsDialog from './ModelSettingsDialog';
import { useRef } from 'react';
import type { EmotionResult } from '@/types/emotion';

interface VideoAnalyzerProps {
  onEmotionDetected: (emotion: EmotionResult) => void;
}

const VideoAnalyzer = ({ onEmotionDetected }: VideoAnalyzerProps) => {
  const {
    isRecording,
    recordingTime,
    isProcessing,
    videoPreview,
    isLivePreview,
    videoRef,
    liveEmotion,
    isModelLoading,
    faceCount,
    startRecording,
    stopRecording,
    handleFileUpload
  } = useVideoRecorder(onEmotionDetected);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle model settings change
  const handleSettingsChange = () => {
    // This will trigger model reload in the useVideoRecorder hook on next recording
  };
  
  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Supported video formats
  const supportedFormats = ".mp4,.webm,.mov,.avi,.flv,.mkv";

  return (
    <InputCard 
      title="Video Input"
      rightElement={
        <ModelSettingsDialog onSettingsChange={handleSettingsChange} />
      }
    >
      <div className="space-y-4">
        <div className="relative block w-full">
          <input
            ref={fileInputRef}
            type="file"
            accept={supportedFormats}
            onChange={handleFileUpload}
            disabled={isRecording || isProcessing || isModelLoading}
            className="sr-only"
          />
          <Button 
            variant="outline" 
            className="w-full py-6 flex items-center justify-center gap-2"
            disabled={isRecording || isProcessing || isModelLoading}
            onClick={handleUploadClick}
          >
            <Video className="h-5 w-5" />
            <span>Upload Video</span>
          </Button>
          <div className="mt-1 text-xs text-muted-foreground text-center">
            Supported formats: MP4, WebM, MOV, AVI, FLV, MKV
          </div>
        </div>
        
        <Button
          variant={isRecording ? "destructive" : "secondary"}
          className={`w-full py-6 flex items-center justify-center gap-2 ${
            isRecording ? 'bg-destructive hover:bg-destructive/90' : 'bg-accent text-accent-foreground'
          }`}
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isProcessing || isModelLoading}
        >
          {isModelLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Loading models...</span>
            </>
          ) : isRecording ? (
            <>
              <Square className="h-5 w-5" />
              <span>Stop Recording {recordingTime > 0 && `(${recordingTime}s)`}</span>
            </>
          ) : (
            <>
              <Video className="h-5 w-5" />
              <span>Start Recording</span>
            </>
          )}
        </Button>
        
        <div className="relative mt-4 rounded-lg overflow-hidden bg-muted/20 aspect-video">
          {isLivePreview ? (
            <video 
              ref={videoRef}
              className="w-full h-full object-cover"
              autoPlay
              playsInline
              muted
            />
          ) : videoPreview ? (
            <video 
              ref={videoRef}
              src={videoPreview}
              className="w-full h-full object-cover"
              controls
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
              <p className="text-sm">Video preview will appear here</p>
            </div>
          )}
          {isRecording && (
            <div className="absolute top-2 right-2 px-2 py-1 bg-destructive text-destructive-foreground text-xs rounded-full animate-pulse-light">
              REC
            </div>
          )}
          
          {/* Face Count and Live Emotion Display */}
          {isRecording && liveEmotion && (
            <div className="absolute bottom-2 left-2 right-2 bg-background/80 backdrop-blur-sm p-2 rounded-md text-xs">
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-medium">Faces detected: </span>
                  <span>{faceCount || 0}</span>
                </div>
                <div>
                  <span className="font-medium">Primary emotion: </span>
                  <span className="capitalize">{liveEmotion.dominantEmotion}</span>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {isProcessing && (
          <div className="text-center text-sm text-muted-foreground animate-pulse mt-4">
            Processing video...
          </div>
        )}
      </div>
    </InputCard>
  );
};

export default VideoAnalyzer;
