
import { Upload, AudioLines } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRef } from 'react';

interface UploadButtonProps {
  isRecording: boolean;
  isProcessing: boolean;
  isModelLoading: boolean;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const UploadButton = ({ 
  isRecording, 
  isProcessing, 
  isModelLoading, 
  onFileUpload 
}: UploadButtonProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="relative block w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        onChange={onFileUpload}
        disabled={isRecording || isProcessing || isModelLoading}
        className="sr-only"
      />
      <Button 
        variant="outline" 
        className="w-full py-6 flex items-center justify-center gap-2"
        disabled={isRecording || isProcessing || isModelLoading}
        onClick={handleButtonClick}
      >
        <AudioLines className="h-5 w-5" />
        <span>Upload Audio</span>
      </Button>
    </div>
  );
};

export default UploadButton;
