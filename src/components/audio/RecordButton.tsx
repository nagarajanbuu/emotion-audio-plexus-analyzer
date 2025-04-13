
import { useState, useEffect } from 'react';
import { Mic, Square, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RecordButtonProps {
  isRecording: boolean;
  isProcessing: boolean;
  isModelLoading: boolean;
  recordingTime: number;
  onStartRecording: () => void;
  onStopRecording: () => void;
}

const RecordButton = ({
  isRecording,
  isProcessing,
  isModelLoading,
  recordingTime,
  onStartRecording,
  onStopRecording
}: RecordButtonProps) => {
  return (
    <Button
      variant={isRecording ? "destructive" : "secondary"}
      className={`w-full py-6 flex items-center justify-center gap-2 ${
        isRecording ? 'bg-destructive hover:bg-destructive/90' : 'bg-accent text-accent-foreground'
      }`}
      onClick={isRecording ? onStopRecording : onStartRecording}
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
          <Mic className="h-5 w-5" />
          <span>Start Recording</span>
        </>
      )}
    </Button>
  );
};

export default RecordButton;
