
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Circle, AlertCircle } from 'lucide-react';

interface OptimizationGoal {
  name: string;
  description: string;
  status: 'implemented' | 'partial' | 'pending';
}

const OptimizationStatus = () => {
  const primaryGoals: OptimizationGoal[] = [
    {
      name: 'AdamW Optimizer',
      description: 'Weight decay regularization for better generalization',
      status: 'implemented'
    },
    {
      name: 'Cosine Annealing',
      description: 'Cyclical learning rate schedule for better convergence',
      status: 'implemented'
    },
    {
      name: 'Label Smoothing',
      description: 'Prevent overconfidence and improve generalization',
      status: 'implemented'
    },
    {
      name: 'Multi-dataset Training',
      description: 'Training on both RAVDESS and CREMA-D datasets',
      status: 'implemented'
    }
  ];
  
  const secondaryGoals: OptimizationGoal[] = [
    {
      name: 'Data Imbalance Handling',
      description: 'Class weighting and balancing for robust training',
      status: 'implemented'
    },
    {
      name: 'Environmental Adaptability',
      description: 'Improved noise robustness and speaker independence',
      status: 'partial'
    },
    {
      name: 'MFCC Feature Extraction',
      description: 'Advanced audio feature extraction for speech emotion',
      status: 'implemented'
    },
    {
      name: 'Multimodal Fusion Strategies',
      description: 'Advanced integration of audio and visual signals',
      status: 'implemented'
    }
  ];
  
  const StatusIcon = ({ status }: { status: string }) => {
    switch (status) {
      case 'implemented':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'partial':
        return <Circle className="h-4 w-4 text-amber-500" />;
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
      default:
        return null;
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Optimization Status</CardTitle>
        <CardDescription>
          Current implementation status of optimization objectives
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-3">Primary Objectives</h3>
          <div className="grid gap-3">
            {primaryGoals.map((goal) => (
              <div key={goal.name} className="flex items-start gap-2 border p-3 rounded-md">
                <StatusIcon status={goal.status} />
                <div>
                  <h4 className="font-medium">{goal.name}</h4>
                  <p className="text-sm text-muted-foreground">{goal.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-medium mb-3">Secondary Objectives</h3>
          <div className="grid gap-3">
            {secondaryGoals.map((goal) => (
              <div key={goal.name} className="flex items-start gap-2 border p-3 rounded-md">
                <StatusIcon status={goal.status} />
                <div>
                  <h4 className="font-medium">{goal.name}</h4>
                  <p className="text-sm text-muted-foreground">{goal.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OptimizationStatus;
