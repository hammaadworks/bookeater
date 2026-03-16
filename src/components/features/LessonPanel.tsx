import { Brain, Loader2, X, ArrowRight, UploadCloud } from 'lucide-react';
import { Lesson } from '../../types/lesson';
import { LessonView } from './LessonView';

interface LessonPanelProps {
  lesson: Lesson | null;
  isGenerating: boolean;
  error: string | null;
  pageImage: string | null;
  pageContextText: string;
  onGenerate: (contextText: string) => void;
  onNextPage: () => void;
}

export const LessonPanel: React.FC<LessonPanelProps> = ({
  lesson,
  isGenerating,
  error,
  pageImage,
  pageContextText,
  onGenerate,
  onNextPage,
}) => {
  return (
    <div className="w-full h-1/2 md:h-full md:w-[450px] lg:w-[500px] flex flex-col bg-white shrink-0 border-t md:border-t-0 md:border-l border-zinc-200">
      <header className="h-14 border-b border-zinc-200 flex items-center justify-between px-6 shrink-0 bg-white">
        <h2 className="font-semibold text-zinc-800 text-sm flex items-center gap-2">
          <Brain size={16} className="text-blue-600" />
          Learning Module
        </h2>
      </header>

      {lesson ? (
        <LessonView lesson={lesson} onNextPage={onNextPage} />
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-zinc-50/30">
          {isGenerating ? (
            <div className="space-y-4 animate-in fade-in duration-500">
              <Loader2 size={32} className="mx-auto text-blue-600 animate-spin" />
              <p className="text-zinc-600 font-medium">Analyzing page context...</p>
              <p className="text-sm text-zinc-400">Extracting core concepts and generating visual aids.</p>
            </div>
          ) : error ? (
            <div className="space-y-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto text-red-500">
                <X size={24} />
              </div>
              <p className="text-red-600 font-medium">Failed to generate lesson</p>
              <p className="text-sm text-red-400 max-w-xs">{error}</p>
              <button 
                onClick={() => onGenerate(pageContextText)}
                className="px-4 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-zinc-800 transition-colors mt-4"
              >
                Try Again
              </button>
            </div>
          ) : pageImage ? (
            <div className="space-y-6">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto text-blue-600 shadow-sm border border-blue-100">
                <Brain size={32} />
              </div>
              <div className="text-center">
                <h3 className="font-bold text-zinc-900 text-xl mb-3">Break Down This Page</h3>
                <p className="text-sm text-zinc-500 leading-relaxed max-w-xs mx-auto mb-6">
                  Turn this dense page into a clear, bite-sized lesson. We'll extract the core concept, explain it simply, and test your understanding.
                </p>
                <button 
                  onClick={() => onGenerate(pageContextText)}
                  className="w-full py-3.5 bg-black text-white font-semibold rounded-xl hover:bg-zinc-800 active:scale-[0.98] transition-all shadow-lg shadow-black/10 flex items-center justify-center gap-2"
                >
                  <Brain size={18} />
                  Analyze Page
                </button>
              </div>
            </div>
          ) : (
            <div className="text-zinc-400 space-y-4">
              <UploadCloud size={48} className="mx-auto opacity-20" />
              <p>Upload a book to start your learning journey.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
