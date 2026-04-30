import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { AIProvider, APP_CONFIG } from '../../constants';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [userName, setUserName] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [provider, setProvider] = useState<AIProvider>(AIProvider.GOOGLE);
  const [model, setModel] = useState('');
  const [baseUrl, setBaseUrl] = useState('');

  useEffect(() => {
    if (isOpen) {
      setUserName(localStorage.getItem(APP_CONFIG.STORAGE_KEYS.USER_NAME) || '');
      setApiKey(localStorage.getItem(APP_CONFIG.STORAGE_KEYS.API_KEY) || import.meta.env.VITE_GEMINI_API_KEY || '');
      setProvider((localStorage.getItem(APP_CONFIG.STORAGE_KEYS.PROVIDER) as AIProvider) || AIProvider.GOOGLE);
      setModel(localStorage.getItem(APP_CONFIG.STORAGE_KEYS.MODEL) || '');
      setBaseUrl(localStorage.getItem(APP_CONFIG.STORAGE_KEYS.BASE_URL) || '');
    }
  }, [isOpen]);

  const handleSave = () => {
    localStorage.setItem(APP_CONFIG.STORAGE_KEYS.USER_NAME, userName);
    localStorage.setItem(APP_CONFIG.STORAGE_KEYS.API_KEY, apiKey);
    localStorage.setItem(APP_CONFIG.STORAGE_KEYS.PROVIDER, provider);
    localStorage.setItem(APP_CONFIG.STORAGE_KEYS.MODEL, model);
    localStorage.setItem(APP_CONFIG.STORAGE_KEYS.BASE_URL, baseUrl);
    window.dispatchEvent(new Event('storage'));
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-xl w-[450px] overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-4 border-b border-zinc-200">
          <h3 className="font-semibold text-zinc-800">API Settings</h3>
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-black rounded transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Your Name</label>
            <input 
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="e.g. Hammaad"
              className="w-full p-2 border border-zinc-300 rounded-lg text-sm focus:ring-2 focus:ring-black/5 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">AI Provider</label>
            <select 
              value={provider}
              onChange={(e) => setProvider(e.target.value as AIProvider)}
              className="w-full p-2 border border-zinc-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-black/5 focus:outline-none"
            >
              <option value={AIProvider.GOOGLE}>Google Gemini</option>
              <option value={AIProvider.OPENAI}>OpenAI / Compatible</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">API Key</label>
            <input 
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your API key..."
              className="w-full p-2 border border-zinc-300 rounded-lg text-sm focus:ring-2 focus:ring-black/5 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Model (Optional)</label>
            <input 
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder={provider === AIProvider.GOOGLE ? "gemini-2.5-flash" : "gpt-4o"}
              className="w-full p-2 border border-zinc-300 rounded-lg text-sm focus:ring-2 focus:ring-black/5 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Base URL (Optional)</label>
            <input 
              type="text"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="https://api.openai.com/v1"
              className="w-full p-2 border border-zinc-300 rounded-lg text-sm focus:ring-2 focus:ring-black/5 focus:outline-none"
            />
            <p className="text-xs text-zinc-500 mt-2">
              Useful for proxy services or custom endpoints.
            </p>
          </div>
          <p className="text-xs text-zinc-500">
            Your settings are stored locally in your browser.
          </p>
        </div>
        <div className="p-4 border-t border-zinc-200 flex justify-end gap-2 bg-zinc-50">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-zinc-600 text-sm font-medium rounded-lg hover:bg-zinc-200 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            className="px-4 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-zinc-800 transition-colors"
          >
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
}
