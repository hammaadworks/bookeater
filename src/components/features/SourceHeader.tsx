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
    <header className="h-14 border-b border-[#222] bg-[#141414] flex items-center justify-between px-4 md:px-6 shrink-0">
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button 
            onClick={onToggleSidebar}
            className="md:hidden p-2 -ml-2 text-zinc-400 hover:bg-[#2A2A2A] rounded-lg transition-colors"
          >
            <Menu size={20} />
          </button>
        )}
        {onToggleSidebarDesktop && (
          <button 
            onClick={onToggleSidebarDesktop}
            className="hidden md:flex p-2 -ml-2 text-zinc-400 hover:bg-[#2A2A2A] rounded-lg transition-colors"
            title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isSidebarCollapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
          </button>
        )}
        <h1 className="font-bold text-white text-sm hidden sm:block">
          Source View {totalPages > 0 && <span className="text-zinc-500 font-normal ml-2 tracking-widest uppercase text-[10px]">Page {currentPage} / {totalPages}</span>}
        </h1>
        <h1 className="font-bold text-white text-sm sm:hidden">
          {totalPages > 0 ? `${currentPage}/${totalPages}` : 'Source View'}
        </h1>
      </div>
      <div className="flex items-center gap-2 md:gap-3">
        {totalPages > 0 && (
          <div className="flex items-center gap-1 bg-[#222] rounded-lg p-1">
            <button 
              onClick={onPrevPage}
              disabled={currentPage <= 1 || isRendering || isGenerating}
              className="p-1 rounded text-zinc-400 hover:bg-[#333] hover:text-white disabled:opacity-30 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <button 
              onClick={onNextPage}
              disabled={currentPage >= totalPages || isRendering || isGenerating}
              className="p-1 rounded text-zinc-400 hover:bg-[#333] hover:text-white disabled:opacity-30 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
        
        {!isReaderMode ? (
          <button 
            onClick={onReadPage}
            disabled={!hasLesson || isGenerating || isRendering}
            className="flex items-center gap-2 text-[10px] font-bold text-zinc-400 hover:text-white transition-colors bg-[#222] px-3 py-1.5 rounded-lg disabled:opacity-30 border border-transparent hover:border-[#444] uppercase tracking-wider"
            title="Reads the lesson explanation aloud"
          >
            <Volume2 size={14} className="shrink-0" />
            <span className="hidden sm:inline">Listen to Lesson</span>
            <span className="sm:hidden">Listen</span>
          </button>
        ) : (
          <div className="flex items-center gap-2 bg-blue-600/10 px-1 py-1 rounded-lg border border-blue-500/30">
            <button 
              onClick={isPaused ? onResume : onPause}
              className="flex items-center gap-2 text-[10px] font-bold text-blue-400 hover:text-blue-300 transition-colors px-3 py-1.5 rounded-md bg-blue-500/10 uppercase tracking-wider"
            >
              {isPaused ? <Play size={14} /> : <Pause size={14} />}
              <span className="hidden sm:inline">{isPaused ? 'Resume' : 'Pause'}</span>
            </button>
            <button 
              onClick={onCloseReader}
              className="p-1.5 text-blue-400 hover:text-blue-300 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
