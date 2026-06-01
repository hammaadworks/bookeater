import { useState, useEffect, useCallback, useRef } from 'react';
import { usePDF } from './hooks/features/usePDF';
import { useLessonEngine } from './hooks/features/useLessonEngine';
import { useTTS } from './hooks/features/useTTS';
import { SettingsModal } from './components/features/SettingsModal';
import { Sidebar } from './components/layout/Sidebar';
import { SessionEditModal } from './components/features/SessionEditModal';
import { ShelfEditModal } from './components/features/ShelfEditModal';
import { SourceHeader } from './components/features/SourceHeader';
import { DocumentViewer } from './components/features/DocumentViewer';
import { LessonPanel } from './components/features/LessonPanel';
import { BottomSheet } from './components/ui/BottomSheet';
import { AlertModal } from './components/ui/AlertModal';
import { AddSourceModal } from './components/ui/AddSourceModal';
import { BookSession, Shelf } from './types/session';
import { Brain } from 'lucide-react';

function App() {
  const { 
    sessions,
    shelves,
    currentSessionId,
    loadSession,
    loadPDF, 
    loadYoutube,
    updateSession,
    deleteSession,
    createShelf,
    updateShelf,
    deleteShelf,
    pageImage, 
    pageText,
    pageContextText,
    currentPage, 
    totalPages, 
    isRendering, 
    error: pdfError,
    goToNextPage, 
    goToPrevPage 
  } = usePDF();
  const { lesson, generateLesson, isGenerating, error } = useLessonEngine(currentPage, currentSessionId);
  const { 
    play, 
    pause, 
    resume, 
    stop, 
    isPlaying,
    isPaused, 
    currentText,
    highlightStartIndex, 
    highlightEndIndex 
  } = useTTS();
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  // Layout States
  const [isSourceCollapsed, setIsSourceCollapsed] = useState(false);
  const [isLessonCollapsed, setIsLessonCollapsed] = useState(false);
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeShelfId, setActiveShelfId] = useState<string | undefined>(undefined);

  // Custom Modal States
  const [editingSession, setEditingSession] = useState<BookSession | null>(null);
  const [editingShelf, setEditingShelf] = useState<Partial<Shelf> | null>(null);
  const [alertModal, setAlertModal] = useState<{isOpen: boolean, title?: string, message: string}>({ isOpen: false, message: '' });
  const [isSourceModalOpen, setIsSourceModalOpen] = useState(false);

  // Automatically open lesson pane if a lesson exists (and ensure it's not collapsed)
  useEffect(() => {
    if (lesson) {
      if (isLessonCollapsed) setIsLessonCollapsed(false);
      setIsMobileSheetOpen(true);
    }
  }, [lesson]);

  // Handle PDF errors
  useEffect(() => {
    if (pdfError) {
      setAlertModal({ isOpen: true, title: 'Document Error', message: pdfError });
    }
  }, [pdfError]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.name.match(/\.(exe|msi|bat|sh|bin|app)$/i)) {
        alert("Executable files are not supported.\n\nSupported files include:\n- Documents (.pdf, .txt, .md)\n- Videos (.mp4, .mkv, .mov, .webm)\n- Images (.png, .jpg, .webp)");
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }
      loadPDF(file, activeShelfId);
      setIsSidebarOpen(false); // Close sidebar on mobile after selecting a file
    }
    // Clear the input value so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [loadPDF, activeShelfId]);

  const handleReadSource = useCallback(() => {
    if (pageText) {
      play(pageText);
    } else {
      setAlertModal({
        isOpen: true,
        title: "Cannot Read Source",
        message: "No text available to read on this page."
      });
    }
  }, [pageText, play]);

  const handleToggleSourcePane = useCallback(() => {
    if (!isSourceCollapsed && isLessonCollapsed) {
      // Cannot collapse both
      setIsLessonCollapsed(false);
    }
    setIsSourceCollapsed(!isSourceCollapsed);
  }, [isSourceCollapsed, isLessonCollapsed]);

  const handleToggleLessonPane = useCallback(() => {
    if (!isLessonCollapsed && isSourceCollapsed) {
      // Cannot collapse both
      setIsSourceCollapsed(false);
    }
    setIsLessonCollapsed(!isLessonCollapsed);
  }, [isSourceCollapsed, isLessonCollapsed]);

  const handleNextPage = useCallback(() => {
    goToNextPage();
  }, [goToNextPage]);

  const handlePrevPage = useCallback(() => {
    goToPrevPage();
  }, [goToPrevPage]);

  const handleFileSelect = useCallback((shelfIdOrEvent?: string | React.MouseEvent) => {
    const shelfId = typeof shelfIdOrEvent === 'string' ? shelfIdOrEvent : undefined;
    setActiveShelfId(shelfId);
    setIsSourceModalOpen(true);
  }, []);

  const isReadingSource = (isPlaying || isPaused) && !!pageText && !!currentText && pageText.includes(currentText);
  const isReadingLesson = (isPlaying || isPaused) && !!lesson && currentText === lesson.explanation;

  const renderLessonPanel = (isMobile: boolean) => (
    <LessonPanel 
      lesson={lesson}
      isGenerating={isGenerating}
      error={error}
      pageImage={pageImage}
      pageContextText={pageContextText}
      onGenerate={(contextText) => {
        generateLesson(pageImage, contextText);
        setIsMobileSheetOpen(true);
      }}
      onNextPage={handleNextPage}
      onReadLesson={() => lesson && play(lesson.explanation)}
      onResume={resume}
      onPause={pause}
      onStop={stop}
      isSourceCollapsed={isSourceCollapsed}
      isReadingLesson={isReadingLesson}
      isPaused={isPaused}
      onToggleSourcePane={handleToggleSourcePane}
      isSidebarCollapsed={isSidebarCollapsed}
      onToggleSidebarDesktop={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      currentReadingText={currentText}
      highlightStartIndex={highlightStartIndex}
      highlightEndIndex={highlightEndIndex}
      isMobile={isMobile}
    />
  );

  return (
    <div className="flex h-screen w-full bg-[#0F0F0F] overflow-hidden font-sans text-zinc-300">
      <input 
        type="file" 
        className="hidden" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
      />
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
      <SessionEditModal 
        isOpen={!!editingSession}
        onClose={() => setEditingSession(null)}
        session={editingSession}
        onSave={updateSession}
        onDelete={deleteSession}
      />
      <ShelfEditModal
        isOpen={!!editingShelf}
        onClose={() => setEditingShelf(null)}
        shelf={editingShelf}
        onSave={async (shelfData) => {
          if (editingShelf?.id) {
            updateShelf(editingShelf.id, shelfData);
          } else {
            await createShelf(shelfData);
          }
        }}
        onDelete={deleteShelf}
      />
      <AlertModal 
        isOpen={alertModal.isOpen}
        title={alertModal.title}
        message={alertModal.message}
        onClose={() => setAlertModal({ isOpen: false, message: '' })}
      />
      <AddSourceModal
        isOpen={isSourceModalOpen}
        onClose={() => setIsSourceModalOpen(false)}
        onYoutubeSubmit={(url) => loadYoutube(url, activeShelfId)}
        onLocalFileClick={() => fileInputRef.current?.click()}
      />

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/70 z-40 md:hidden" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div 
        className={`fixed inset-y-0 left-0 z-50 transition-all duration-300 ease-in-out md:relative flex overflow-hidden border-r border-[#222] ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } ${isSidebarCollapsed ? 'md:w-0' : 'md:w-[260px]'}`}
      >
        <div className="w-[260px] shrink-0 h-full">
          <Sidebar 
            sessions={sessions}
            shelves={shelves}
            currentSessionId={currentSessionId}
            onSessionSelect={(id) => { loadSession(id); setIsSidebarOpen(false); }}
            onSettingsClick={() => { setIsSettingsOpen(true); setIsSidebarOpen(false); }} 
            onNewSessionClick={handleFileSelect}
            onSessionUpdate={updateSession}
            onSessionDelete={deleteSession}
            onCreateShelf={createShelf}
            onUpdateShelf={updateShelf}
            onDeleteShelf={deleteShelf}
            onSessionEdit={setEditingSession}
            onShelfEdit={setEditingShelf}
          />
        </div>
      </div>

      <main className="flex-1 flex flex-col md:flex-row overflow-hidden w-full relative">
        {/* Source Pane (Visible on Mobile ALWAYS, visible on Desktop if not collapsed) */}
        <div className={`flex-1 flex flex-col border-b md:border-b-0 md:border-r border-[#222] bg-[#141414] overflow-hidden relative ${isSourceCollapsed ? 'hidden md:flex md:w-0 md:flex-none' : 'flex'}`}>
          <SourceHeader 
            currentPage={currentPage}
            totalPages={totalPages}
            isRendering={isRendering}
            isGenerating={isGenerating}
            isReadingSource={isReadingSource}
            isPaused={isPaused}
            isSidebarCollapsed={isSidebarCollapsed}
            isLessonCollapsed={isLessonCollapsed}
            onPrevPage={handlePrevPage}
            onNextPage={handleNextPage}
            onReadSource={handleReadSource}
            onResume={resume}
            onPause={pause}
            onStop={stop}
            onToggleLessonPane={handleToggleLessonPane}
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            onToggleSidebarDesktop={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          />
          
          <DocumentViewer 
            pageImage={pageImage}
            pageText={pageText}
            fileName={sessions.find(s => s.id === currentSessionId)?.name}
            currentPage={currentPage}
            isRendering={isRendering}
            isGenerating={isGenerating}
            highlightStartIndex={highlightStartIndex}
            highlightEndIndex={highlightEndIndex}
            onFileSelect={handleFileSelect}
            onParagraphClick={play}
            currentReadingText={currentText}
          />
        </div>

        {/* Desktop Lesson Pane */}
        {!isLessonCollapsed && (
          <div className="hidden md:flex shrink-0">
            {renderLessonPanel(false)}
          </div>
        )}

        {/* Mobile Bottom Sheet Lesson Pane */}
        <BottomSheet isOpen={isMobileSheetOpen} onClose={() => setIsMobileSheetOpen(false)}>
          {renderLessonPanel(true)}
        </BottomSheet>

        {/* Mobile Floating Action Button to open Lesson Sheet if closed */}
        {!isMobileSheetOpen && (pageImage || pageContextText) && (
          <button 
            onClick={() => setIsMobileSheetOpen(true)}
            className="md:hidden fixed bottom-6 right-6 z-30 bg-blue-600 text-white p-4 rounded-full shadow-lg shadow-blue-900/20 active:scale-95 transition-transform"
          >
            <Brain size={24} />
          </button>
        )}
      </main>
    </div>
  );
}

export default App;
