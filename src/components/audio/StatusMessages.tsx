
interface StatusMessagesProps {
  isProcessing: boolean;
  isModelLoading: boolean;
  modelLoadingError: boolean;
}

const StatusMessages = ({ 
  isProcessing, 
  isModelLoading, 
  modelLoadingError 
}: StatusMessagesProps) => {
  if (isProcessing) {
    return (
      <div className="text-center text-sm text-muted-foreground animate-pulse mt-4">
        Processing audio...
      </div>
    );
  }
  
  if (modelLoadingError && !isProcessing && !isModelLoading) {
    return (
      <div className="text-center text-xs text-amber-500 mt-2">
        Using basic emotion analysis (advanced model not loaded)
      </div>
    );
  }
  
  return null;
};

export default StatusMessages;
