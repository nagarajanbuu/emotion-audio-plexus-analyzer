
import { useState } from 'react';
import Header from '@/components/Header';
import ModelTraining from '@/components/ModelTraining';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DATASET_PATHS, EMOTION_LABELS } from '@/utils/dataset-utils';

const DatasetsInfo = () => {
  const [activeTab, setActiveTab] = useState<string>('info');
  
  return (
    <div className="min-h-screen bg-muted/20">
      <Header />
      
      <main className="container px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Dataset Information</h1>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="info">Dataset Info</TabsTrigger>
            <TabsTrigger value="training">Model Training</TabsTrigger>
            <TabsTrigger value="structure">File Structure</TabsTrigger>
          </TabsList>
          
          <TabsContent value="info" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-xl font-semibold mb-4">Audio Emotion Datasets</h2>
                <p className="mb-4">
                  This project uses two publicly available datasets for training and testing audio emotion recognition models:
                </p>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium">RAVDESS</h3>
                    <p className="text-sm text-muted-foreground">
                      The Ryerson Audio-Visual Database of Emotional Speech and Song contains 7356 files. 
                      The dataset includes speech and song recordings in 8 different emotions.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium">CREMA-D</h3>
                    <p className="text-sm text-muted-foreground">
                      Crowd Sourced Emotional Multimodal Actors Dataset includes 7,442 original clips from 91 actors.
                      These clips were from 48 male and 43 female actors between the ages of 20 and 74 from various races.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium">Processed Data</h3>
                    <p className="text-sm text-muted-foreground">
                      The processed data consists of X.npy (features) and y.npy (labels) files. The features are MFCC (Mel-frequency cepstral coefficients)
                      extracted from audio samples, and labels are the emotion categories.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium">Supported Emotions</h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {EMOTION_LABELS.map((emotion) => (
                        <div key={emotion} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm capitalize">
                          {emotion}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="training">
            <ModelTraining />
          </TabsContent>
          
          <TabsContent value="structure">
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-xl font-semibold mb-4">Required File Structure</h2>
                <div className="font-mono text-sm bg-muted p-4 rounded-md overflow-x-auto">
                  <pre className="whitespace-pre-wrap">
                    {`public/
  datasets/
    X.npy         # Feature array
    y.npy         # Label array
    RAVDESS/      # Raw RAVDESS dataset
    CREMA-D/      # Raw CREMA-D dataset

src/
  datasets/
    placeholder.txt
    X.npy         # Copy of feature array
    y.npy         # Copy of label array
    RAVDESS/      # Symbolic link or copy
    CREMA-D/      # Symbolic link or copy`}
                  </pre>
                </div>
                
                <h3 className="text-lg font-medium mt-6 mb-2">Important Notes:</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Model training happens offline using Python scripts</li>
                  <li>The web app uses pre-trained models and dataset info for display</li>
                  <li>Place your actual dataset files in both locations for development</li>
                  <li>For production, only the public folder needs the datasets</li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default DatasetsInfo;
