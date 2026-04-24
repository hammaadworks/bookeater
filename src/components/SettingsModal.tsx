import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [apiKey, setApiKey] = useState('');
  const [provider, setProvider] = useState('google');

  useEffect(() => {
    if (isOpen) {
      setApiKey(localStorage.getItem('bookeater_api_key') || import.meta.env.VITE_GEMINI_API_KEY || '');
      setProvider(localStorage.getItem('bookeater_provider') || 'google');
    }
  }, [isOpen]);

  const handleSave = () => {
    localStorage.setItem('bookeater_api_key', apiKey);
    localStorage.setItem('bookeater_provider', provider);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-[400px] overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-zinc-200">
          <h3 className="font-semibold text-zinc-800">API Settings</h3>
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-black rounded">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">AI Provider</label>
            <select 
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              className="w-full p-2 border border-zinc-300 rounded-lg text-sm bg-white"
            >
              <option value="google">Google Gemini (Recommended for Browsers)</option>
              <option value="openai">OpenAI GPT-4o (May have CORS issues)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">API Key</label>
            <input 
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your API key..."
              className="w-full p-2 border border-zinc-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <p className="text-xs text-zinc-500 mt-2">
              Your key is stored locally in your browser and never sent to our servers.
            </p>
          </div>
        </div>
        <div className="p-4 border-t border-zinc-200 flex justify-end gap-2 bg-zinc-50">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-zinc-600 text-sm font-medium rounded-lg hover:bg-zinc-200"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            className="px-4 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-zinc-800"
          >
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
}