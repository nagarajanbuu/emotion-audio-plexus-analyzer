
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Settings, Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { 
  audioModelOptions, 
  videoModelOptions,
  getSelectedAudioModel,
  setSelectedAudioModel,
  getSelectedVideoModel,
  setSelectedVideoModel,
  storeCustomModel,
  setCustomModelPath
} from "@/lib/model-selection";
import { initAudioEmotionDetector } from "@/lib/audio-emotion-detector";
import { getModelLoading, setModelLoading } from "@/lib/audio-emotion-utils";

interface ModelSettingsDialogProps {
  onSettingsChange: () => void;
}

const ModelSettingsDialog: React.FC<ModelSettingsDialogProps> = ({ onSettingsChange }) => {
  const [selectedAudioModel, setSelectedAudioModelState] = useState(getSelectedAudioModel());
  const [selectedVideoModel, setSelectedVideoModelState] = useState(getSelectedVideoModel());
  const [isUploading, setIsUploading] = useState(false);
  const [open, setOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Update local state when models change
    setSelectedAudioModelState(getSelectedAudioModel());
    setSelectedVideoModelState(getSelectedVideoModel());
  }, [open]);

  const handleAudioModelChange = (value: string) => {
    setSelectedAudioModelState(value);
  };

  const handleVideoModelChange = (value: string) => {
    setSelectedVideoModelState(value);
  };

  const handleCustomModelUpload = async (e: React.ChangeEvent<HTMLInputElement>, modelType: 'audio' | 'video') => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      
      // Basic file type validation
      if (!file.name.endsWith('.onnx') && !file.name.endsWith('.json')) {
        toast.error('Unsupported file format', {
          description: 'Please upload an ONNX or JSON model file',
        });
        return;
      }

      // Store the model
      const modelPath = await storeCustomModel(file, modelType);
      setCustomModelPath(modelType, modelPath);
      
      // Update selection to custom model
      if (modelType === 'audio') {
        setSelectedAudioModelState('custom-audio');
      } else {
        setSelectedVideoModelState('custom-video');
      }

      toast.success('Custom model uploaded successfully', {
        description: `Your ${modelType} model is ready to use.`,
      });
    } catch (error) {
      console.error(`Error uploading ${modelType} model:`, error);
      toast.error(`Failed to upload ${modelType} model`, {
        description: 'Please try again with a different file',
      });
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const saveSettings = async () => {
    try {
      setIsSaving(true);
      setModelLoading(true);
      
      // Save the selected models
      setSelectedAudioModel(selectedAudioModel);
      setSelectedVideoModel(selectedVideoModel);
      
      // Close the dialog
      setOpen(false);
      
      // Initialize the audio model with the new settings
      await initAudioEmotionDetector();
      
      // Notify the parent component that settings have changed
      onSettingsChange();
      
      toast.success('Model settings updated', {
        description: 'Your emotion recognition settings have been saved.',
      });
    } catch (error) {
      console.error('Error applying model settings:', error);
      toast.error('Error applying model settings', {
        description: 'Please try again or select a different model.',
      });
    } finally {
      setIsSaving(false);
      setModelLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Emotion Recognition Settings</DialogTitle>
          <DialogDescription>
            Configure which models to use for emotion recognition.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="audio">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="audio">Audio Models</TabsTrigger>
            <TabsTrigger value="video">Video Models</TabsTrigger>
          </TabsList>
          
          <TabsContent value="audio" className="space-y-4 py-4">
            <RadioGroup value={selectedAudioModel} onValueChange={handleAudioModelChange}>
              {audioModelOptions.map((model) => (
                <div key={model.id} className="flex items-start space-x-2 rounded p-2 hover:bg-muted">
                  <RadioGroupItem value={model.id} id={`audio-${model.id}`} />
                  <div className="grid gap-1">
                    <Label htmlFor={`audio-${model.id}`} className="font-medium">{model.name}</Label>
                    <p className="text-sm text-muted-foreground">{model.description}</p>
                  </div>
                </div>
              ))}
            </RadioGroup>
            
            <div className="border rounded p-4 mt-4">
              <h4 className="font-medium mb-2">Upload Custom Audio Model</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Upload your own ONNX model trained for audio emotion recognition.
              </p>
              <div className="flex items-center gap-2">
                <Input
                  type="file"
                  accept=".onnx,.json"
                  className="flex-1"
                  onChange={(e) => handleCustomModelUpload(e, 'audio')}
                  disabled={isUploading}
                />
                <Button size="sm" disabled={isUploading}>
                  {isUploading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Upload className="h-4 w-4 mr-2" />
                  )}
                  Upload
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="video" className="space-y-4 py-4">
            <RadioGroup value={selectedVideoModel} onValueChange={handleVideoModelChange}>
              {videoModelOptions.map((model) => (
                <div key={model.id} className="flex items-start space-x-2 rounded p-2 hover:bg-muted">
                  <RadioGroupItem value={model.id} id={`video-${model.id}`} />
                  <div className="grid gap-1">
                    <Label htmlFor={`video-${model.id}`} className="font-medium">{model.name}</Label>
                    <p className="text-sm text-muted-foreground">{model.description}</p>
                    {model.usesAudio && (
                      <span className="inline-flex items-center px-2 py-1 mt-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                        Uses audio input
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </RadioGroup>
            
            <div className="border rounded p-4 mt-4">
              <h4 className="font-medium mb-2">Upload Custom Video Model</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Upload your own ONNX model trained for video emotion recognition.
              </p>
              <div className="flex items-center gap-2">
                <Input
                  type="file"
                  accept=".onnx,.json"
                  className="flex-1"
                  onChange={(e) => handleCustomModelUpload(e, 'video')}
                  disabled={isUploading}
                />
                <Button size="sm" disabled={isUploading}>
                  {isUploading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Upload className="h-4 w-4 mr-2" />
                  )}
                  Upload
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={saveSettings} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ModelSettingsDialog;
