import React from 'react';
import { AlertCircle } from 'lucide-react';

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
}

export const AlertModal: React.FC<AlertModalProps> = ({
  isOpen,
  onClose,
  title = "Notice",
  message
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-[#0F172A] border border-slate-700 rounded-2xl w-full max-w-sm shadow-2xl shadow-black/50 overflow-hidden transform transition-all animate-in zoom-in-95 duration-200">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="shrink-0 p-3 bg-slate-800 rounded-full text-slate-300">
              <AlertCircle size={24} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-slate-100">{title}</h3>
              <p className="mt-2 text-sm text-slate-400 whitespace-pre-wrap leading-relaxed">{message}</p>
            </div>
          </div>
        </div>
        <div className="px-6 py-4 bg-slate-900 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-[#0F172A]"
          >
            Acknowledge
          </button>
        </div>
      </div>
    </div>
  );
};
