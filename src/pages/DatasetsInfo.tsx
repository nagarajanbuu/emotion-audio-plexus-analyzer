
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, HardDrive, Database, BarChart2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from '@/components/Header';
import ModelTraining from '@/components/ModelTraining';
import OptimizationStatus from '@/components/OptimizationStatus';

const DatasetsInfo = () => {
  const [activeTab, setActiveTab] = useState('datasets');
  
  return (
    <div className="min-h-screen bg-muted/20">
      <Header />
      
      <main className="container px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Dataset Information</h1>
          <Button variant="outline" asChild>
            <Link to="/" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Analysis</span>
            </Link>
          </Button>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="datasets" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              <span>Datasets</span>
            </TabsTrigger>
            <TabsTrigger value="training" className="flex items-center gap-2">
              <HardDrive className="h-4 w-4" />
              <span>Model Training</span>
            </TabsTrigger>
            <TabsTrigger value="optimization" className="flex items-center gap-2">
              <BarChart2 className="h-4 w-4" />
              <span>Optimization</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="datasets" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">RAVDESS Dataset</h2>
                <p className="text-muted-foreground">
                  The Ryerson Audio-Visual Database of Emotional Speech and Song (RAVDESS)
                  contains 24 professional actors (12 female, 12 male), vocalizing two lexically-matched
                  statements in a neutral North American accent.
                </p>
                <ul className="list-disc list-inside space-y-2 text-sm">
                  <li>7356 files (total)</li>
                  <li>60 trials per actor</li>
                  <li>8 emotional expressions</li>
                  <li>2 emotional intensities</li>
                  <li>Speech and song recordings</li>
                </ul>
              </div>
              
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">CREMA-D Dataset</h2>
                <p className="text-muted-foreground">
                  Crowd-sourced Emotional Multimodal Actors Dataset (CREMA-D) includes
                  7,442 original clips from 91 actors. These clips were from 48 male and 43 female
                  actors between the ages of 20 and 74 from various ethnicities.
                </p>
                <ul className="list-disc list-inside space-y-2 text-sm">
                  <li>7442 audio-visual recordings</li>
                  <li>91 actors of diverse ethnicities</li>
                  <li>12 sentences of varying length</li>
                  <li>6 different emotions</li>
                  <li>4 emotion intensity levels</li>
                </ul>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="training">
            <ModelTraining />
          </TabsContent>
          
          <TabsContent value="optimization">
            <OptimizationStatus />
          </TabsContent>
        </Tabs>
      </main>
      
      <footer className="py-6 border-t mt-12">
        <div className="container text-center text-xs text-muted-foreground">
          <p>Multimodal Emotion Recognition System</p>
          <p className="mt-1">Using RAVDESS and CREMA-D datasets for training</p>
        </div>
      </footer>
    </div>
  );
};

export default DatasetsInfo;
