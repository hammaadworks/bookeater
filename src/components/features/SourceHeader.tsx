import { ChevronLeft, ChevronRight, Volume2, Pause, Play, X, Menu, PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen } from 'lucide-react';

interface SourceHeaderProps {
  currentPage: number;
  totalPages: number;
  isRendering: boolean;
  isGenerating: boolean;
  isReadingSource: boolean;
  isPaused: boolean;
  isSidebarCollapsed?: boolean;
  isLessonCollapsed?: boolean;
  onPrevPage: () => void;
  onNextPage: () => void;
  onReadSource: () => void;
  onResume: () => void;
  onPause: () => void;
  onStop: () => void;
  onToggleLessonPane?: () => void;
  onToggleSidebar?: () => void;
  onToggleSidebarDesktop?: () => void;
}

export const SourceHeader: React.FC<SourceHeaderProps> = ({
  currentPage,
  totalPages,
  isRendering,
  isGenerating,
  isReadingSource,
  isPaused,
  isSidebarCollapsed,
  isLessonCollapsed,
  onPrevPage,
  onNextPage,
  onReadSource,
  onResume,
  onPause,
  onStop,
  onToggleLessonPane,
  onToggleSidebar,
  onToggleSidebarDesktop,
}) => {
  return (
    <header className="h-14 border-b border-[#222] bg-[#141414] flex items-center justify-between px-3 md:px-6 shrink-0">
      <div className="flex items-center gap-2 md:gap-3 min-w-0">
        {onToggleSidebar && (
          <button 
            onClick={onToggleSidebar}
            className="md:hidden p-2 -ml-2 text-zinc-400 hover:bg-[#2A2A2A] rounded-lg transition-colors shrink-0"
          >
            <Menu size={20} />
          </button>
        )}
        {onToggleSidebarDesktop && (
          <button 
            onClick={onToggleSidebarDesktop}
            className="hidden md:flex p-2 -ml-2 text-zinc-400 hover:bg-[#2A2A2A] rounded-lg transition-colors shrink-0"
            title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isSidebarCollapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
          </button>
        )}
        <h1 className="font-bold text-white text-sm hidden sm:block truncate">
          Source View {totalPages > 0 && <span className="text-zinc-500 font-normal ml-2 tracking-widest uppercase text-[10px]">Page {currentPage} / {totalPages}</span>}
        </h1>
        <h1 className="font-bold text-white text-sm sm:hidden truncate">
          {totalPages > 0 ? `${currentPage}/${totalPages}` : 'Source View'}
        </h1>
      </div>
      <div className="flex items-center gap-1.5 md:gap-3 shrink-0">
        {totalPages > 0 && (
          <div className="flex items-center gap-1 bg-[#222] rounded-lg p-1 shrink-0">
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
        
        {isReadingSource ? (
          <div className="flex items-center gap-1 bg-[#222] px-1 py-1 rounded-lg border border-[#444] shrink-0">
            <button 
              onClick={isPaused ? onResume : onPause}
              className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-300 hover:text-white transition-colors px-2 py-1 rounded-md bg-[#333] hover:bg-[#444] uppercase tracking-wider"
            >
              {isPaused ? <Play size={14} /> : <Pause size={14} />}
              <span className="hidden sm:inline">{isPaused ? 'Resume' : 'Pause'}</span>
            </button>
            <button 
              onClick={onStop}
              className="p-1.5 text-zinc-400 hover:text-white transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <button 
            onClick={onReadSource}
            disabled={isGenerating || isRendering}
            className="flex items-center gap-2 text-[10px] font-bold text-zinc-400 hover:text-white transition-colors bg-[#222] px-3 py-1.5 rounded-lg disabled:opacity-30 border border-transparent hover:border-[#444] uppercase tracking-wider shrink-0"
            title="Read source text aloud"
          >
            <Volume2 size={14} className="shrink-0" />
            <span className="hidden sm:inline">Read Source</span>
          </button>
        )}

        {onToggleLessonPane && (
          <button 
            onClick={onToggleLessonPane}
            className="hidden md:flex p-2 text-zinc-400 hover:bg-[#2A2A2A] rounded-lg transition-colors ml-1 md:ml-2 border-l border-[#333] pl-3 md:pl-4 shrink-0"
            title={isLessonCollapsed ? "Expand Lesson Pane" : "Collapse Lesson Pane"}
          >
            {isLessonCollapsed ? <PanelRightOpen size={20} /> : <PanelRightClose size={20} />}
          </button>
        )}
      </div>
    </header>
  );
};
