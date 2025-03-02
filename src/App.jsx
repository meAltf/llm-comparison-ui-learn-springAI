import { useState } from 'react';
import './App.css';

function App() {
  const [prompts, setPrompts] = useState({
    ollama: '',
    anthropic: '',
    deepseek: '',
    openai: ''
  });

  const [responses, setResponses] = useState({
    ollama: '',
    anthropic: '',
    deepseek: '',
    openai: ''
  });

  const [loading, setLoading] = useState({
    ollama: false,
    anthropic: false,
    deepseek: false,
    openai: false
  });

  const handlePromptChange = (model, value) => {
    setPrompts(prev => ({ ...prev, [model]: value }));
  };

  const handleSubmit = async (model) => {
    if (!prompts[model].trim()) return;
    
    setLoading(prev => ({ ...prev, [model]: true }));
    setResponses(prev => ({ ...prev, [model]: 'Loading...' }));
    
    try {
      const encodedPrompt = encodeURIComponent(prompts[model]);
      const response = await fetch(`http://localhost:${getPortForModel(model)}/api/${model}/${encodedPrompt}`);
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.text();
      setResponses(prev => ({ ...prev, [model]: data }));
    } catch (error) {
      setResponses(prev => ({ ...prev, [model]: `Error: ${error.message}` }));
    } finally {
      setLoading(prev => ({ ...prev, [model]: false }));
    }
  };

  const getPortForModel = (model) => {
    switch (model) {
      case 'ollama': return '8082';
      case 'anthropic': return '8083';
      case 'deepseek': return '8081';
      case 'openai': return '8080';
      default: return '8080';
    }
  };

  const models = [
    { id: 'openai', name: 'OpenAI (GPT-4o)', color: '#2ECC71' },
    { id: 'anthropic', name: 'Anthropic (Claude)', color: '#9B59B6' },
    { id: 'deepseek', name: 'DeepSeek', color: '#3498DB' },
    { id: 'ollama', name: 'Ollama (Gemma 2)', color: '#E67E22' }
  ];

  return (
    <div className="app-container">
      <h1>LLM Model Comparison</h1>
      
      <div className="model-grid">
        {models.map(model => (
          <div 
            key={model.id} 
            className="model-box"
            style={{ borderColor: model.color }}
          >
            <h2 style={{ color: model.color }}>{model.name}</h2>
            
            <div className="prompt-area">
              <textarea
                placeholder={`Enter your prompt for ${model.name}...`}
                value={prompts[model.id]}
                onChange={(e) => handlePromptChange(model.id, e.target.value)}
                disabled={loading[model.id]}
              />
              
              <button 
                onClick={() => handleSubmit(model.id)}
                disabled={loading[model.id] || !prompts[model.id].trim()}
                style={{ backgroundColor: model.color }}
              >
                {loading[model.id] ? 'Sending...' : 'Submit'}
              </button>
            </div>
            
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