
import * as faceapi from 'face-api.js';
import type { EmotionResult } from '@/types/emotion';

// Global variables
let modelsLoaded = false;
let videoProcessorInterval: number | null = null;

// Load the face-api.js models
export const loadFaceApiModels = async (): Promise<boolean> => {
  try {
    if (modelsLoaded) return true;
    
    // Load models from the public directory
    await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
    await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
    await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
    await faceapi.nets.faceExpressionNet.loadFromUri('/models');
    
    modelsLoaded = true;
    
    return true;
  } catch (error) {
    console.error('Error loading face-api models:', error);
    return false;
  }
};

// Start processing video from an element
export const startVideoProcessing = (
  videoElement: HTMLVideoElement,
  onEmotionDetected: (result: EmotionResult, faceCount: number) => void
): void => {
  if (!modelsLoaded) {
    console.error('Face API models not loaded. Call loadFaceApiModels first.');
    return;
  }
  
  // Clear any existing interval
  if (videoProcessorInterval) {
    clearInterval(videoProcessorInterval);
  }
  
  // Process video frames at regular intervals
  videoProcessorInterval = window.setInterval(async () => {
    try {
      if (videoElement.paused || videoElement.ended || !videoElement.readyState) {
        return;
      }
      
      // Detect faces and expressions
      const detections = await faceapi.detectAllFaces(
        videoElement, 
        new faceapi.TinyFaceDetectorOptions()
      ).withFaceLandmarks().withFaceExpressions();
      
      if (detections.length > 0) {
        // Combine expressions from all detected faces
        const allExpressions = detections.map(detection => detection.expressions);
        
        // Calculate average expression scores across all faces
        const avgExpressions = {
          happy: allExpressions.reduce((sum, exp) => sum + exp.happy, 0) / detections.length,
          sad: allExpressions.reduce((sum, exp) => sum + exp.sad, 0) / detections.length,
          neutral: allExpressions.reduce((sum, exp) => sum + exp.neutral, 0) / detections.length,
          angry: allExpressions.reduce((sum, exp) => sum + exp.angry, 0) / detections.length,
          fearful: allExpressions.reduce((sum, exp) => sum + exp.fearful, 0) / detections.length,
        };
        
        // Find the dominant emotion
        let dominantEmotion: 'happy' | 'sad' | 'neutral' | 'angry' | 'fearful' = 'neutral';
        let maxScore = avgExpressions.neutral;
        
        for (const [emotion, score] of Object.entries(avgExpressions) as [keyof typeof avgExpressions, number][]) {
          if (score > maxScore) {
            dominantEmotion = emotion;
            maxScore = score;
          }
        }
        
        // Map to our standard format
        const emotionsResult: EmotionResult = {
          dominantEmotion: dominantEmotion === 'fearful' ? 'fear' : dominantEmotion,
          emotions: [
            { emotion: 'happy', score: avgExpressions.happy },
            { emotion: 'sad', score: avgExpressions.sad },
            { emotion: 'neutral', score: avgExpressions.neutral },
            { emotion: 'angry', score: avgExpressions.angry },
            { emotion: 'fear', score: avgExpressions.fearful }
          ],
          source: 'video',
          timestamp: Date.now(),
          model: 'face-api.js'
        };
        
        onEmotionDetected(emotionsResult, detections.length);
      }
    } catch (error) {
      console.error('Error processing video frame:', error);
    }
  }, 200); // Process every 200ms
};

// Stop video processing
export const stopVideoProcessing = (): void => {
  if (videoProcessorInterval) {
    clearInterval(videoProcessorInterval);
    videoProcessorInterval = null;
  }
};

