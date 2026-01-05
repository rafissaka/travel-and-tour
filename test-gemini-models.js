const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI('AIzaSyAsSiK-jtgY4YTq7AKH-sP-ejuQw2DFo64');

async function listModels() {
  try {
    console.log('Fetching available models...');
    
    // Try to list models
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models?key=AIzaSyAsSiK-jtgY4YTq7AKH-sP-ejuQw2DFo64');
    const data = await response.json();
    
    if (data.models) {
      console.log('\n✅ Available models:');
      data.models.forEach(model => {
        console.log(`- ${model.name}`);
      });
    } else {
      console.log('Response:', JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

listModels();
