
import { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { loadFaceApiModels, startVideoProcessing, stopVideoProcessing, processVideoFile } from '@/lib/video-emotion-detector';
import { analyzeVideoEmotion } from '@/lib/emotion-recognition';
import type { EmotionResult } from '@/types/emotion';

export const useVideoRecorder = (onEmotionDetected: (emotion: EmotionResult) => void) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [isLivePreview, setIsLivePreview] = useState(false);
  const [liveEmotion, setLiveEmotion] = useState<EmotionResult | null>(null);
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [faceCount, setFaceCount] = useState(0);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Load models on component mount
  useEffect(() => {
    const loadModels = async () => {
      setIsModelLoading(true);
      try {
        const success = await loadFaceApiModels();
        if (!success) {
          toast.error('Failed to load face detection models', {
            description: 'Using fallback analysis instead.'
          });
        }
      } catch (error) {
        console.error('Error loading face detection models:', error);
        toast.error('Error loading face detection models', {
          description: 'Using fallback analysis instead.'
        });
      } finally {
        setIsModelLoading(false);
      }
    };
    
    loadModels();
    
    // Cleanup on unmount
    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      stopVideoProcessing();
    };
  }, []);

  // Start recording video
  const startRecording = async () => {
    try {
      // Get user media stream
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      streamRef.current = stream;
      
      // Set up video preview
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true;
        await videoRef.current.play();
        setIsLivePreview(true);
      }
      
      // Create media recorder
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      
      // Handle data available
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };
      
      // Handle recording stop
      mediaRecorder.onstop = () => {
        // Create video blob
        const videoBlob = new Blob(chunksRef.current, { type: 'video/webm' });
        
        // Create URL for the video
        const videoURL = URL.createObjectURL(videoBlob);
        setVideoPreview(videoURL);
        setIsLivePreview(false);
        
        // Stop the stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
        
        // Process the video for emotion detection
        setIsProcessing(true);
        try {
          // Process with Face-API.js
          let result: EmotionResult | null = null;
          
          if (videoRef.current) {
            videoRef.current.src = videoURL;
            videoRef.current.muted = false;
            
            result = await processVideoFile(
              videoBlob, 
              (progress) => console.log(`Processing: ${progress}%`),
              videoRef.current
            );
          }
          
          if (result) {
            onEmotionDetected(result);
            toast.success('Video analysis complete');
          } else {
            // Fall back to the simulated analysis
            const fallbackResult = await analyzeVideoEmotion(videoBlob);
            onEmotionDetected(fallbackResult);
            toast.info('Used fallback video analysis', {
              description: 'Advanced model not available',
            });
          }
        } catch (error) {
          console.error('Error processing video:', error);
          toast.error('Error analyzing video', {
            description: 'Using fallback analysis.',
          });
          
          try {
            const fallbackResult = await analyzeVideoEmotion(videoBlob);
            onEmotionDetected(fallbackResult);
          } catch (fallbackError) {
            console.error('Error with fallback video processing:', fallbackError);
          }
        } finally {
          setIsProcessing(false);
        }
      };
      
      // Start recording
      mediaRecorder.start(1000); // Capture in 1-second chunks
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timer
      timerRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      // Start emotion detection
      if (videoRef.current) {
        startVideoProcessing(videoRef.current, (emotion, faces) => {
          setLiveEmotion(emotion);
          setFaceCount(faces);
        });
      }
      
      toast.success('Recording started');
    } catch (error) {
      console.error('Error starting video recording:', error);
      toast.error('Could not start recording', {
        description: 'Please make sure you have granted camera and microphone permissions.',
      });
    }
  };

  // Stop recording video
  const stopRecording = () => {
    if (!mediaRecorderRef.current || !isRecording) return;
    
    // Stop the video processing
    stopVideoProcessing();
    
    // Stop the media recorder
    mediaRecorderRef.current.stop();
    setIsRecording(false);
    setLiveEmotion(null);
    
    // Stop the timer
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    toast.success('Recording stopped');
  };

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      setIsProcessing(true);
      
      // Create URL for the video
      const videoURL = URL.createObjectURL(file);
      setVideoPreview(videoURL);
      setIsLivePreview(false);
      
      // Update video element
      if (videoRef.current) {
        videoRef.current.src = videoURL;
        videoRef.current.muted = false;
      }
      
      // Process the video for emotion detection
      let result: EmotionResult | null = null;
      
      if (videoRef.current) {
        result = await processVideoFile(
          file,
          (progress) => console.log(`Processing: ${progress}%`),
          videoRef.current
        );
      }
      
      if (result) {
        onEmotionDetected(result);
        toast.success('Video analysis complete');
      } else {
        // Fall back to the simulated analysis
        const fallbackResult = await analyzeVideoEmotion(file);
        onEmotionDetected(fallbackResult);
        toast.info('Used fallback video analysis', {
          description: 'Advanced model not available',
        });
      }
    } catch (error) {
      console.error('Error processing video file:', error);
      toast.error('Error analyzing video file', {
        description: 'Using fallback analysis.',
      });
      
      try {
        const fallbackResult = await analyzeVideoEmotion(file);
        onEmotionDetected(fallbackResult);
      } catch (fallbackError) {
        console.error('Error with fallback video processing:', fallbackError);
      }
    } finally {
      setIsProcessing(false);
      e.target.value = '';
    }
  };

  return {
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
  };
};
