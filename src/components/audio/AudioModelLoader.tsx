
import { useEffect } from 'react';
import { toast } from 'sonner';
import { initAudioEmotionDetector } from '@/lib/audio-emotion-detector';
import { getSelectedModel } from '@/lib/audio-emotion-utils';

interface AudioModelLoaderProps {
  setIsModelLoading: (isLoading: boolean) => void;
  setModelLoadingError: (hasError: boolean) => void;
}

const AudioModelLoader = ({ 
  setIsModelLoading, 
  setModelLoadingError 
}: AudioModelLoaderProps) => {
  useEffect(() => {
    const loadModels = async () => {
      setIsModelLoading(true);
      setModelLoadingError(false);
      
      try {
        console.log('Loading audio models...');
        const modelLoaded = await initAudioEmotionDetector();
        setIsModelLoading(false);
        
        if (modelLoaded) {
          const modelType = getSelectedModel();
          toast.success('Audio analysis model loaded', {
            description: `Using ${modelType} for audio analysis`
          });
          console.log('Audio models loaded successfully with type:', modelType);
        } else {
          setModelLoadingError(true);
          toast.error('Error loading audio analysis model', {
            description: 'Using fallback audio analysis instead.',
            duration: 5000,
          });
          console.log('Using fallback model for audio analysis');
        }
      } catch (error) {
        console.error('Error initializing audio models:', error);
        setIsModelLoading(false);
        setModelLoadingError(true);
        toast.error('Error initializing audio models', {
          description: 'Will use fallback analysis when needed.',
          duration: 5000,
        });
      }
    };
    
    loadModels();
  }, [setIsModelLoading, setModelLoadingError]);
  
  return null;
};

export default AudioModelLoader;
