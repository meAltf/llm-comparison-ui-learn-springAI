import { useState, useCallback } from 'react';
import './App.css';

function App() {
  const [sharedPrompt, setSharedPrompt] = useState('');
  const [responses, setResponses] = useState({
    ollama: '',
    anthropic: '',
    openai: ''
  });
  const [loading, setLoading] = useState({
    ollama: false,
    anthropic: false,
    openai: false
  });

  const models = [
    { id: 'openai', name: 'OpenAI (GPT-4o)', color: '#2ECC71' },
    { id: 'anthropic', name: 'Anthropic (Claude)', color: '#9B59B6' },
    { id: 'ollama', name: 'Ollama (Gemma 2)', color: '#E67E22' }
  ];

  const handlePromptChange = useCallback((value) => {
    setSharedPrompt(value);
  }, []);

  const fetchModelResponse = useCallback(async (model, prompt) => {
    try {
      const encodedPrompt = encodeURIComponent(prompt);
      const response = await fetch(`http://localhost:8080/api/${model}/${encodedPrompt}`);
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.text();
      return data;
    } catch (error) {
      return `Error: ${error.message}`;
    }
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!sharedPrompt.trim()) return;
    
    // Set all models to loading
    setLoading({ ollama: true, anthropic: true, openai: true });
    
    // Initialize all responses as loading
    setResponses({ ollama: 'Loading...', anthropic: 'Loading...', openai: 'Loading...' });
    
    try {
      // Use Promise.all for parallel execution
      const results = await Promise.all(
        models.map(async (model) => {
          const response = await fetchModelResponse(model.id, sharedPrompt);
          return { id: model.id, response };
        })
      );
      
      // Update all responses at once
      const newResponses = { ...responses };
      results.forEach(result => {
        newResponses[result.id] = result.response;
      });
      
      setResponses(newResponses);
    } catch (error) {
      console.error('Error fetching responses:', error);
    } finally {
      setLoading({ ollama: false, anthropic: false, openai: false });
    }
  }, [sharedPrompt, fetchModelResponse, models, responses]);

  const isLoading = Object.values(loading).some(status => status);

  return (
    <div className="app-container">
      <h1>Exploring Different LLM Models</h1>
      
      <div className="shared-prompt-container">
        <div className="shared-prompt-area">
          <textarea
            placeholder="Enter a prompt to send to all models..."
            value={sharedPrompt}
            onChange={(e) => handlePromptChange(e.target.value)}
            disabled={isLoading}
          />
          
          <button 
            onClick={handleSubmit}
            disabled={isLoading || !sharedPrompt.trim()}
            className="submit-all-btn"
          >
            {isLoading ? 'Sending...' : 'Compare All Models'}
          </button>
        </div>
      </div>
      
      <div className="model-grid">
        {models.map(model => (
          <div 
            key={model.id} 
            className="model-box"
            style={{ borderColor: model.color }}
          >
            <h2 style={{ color: model.color }}>{model.name}</h2>
            
            <div className="response-area">
              <h3>Response:</h3>
              <div className="response-content">
                {responses[model.id] ? (
                  <div className="response-text">{responses[model.id]}</div>
                ) : (
                  <div className="placeholder-text">Response will appear here</div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;