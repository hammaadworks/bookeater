import { useState, useEffect } from 'react';
import { X, Settings, Key, BarChart3, Trash2, Zap } from 'lucide-react';
import { AIProvider, APP_CONFIG } from '../../constants';
import { StorageService } from '../../services/storage.service';
import { TokenUsage } from '../../core/db';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Tab = 'general' | 'api' | 'usage';

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>('general');
  const [userName, setUserName] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [provider, setProvider] = useState<AIProvider>(AIProvider.GOOGLE);
  const [model, setModel] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [usageData, setUsageData] = useState<TokenUsage[]>([]);

  useEffect(() => {
    if (isOpen) {
      setUserName(localStorage.getItem(APP_CONFIG.STORAGE_KEYS.USER_NAME) || '');
      setApiKey(localStorage.getItem(APP_CONFIG.STORAGE_KEYS.API_KEY) || import.meta.env.VITE_GEMINI_API_KEY || '');
      setProvider((localStorage.getItem(APP_CONFIG.STORAGE_KEYS.PROVIDER) as AIProvider) || AIProvider.GOOGLE);
      setModel(localStorage.getItem(APP_CONFIG.STORAGE_KEYS.MODEL) || '');
      setBaseUrl(localStorage.getItem(APP_CONFIG.STORAGE_KEYS.BASE_URL) || '');
      
      loadUsage();
    }
  }, [isOpen]);

  const loadUsage = async () => {
    const usage = await StorageService.getTokenUsage();
    setUsageData(usage);
  };

  const handleSave = () => {
    localStorage.setItem(APP_CONFIG.STORAGE_KEYS.USER_NAME, userName);
    localStorage.setItem(APP_CONFIG.STORAGE_KEYS.API_KEY, apiKey);
    localStorage.setItem(APP_CONFIG.STORAGE_KEYS.PROVIDER, provider);
    localStorage.setItem(APP_CONFIG.STORAGE_KEYS.MODEL, model);
    localStorage.setItem(APP_CONFIG.STORAGE_KEYS.BASE_URL, baseUrl);
    window.dispatchEvent(new Event('storage'));
    onClose();
  };

  const clearUsage = async () => {
    if (confirm('Are you sure you want to clear your usage history? This cannot be undone.')) {
      await StorageService.clearUsage();
      setUsageData([]);
    }
  };

  const totalPromptTokens = usageData.reduce((acc, curr) => acc + curr.promptTokens, 0);
  const totalCompletionTokens = usageData.reduce((acc, curr) => acc + curr.completionTokens, 0);
  const totalTokens = totalPromptTokens + totalCompletionTokens;
  
  // Hypothetical cost calculation (e.g., $15/1M tokens average)
  const estimatedCost = (totalTokens / 1_000_000) * 15;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-[#1A1A1A] border border-[#333] rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-[600px] animate-in zoom-in-95 duration-200">
        
        {/* Sidebar Tabs */}
        <div className="w-full md:w-48 bg-[#141414] border-r border-[#333] p-4 flex md:flex-col gap-2">
          <button
            onClick={() => setActiveTab('general')}
            className={`flex-1 md:flex-none flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'general' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-zinc-400 hover:bg-[#252525] hover:text-white'
            }`}
          >
            <Settings size={18} />
            General
          </button>
          <button
            onClick={() => setActiveTab('api')}
            className={`flex-1 md:flex-none flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'api' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-zinc-400 hover:bg-[#252525] hover:text-white'
            }`}
          >
            <Key size={18} />
            AI API
          </button>
          <button
            onClick={() => setActiveTab('usage')}
            className={`flex-1 md:flex-none flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'usage' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-zinc-400 hover:bg-[#252525] hover:text-white'
            }`}
          >
            <BarChart3 size={18} />
            Usage
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="p-6 flex items-center justify-between border-b border-[#333]">
            <h2 className="text-xl font-bold tracking-tight text-white capitalize">{activeTab} Settings</h2>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-[#333] transition-colors text-zinc-400 hover:text-white">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {activeTab === 'general' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">Your Name</label>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="e.g. Hammaad"
                    className="w-full bg-[#2A2A2A] border border-[#333] rounded-xl px-4 py-2.5 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                  />
                </div>
              </div>
            )}

            {activeTab === 'api' && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">AI Provider</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: AIProvider.GOOGLE, name: 'Google Gemini' },
                      { id: AIProvider.OPENAI, name: 'OpenAI' }
                    ].map((p) => (
                      <button
                        key={p.id}
                        onClick={() => setProvider(p.id)}
                        className={`px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                          provider === p.id 
                            ? 'bg-blue-600/10 border-blue-500/50 text-blue-400' 
                            : 'bg-[#2A2A2A] border-[#333] text-zinc-400 hover:border-zinc-700'
                        }`}
                      >
                        {p.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">API Key</label>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Enter your API key..."
                    className="w-full bg-[#2A2A2A] border border-[#333] rounded-xl px-4 py-2.5 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                  />
                  <p className="text-xs text-zinc-500">Key is stored locally in your browser and never sent to our servers.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-300">Model ID (Optional)</label>
                    <input
                      type="text"
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      placeholder={provider === AIProvider.GOOGLE ? "gemini-2.0-flash" : "gpt-4o"}
                      className="w-full bg-[#2A2A2A] border border-[#333] rounded-xl px-4 py-2.5 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-300">Base URL (Optional)</label>
                    <input
                      type="text"
                      value={baseUrl}
                      onChange={(e) => setBaseUrl(e.target.value)}
                      placeholder="https://api.openai.com/v1"
                      className="w-full bg-[#2A2A2A] border border-[#333] rounded-xl px-4 py-2.5 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'usage' && (usageData.length > 0 ? (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-[#2A2A2A] p-5 rounded-2xl border border-[#333] space-y-1">
                    <p className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">Total Tokens Burnt</p>
                    <div className="flex items-end gap-2">
                      <p className="text-3xl font-bold text-white">{totalTokens.toLocaleString()}</p>
                      <Zap size={20} className="text-yellow-500 mb-1.5" />
                    </div>
                    <p className="text-zinc-500 text-sm mt-2">
                      {totalPromptTokens.toLocaleString()} in / {totalCompletionTokens.toLocaleString()} out
                    </p>
                  </div>
                  <div className="bg-[#2A2A2A] p-5 rounded-2xl border border-[#333] space-y-1">
                    <p className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">Estimated Cost</p>
                    <p className="text-3xl font-bold text-green-400">${estimatedCost.toFixed(4)}</p>
                    <p className="text-zinc-500 text-xs mt-2 italic">Based on ~$15 per million tokens</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white uppercase tracking-widest opacity-50">Recent Activity</h3>
                    <button 
                      onClick={clearUsage}
                      className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1.5 transition-colors"
                    >
                      <Trash2 size={12} />
                      Clear History
                    </button>
                  </div>
                  <div className="space-y-2">
                    {usageData.slice(0, 5).map((u, i) => (
                      <div key={u.id || i} className="bg-[#252525] p-3 rounded-xl border border-[#333] flex items-center justify-between text-sm">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${u.provider === 'google' ? 'bg-blue-500' : 'bg-green-500'}`} />
                          <div>
                            <p className="text-zinc-200 font-medium">{u.modelId}</p>
                            <p className="text-zinc-500 text-xs">{new Date(u.timestamp).toLocaleString()}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-zinc-300 font-semibold">{u.totalTokens.toLocaleString()} tokens</p>
                          {u.thoughtSignature && (
                            <p className="text-[10px] text-zinc-600 font-mono truncate max-w-[100px]" title={u.thoughtSignature}>
                              sig: {u.thoughtSignature.slice(0, 10)}...
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50 py-12">
                <BarChart3 size={48} className="text-zinc-600" />
                <div>
                  <h3 className="text-zinc-300 font-medium">No usage history yet</h3>
                  <p className="text-zinc-500 text-sm">Generate some lessons to see your token analytics.</p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-6 bg-[#252525] border-t border-[#333] flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2.5 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-8 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-blue-600/20 active:scale-95"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
