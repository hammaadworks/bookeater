import React, { useState } from 'react';
import { UploadCloud, Youtube, X, ArrowRight } from 'lucide-react';

interface AddSourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onYoutubeSubmit: (url: string) => void;
  onLocalFileClick: () => void;
}

export const AddSourceModal: React.FC<AddSourceModalProps> = ({
  isOpen,
  onClose,
  onYoutubeSubmit,
  onLocalFileClick
}) => {
  const [url, setUrl] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onYoutubeSubmit(url.trim());
      setUrl('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-[#0F172A] border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl shadow-black/50 overflow-hidden transform transition-all animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <h2 className="text-lg font-semibold text-slate-100">Add Learning Source</h2>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors focus:outline-none"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* YouTube Option */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-3">
              <Youtube size={16} className="text-red-500" />
              Import from YouTube
            </label>
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
                className="flex-1 bg-slate-900 border border-slate-700 text-slate-200 text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all placeholder:text-slate-600"
              />
              <button
                type="submit"
                disabled={!url.trim()}
                className="px-4 py-3 bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors flex items-center gap-2"
              >
                <ArrowRight size={18} />
              </button>
            </form>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase font-medium">
              <span className="bg-[#0F172A] px-4 text-slate-500">Or</span>
            </div>
          </div>

          {/* Local File Option */}
          <button
            onClick={() => {
              onLocalFileClick();
              onClose();
            }}
            className="w-full group relative overflow-hidden rounded-xl border border-dashed border-slate-700 hover:border-slate-500 bg-slate-900/50 hover:bg-slate-800/50 transition-all p-6 flex flex-col items-center justify-center gap-3"
          >
            <div className="p-3 bg-slate-800 text-slate-400 group-hover:text-green-400 group-hover:scale-110 transition-all duration-300 rounded-full">
              <UploadCloud size={24} />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-slate-200">Upload Local File</p>
              <p className="text-xs text-slate-500 mt-1">PDF, TXT, MD, MP4, MKV</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
