
// This is a helper script to download face-api.js models.
// Run this in the browser console when setting up the project.

async function downloadModels() {
  const modelFiles = [
    'face_detection_model-weights_manifest.json',
    'face_detection_model-shard1',
    'face_expression_model-weights_manifest.json',
    'face_expression_model-shard1',
    'face_landmark_68_model-weights_manifest.json',
    'face_landmark_68_model-shard1',
    'face_recognition_model-weights_manifest.json',
    'face_recognition_model-shard1',
    'face_recognition_model-shard2',
    'tiny_face_detector_model-weights_manifest.json',
    'tiny_face_detector_model-shard1'
  ];
  
  // Create directories if they don't exist
  console.log('Downloading face-api.js models...');
  
  // Base URL for models
  const baseUrl = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/';
  
  // Create /models directory
  const models = [];
  
  for (const file of modelFiles) {
    try {
      console.log(`Downloading ${file}...`);
      const response = await fetch(baseUrl + file);
      const blob = await response.blob();
      const dataUrl = URL.createObjectURL(blob);
      
      // Create a download link
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = file;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log(`Downloaded ${file}`);
      models.push(file);
    } catch (error) {
      console.error(`Error downloading ${file}:`, error);
    }
  }
  
  console.log('Download complete.');
  console.log('Move these files to your project: public/models/ directory.');
  return models;
}

// Call the function
downloadModels().then(models => {
  console.log('Downloaded models:', models);
});