// Process a video file for emotion detection
export const processVideoFile = async (
  videoFile: File,
  onProgress: (progress: number) => void,
  videoElement: HTMLVideoElement
): Promise<EmotionResult | null> => {
  return new Promise((resolve) => {
    if (!modelsLoaded) {
      console.error('Face API models not loaded. Call loadFaceApiModels first.');
      resolve(null);
      return;
    }
    
    // Create URL for the video file
    const videoURL = URL.createObjectURL(videoFile);
    videoElement.src = videoURL;
    
    let emotionResults: EmotionResult[] = [];
    let sampleCount = 0;
    
    videoElement.onloadedmetadata = () => {
      // Set initial position to 25% of the video
      const samplePoints = [0.25, 0.5, 0.75];
      let currentSampleIndex = 0;
      
      const processSample = async () => {
        if (currentSampleIndex >= samplePoints.length) {
          // All samples processed
          URL.revokeObjectURL(videoURL);
          
          if (emotionResults.length === 0) {
            resolve(null);
            return;
          }
          
          // Combine all emotion results
          const combinedResult = combineEmotionResults(emotionResults);
          resolve(combinedResult);
          return;
        }
        
        // Set video to the next sample point
        const sampleTime = samplePoints[currentSampleIndex] * videoElement.duration;
        videoElement.currentTime = sampleTime;
        onProgress((currentSampleIndex / samplePoints.length) * 100);
        currentSampleIndex++;
      };
      
      // When video seeks to a time point, analyze that frame
      videoElement.onseeked = async () => {
        try {
          // Detect faces and expressions
          const detections = await faceapi.detectAllFaces(
            videoElement, 
            new faceapi.TinyFaceDetectorOptions()
          ).withFaceLandmarks().withFaceExpressions();
          
          if (detections.length > 0) {
            // Combine expressions from all detected faces
            const allExpressions = detections.map(detection => detection.expressions);
            
            // Calculate average expression scores across all faces
            const avgExpressions = {
              happy: allExpressions.reduce((sum, exp) => sum + exp.happy, 0) / detections.length,
              sad: allExpressions.reduce((sum, exp) => sum + exp.sad, 0) / detections.length,
              neutral: allExpressions.reduce((sum, exp) => sum + exp.neutral, 0) / detections.length,
              angry: allExpressions.reduce((sum, exp) => sum + exp.angry, 0) / detections.length,
              fearful: allExpressions.reduce((sum, exp) => sum + exp.fearful, 0) / detections.length,
            };
            
            // Find the dominant emotion
            let dominantEmotion: 'happy' | 'sad' | 'neutral' | 'angry' | 'fearful' = 'neutral';
            let maxScore = avgExpressions.neutral;
            
            for (const [emotion, score] of Object.entries(avgExpressions) as [keyof typeof avgExpressions, number][]) {
              if (score > maxScore) {
                dominantEmotion = emotion;
                maxScore = score;
              }
            }
            
            // Map to our standard format
            const emotionsResult: EmotionResult = {
              dominantEmotion: dominantEmotion === 'fearful' ? 'fear' : dominantEmotion,
              emotions: [
                { emotion: 'happy', score: avgExpressions.happy },
                { emotion: 'sad', score: avgExpressions.sad },
                { emotion: 'neutral', score: avgExpressions.neutral },
                { emotion: 'angry', score: avgExpressions.angry },
                { emotion: 'fear', score: avgExpressions.fearful }
              ],
              source: 'video',
              timestamp: Date.now(),
              model: 'face-api.js'
            };
            
            emotionResults.push(emotionsResult);
          }
        } catch (error) {
          console.error('Error analyzing video frame:', error);
        }
        
        // Process next sample
        processSample();
      };
      
      // Start processing samples
      processSample();
    };
    
    // Handle errors
    videoElement.onerror = () => {
      URL.revokeObjectURL(videoURL);
      resolve(null);
    };
  });
};

// Combine multiple emotion results into one
const combineEmotionResults = (results: EmotionResult[]): EmotionResult => {
  // Initialize combined scores for each emotion
  const combinedScores = {
    happy: 0,
    sad: 0,
    neutral: 0,
    angry: 0,
    fear: 0
  };
  
  // Sum up scores for each emotion
  results.forEach(result => {
    result.emotions.forEach(emotion => {
      const key = emotion.emotion === 'fearful' ? 'fear' : emotion.emotion;
      combinedScores[key as keyof typeof combinedScores] += emotion.score;
    });
  });
  
  // Calculate average scores
  const count = results.length;
  for (const emotion in combinedScores) {
    combinedScores[emotion as keyof typeof combinedScores] /= count;
  }
  
  // Find the dominant emotion
  let dominantEmotion: EmotionType = 'neutral';
  let maxScore = combinedScores.neutral;
  
  for (const [emotion, score] of Object.entries(combinedScores)) {
    if (score > maxScore) {
      dominantEmotion = emotion as EmotionType;
      maxScore = score;
    }
  }
  
  // Create the combined result
  return {
    dominantEmotion,
    emotions: [
      { emotion: 'happy', score: combinedScores.happy },
      { emotion: 'sad', score: combinedScores.sad },
      { emotion: 'neutral', score: combinedScores.neutral },
      { emotion: 'angry', score: combinedScores.angry },
      { emotion: 'fear', score: combinedScores.fear }
    ],
    source: 'video',
    timestamp: Date.now(),
    model: 'face-api.js (combined)'
  };
};
