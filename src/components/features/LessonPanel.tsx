import { Brain, Loader2, X, UploadCloud, Volume2, Pause, Play, PanelLeftOpen, PanelLeftClose } from 'lucide-react';
import { Lesson } from '../../types/lesson';
import { LessonView } from './LessonView';

interface LessonPanelProps {
  lesson: Lesson | null;
  isGenerating: boolean;
  error: string | null;
  pageImage: string | null;
  pageContextText: string;
  isSourceCollapsed?: boolean;
  isReadingLesson?: boolean;
  isPaused?: boolean;
  isSidebarCollapsed?: boolean;
  currentReadingText?: string;
  highlightStartIndex?: number;
  highlightEndIndex?: number;
  isMobile?: boolean;
  onGenerate: (contextText: string) => void;
  onNextPage: () => void;
  onReadLesson?: () => void;
  onResume?: () => void;
  onPause?: () => void;
  onStop?: () => void;
  onToggleSourcePane?: () => void;
  onToggleSidebarDesktop?: () => void;
}

export const LessonPanel: React.FC<LessonPanelProps> = ({
  lesson,
  isGenerating,
  error,
  pageImage,
  pageContextText,
  isSourceCollapsed,
  isReadingLesson,
  isPaused,
  isSidebarCollapsed,
  currentReadingText,
  highlightStartIndex,
  highlightEndIndex,
  isMobile,
  onGenerate,
  onNextPage,
  onReadLesson,
  onResume,
  onPause,
  onStop,
  onToggleSourcePane,
  onToggleSidebarDesktop,
}) => {
  return (
    <div className={`w-full flex flex-col bg-white shrink-0 relative ${isMobile ? 'h-full' : 'md:h-full md:w-[450px] lg:w-[500px] border-l border-zinc-200'}`}>
      <header className="h-14 border-b border-zinc-200 flex items-center justify-between px-4 md:px-6 shrink-0 bg-white">
        <div className="flex items-center gap-2 min-w-0">
          {!isMobile && isSourceCollapsed && onToggleSidebarDesktop && (
            <button 
              onClick={onToggleSidebarDesktop}
              className="hidden md:flex p-1 -ml-2 text-zinc-500 hover:text-black hover:bg-zinc-100 rounded-lg transition-colors shrink-0"
              title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {isSidebarCollapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
            </button>
          )}
          {!isMobile && onToggleSourcePane && (
            <button 
              onClick={onToggleSourcePane}
              className={`hidden md:flex p-1 ${isSourceCollapsed ? 'mr-2' : '-ml-2 mr-2'} text-zinc-500 hover:text-black hover:bg-zinc-100 rounded-lg transition-colors shrink-0`}
              title={isSourceCollapsed ? "Expand Source Pane" : "Collapse Source Pane"}
            >
              {isSourceCollapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
            </button>
          )}
          <h2 className="font-semibold text-zinc-800 text-sm flex items-center gap-1.5 truncate">
            <Brain size={16} className="text-blue-600 shrink-0" />
            <span className="truncate">Learning Module</span>
          </h2>
        </div>

        {lesson && onReadLesson && (
          <div className="shrink-0 flex items-center ml-2">
            {isReadingLesson ? (
              <div className="flex items-center gap-1 bg-blue-50 px-1 py-1 rounded-lg border border-blue-100 shrink-0">
                <button 
                  onClick={isPaused ? onResume : onPause}
                  className="flex items-center gap-1.5 text-[10px] font-bold text-blue-600 hover:text-blue-700 transition-colors px-2 py-1 rounded-md hover:bg-blue-100 uppercase tracking-wider"
                >
                  {isPaused ? <Play size={14} /> : <Pause size={14} />}
                  <span className="hidden sm:inline">{isPaused ? 'Resume' : 'Pause'}</span>
                </button>
                <button 
                  onClick={onStop}
                  className="p-1.5 text-blue-400 hover:text-blue-500 transition-colors rounded hover:bg-blue-100"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <button 
                onClick={onReadLesson}
                className="flex items-center gap-1.5 text-[10px] font-bold text-blue-600 hover:text-blue-700 transition-colors bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 hover:border-blue-200 uppercase tracking-wider shrink-0"
                title="Read lesson aloud"
              >
                <Volume2 size={14} className="shrink-0" />
                <span className="hidden sm:inline">Read Lesson</span>
              </button>
            )}
          </div>
        )}
      </header>

      {lesson ? (
        <LessonView 
          lesson={lesson} 
          onNextPage={onNextPage} 
          currentReadingText={currentReadingText}
          highlightStartIndex={highlightStartIndex}
          highlightEndIndex={highlightEndIndex}
        />
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
          ) : (pageImage || pageContextText) ? (
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
