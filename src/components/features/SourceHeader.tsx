import { ChevronLeft, ChevronRight, Volume2, Pause, Play, X, Menu, PanelLeftClose, PanelLeftOpen } from 'lucide-react';

interface SourceHeaderProps {
  currentPage: number;
  totalPages: number;
  isRendering: boolean;
  isGenerating: boolean;
  isReaderMode: boolean;
  isPaused: boolean;
  hasLesson: boolean;
  isSidebarCollapsed?: boolean;
  onPrevPage: () => void;
  onNextPage: () => void;
  onReadPage: () => void;
  onResume: () => void;
  onPause: () => void;
  onCloseReader: () => void;
  onToggleSidebar?: () => void;
  onToggleSidebarDesktop?: () => void;
}

export const SourceHeader: React.FC<SourceHeaderProps> = ({
  currentPage,
  totalPages,
  isRendering,
  isGenerating,
  isReaderMode,
  isPaused,
  hasLesson,
  isSidebarCollapsed,
  onPrevPage,
  onNextPage,
  onReadPage,
  onResume,
  onPause,
  onCloseReader,
  onToggleSidebar,
  onToggleSidebarDesktop,
}) => {
  return (
    <header className="h-14 border-b border-zinc-200 flex items-center justify-between px-4 md:px-6 shrink-0">
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button 
            onClick={onToggleSidebar}
            className="md:hidden p-2 -ml-2 text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors"
          >
            <Menu size={20} />
          </button>
        )}
        {onToggleSidebarDesktop && (
          <button 
            onClick={onToggleSidebarDesktop}
            className="hidden md:flex p-2 -ml-2 text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors"
            title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isSidebarCollapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
          </button>
        )}
        <h1 className="font-semibold text-zinc-800 text-sm hidden sm:block">
          Source View {totalPages > 0 && <span className="text-zinc-400 font-normal ml-2">Page {currentPage} of {totalPages}</span>}
        </h1>
        <h1 className="font-semibold text-zinc-800 text-sm sm:hidden">
          {totalPages > 0 ? `Page ${currentPage}/${totalPages}` : 'Source View'}
        </h1>
      </div>
      <div className="flex items-center gap-2 md:gap-3">
        {totalPages > 0 && (
          <div className="flex items-center gap-1 bg-zinc-100 rounded-lg p-1">
            <button 
              onClick={onPrevPage}
              disabled={currentPage <= 1 || isRendering || isGenerating}
              className="p-1 rounded text-zinc-600 hover:bg-white disabled:opacity-50 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <button 
              onClick={onNextPage}
              disabled={currentPage >= totalPages || isRendering || isGenerating}
              className="p-1 rounded text-zinc-600 hover:bg-white disabled:opacity-50 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
        
        {!isReaderMode ? (
          <button 
            onClick={onReadPage}
            disabled={!hasLesson || isGenerating || isRendering}
            className="flex items-center gap-2 text-xs font-medium text-zinc-500 hover:text-black transition-colors bg-zinc-100 px-3 py-1.5 rounded-full disabled:opacity-50"
            title="Reads the lesson explanation aloud"
          >
            <Volume2 size={14} className="shrink-0" />
            <span className="hidden sm:inline">Listen to Lesson</span>
            <span className="sm:hidden">Listen</span>
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button 
              onClick={isPaused ? onResume : onPause}
              className="flex items-center gap-2 text-xs font-medium text-white bg-black px-3 py-1.5 rounded-full hover:bg-zinc-800 transition-colors"
            >
              {isPaused ? <Play size={14} /> : <Pause size={14} />}
              <span className="hidden sm:inline">{isPaused ? 'Resume' : 'Pause'}</span>
            </button>
            <button 
              onClick={onCloseReader}
              className="flex items-center gap-2 text-xs font-medium text-zinc-500 hover:text-black transition-colors bg-zinc-100 px-3 py-1.5 rounded-full"
            >
              <X size={14} />
              <span className="hidden sm:inline">Close</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
