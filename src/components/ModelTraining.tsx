
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { InfoIcon, AlertCircle, CheckCircle2 } from 'lucide-react';
import { loadModelData, DATASET_PATHS, trainModel } from '@/utils/dataset-utils';
import { Separator } from './ui/separator';
import { Progress } from './ui/progress';

const ModelTraining = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isTraining, setIsTraining] = useState(false);
  const [progress, setProgress] = useState(0);
  const [trainingConfig, setTrainingConfig] = useState<any>(null);

  const checkDatasets = async () => {
    setLoading(true);
    setMessage(null);
    setError(null);
    
    try {
      const result = await loadModelData();
      if (result.loaded) {
        setMessage(result.message);
      } else {
        setError(result.error || 'Failed to load dataset files');
      }
    } catch (err) {
      setError('Error checking datasets: ' + String(err));
    } finally {
      setLoading(false);
    }
  };
  
  const handleTrainModel = async () => {
    setIsTraining(true);
    setProgress(0);
    setMessage(null);
    setError(null);
    
    // Simulate progress updates
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + Math.random() * 5;
        return newProgress >= 100 ? 100 : newProgress;
      });
    }, 500);
    
    try {
      const result = await trainModel();
      if (result.success) {
        setMessage(result.message);
        setTrainingConfig(result.config);
      } else {
        setError(result.error || 'Training failed');
      }
    } catch (err) {
      setError('Error during training: ' + String(err));
    } finally {
      clearInterval(progressInterval);
      setProgress(100);
      setTimeout(() => {
        setIsTraining(false);
      }, 1000);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Model Training</CardTitle>
        <CardDescription>
          Check datasets and train models with advanced optimization techniques
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <Alert>
          <InfoIcon className="h-4 w-4" />
          <AlertTitle>Dataset Information</AlertTitle>
          <AlertDescription>
            The emotion recognition models use data from RAVDESS and CREMA-D datasets.
            Make sure the datasets are properly placed in the following paths:
          </AlertDescription>
        </Alert>
        
        <div className="space-y-2 text-sm">
          <p><strong>Feature data:</strong> {DATASET_PATHS.X_NPY}</p>
          <p><strong>Label data:</strong> {DATASET_PATHS.Y_NPY}</p>
          <p><strong>RAVDESS folder:</strong> {DATASET_PATHS.RAVDESS_DIR}</p>
          <p><strong>CREMA-D folder:</strong> {DATASET_PATHS.CREMA_D_DIR}</p>
        </div>
        
        <Separator />
        
        <div className="space-y-2">
          <h3 className="font-medium">Advanced Training Configuration</h3>
          <ul className="list-disc list-inside space-y-1 text-sm pl-4">
            <li>Optimizer: AdamW (Adam with weight decay)</li>
            <li>Learning rate: Cosine annealing scheduler</li>
            <li>Regularization: Label smoothing (0.1)</li>
            <li>Data handling: Class balancing for imbalanced datasets</li>
          </ul>
        </div>
        
        {isTraining && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Training progress</span>
              <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}
        
        {message && (
          <Alert className="bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-600">{message}</AlertDescription>
          </Alert>
        )}
        
        {trainingConfig && (
          <Alert variant="outline" className="bg-blue-50">
            <InfoIcon className="h-4 w-4 text-blue-600" />
            <AlertTitle className="text-blue-600">Training Configuration</AlertTitle>
            <AlertDescription>
              <div className="mt-2 text-sm">
                <p><strong>Optimizer:</strong> {trainingConfig.optimizer}</p>
                <p><strong>Scheduler:</strong> {trainingConfig.learningRateScheduler}</p>
                <p><strong>Label Smoothing:</strong> {trainingConfig.labelSmoothing}</p>
                <p><strong>Datasets:</strong> {trainingConfig.datasets.join(', ')}</p>
              </div>
            </AlertDescription>
          </Alert>
        )}
        
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
      
      <CardFooter className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
        <Button onClick={checkDatasets} disabled={loading || isTraining} className="w-full sm:w-auto">
          {loading ? 'Checking...' : 'Check Datasets'}
        </Button>
        <Button 
          onClick={handleTrainModel} 
          disabled={isTraining || loading} 
          variant="secondary"
          className="w-full sm:w-auto"
        >
          {isTraining ? 'Training...' : 'Train Model'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ModelTraining;
