
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { InfoIcon, AlertCircle } from 'lucide-react';
import { loadModelData, DATASET_PATHS } from '@/utils/dataset-utils';
import { Separator } from './ui/separator';

const ModelTraining = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Model Training</CardTitle>
        <CardDescription>
          Check if datasets are available and view training information
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
        
        {message && (
          <Alert className="bg-green-50">
            <InfoIcon className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-600">{message}</AlertDescription>
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
      
      <CardFooter>
        <Button onClick={checkDatasets} disabled={loading}>
          {loading ? 'Checking...' : 'Check Datasets'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ModelTraining;
