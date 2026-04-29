import { useState, useEffect, useCallback } from 'react';
import { usePDF } from './hooks/features/usePDF';
import { useLessonEngine } from './hooks/features/useLessonEngine';
import { useTTS } from './hooks/features/useTTS';
import { SettingsModal } from './components/features/SettingsModal';
import { Sidebar } from './components/layout/Sidebar';
import { SourceHeader } from './components/features/SourceHeader';
import { DocumentViewer } from './components/features/DocumentViewer';
import { LessonPanel } from './components/features/LessonPanel';

function App() {
  const { 
    sessions,
    wraps,
    currentSessionId,
    loadSession,
    loadPDF, 
    updateSession,
    deleteSession,
    createWrap,
    updateWrap,
    deleteWrap,
    pageImage, 
    pageContextText,
    currentPage, 
    totalPages, 
    isRendering, 
    goToNextPage, 
    goToPrevPage 
  } = usePDF();
  const { lesson, generateLesson, isGenerating, error } = useLessonEngine(currentPage, currentSessionId);
  const { 
    play, 
    pause, 
    resume, 
    stop, 
    isPaused, 
    highlightStartIndex, 
    highlightEndIndex 
  } = useTTS();
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isReaderMode, setIsReaderMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeWrapId, setActiveWrapId] = useState<string | undefined>(undefined);

  // Synchronize reader mode with page changes
  useEffect(() => {
    if (isReaderMode) {
      setIsReaderMode(false);
      stop();
    }
  }, [currentPage, stop]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      loadPDF(file, activeWrapId);
      setIsSidebarOpen(false); // Close sidebar on mobile after selecting a file
    }
    // Clear the input value so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [loadPDF, activeWrapId]);

  const handleReadPage = useCallback(() => {
    if (isReaderMode) return;
    
    if (lesson?.explanation) {
      setIsReaderMode(true);
      play(lesson.explanation);
    } else {
      alert("Generate a lesson first to read its explanation aloud.");
    }
  }, [isReaderMode, lesson, play]);

  const handleCloseReader = useCallback(() => {
    setIsReaderMode(false);
    stop();
  }, [stop]);

  const handleNextPage = useCallback(() => {
    goToNextPage();
  }, [goToNextPage]);

  const handlePrevPage = useCallback(() => {
    goToPrevPage();
  }, [goToPrevPage]);

  const handleFileSelect = useCallback((wrapIdOrEvent?: string | React.MouseEvent) => {
    const wrapId = typeof wrapIdOrEvent === 'string' ? wrapIdOrEvent : undefined;
    setActiveWrapId(wrapId);
    fileInputRef.current?.click();
  }, []);

  return (
    <div className="flex h-screen w-full bg-zinc-100 overflow-hidden font-sans">
      <input 
        type="file" 
        className="hidden" 
        ref={fileInputRef} 
        accept="application/pdf" 
        onChange={handleFileChange} 
      />
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar 
          sessions={sessions}
          wraps={wraps}
          currentSessionId={currentSessionId}
          onSessionSelect={(id) => { loadSession(id); setIsSidebarOpen(false); }}
          onSettingsClick={() => { setIsSettingsOpen(true); setIsSidebarOpen(false); }} 
          onNewSessionClick={handleFileSelect}
          onSessionUpdate={updateSession}
          onSessionDelete={deleteSession}
          onCreateWrap={createWrap}
          onUpdateWrap={updateWrap}
          onDeleteWrap={deleteWrap}
        />
      </div>

      <main className="flex-1 flex flex-col md:flex-row overflow-hidden w-full">
        <div className="flex-1 flex flex-col border-b md:border-b-0 md:border-r border-zinc-200 bg-white overflow-hidden relative">
          <SourceHeader 
            currentPage={currentPage}
            totalPages={totalPages}
            isRendering={isRendering}
            isGenerating={isGenerating}
            isReaderMode={isReaderMode}
            isPaused={isPaused}
            hasLesson={!!lesson}
            onPrevPage={handlePrevPage}
            onNextPage={handleNextPage}
            onReadPage={handleReadPage}
            onResume={resume}
            onPause={pause}
            onCloseReader={handleCloseReader}
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          />
          
          <DocumentViewer 
            isReaderMode={isReaderMode}
            lesson={lesson}
            pageImage={pageImage}
            currentPage={currentPage}
            isRendering={isRendering}
            isGenerating={isGenerating}
            highlightStartIndex={highlightStartIndex}
            highlightEndIndex={highlightEndIndex}
            onFileSelect={handleFileSelect}
          />
        </div>

        <LessonPanel 
          lesson={lesson}
          isGenerating={isGenerating}
          error={error}
          pageImage={pageImage}
          pageContextText={pageContextText}
          onGenerate={(contextText) => generateLesson(pageImage, contextText)}
          onNextPage={handleNextPage}
        />
      </main>
    </div>
  );
}

export default App;
