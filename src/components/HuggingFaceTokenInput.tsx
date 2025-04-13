
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { initAudioEmotionDetector } from '@/lib/audio-emotion-detector';

const HuggingFaceTokenInput = () => {
  const [token, setToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const saveToken = async () => {
    if (!token.trim()) {
      toast.error('Please enter an access token');
      return;
    }

    // Save token to local storage
    localStorage.setItem('huggingface_token', token);
    
    // Attempt to reinitialize the model with the token
    setIsLoading(true);
    try {
      // We need to update the imported constant in the file
      // This is just to force a reload with the token
      await initAudioEmotionDetector();
      toast.success('Token saved and model reinitialized');
    } catch (error) {
      console.error('Error initializing model with token:', error);
      toast.error('Error initializing model with token');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full shadow-sm">
      <CardHeader>
        <CardTitle>Hugging Face Access Token</CardTitle>
        <CardDescription>
          Enter your Hugging Face access token to use private models.
          The token will be stored in your browser's local storage.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4">
          <Input
            type="password"
            placeholder="hf_..."
            value={token}
            onChange={(e) => setToken(e.target.value)}
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={saveToken} 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? 'Saving...' : 'Save Token'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default HuggingFaceTokenInput;
