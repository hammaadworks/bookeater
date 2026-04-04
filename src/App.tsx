import React, { useRef, useState, useEffect } from 'react';
import { BookOpen, Settings, Volume2, VolumeX, MessageSquare, ChevronLeft, ChevronRight, UploadCloud, X, Pause, Play, Brain, Loader2, ArrowRight } from 'lucide-react';
import { usePDF } from './hooks/usePDF';
import { useLessonEngine } from './hooks/useLessonEngine';
import { useTTS } from './hooks/useTTS';
import { SettingsModal } from './components/SettingsModal';
import { LessonView } from './components/LessonView';

function App() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { loadPDF, pageImage, currentPage, totalPages, isRendering, goToNextPage, goToPrevPage } = usePDF();
  const { lesson, generateLesson, isGenerating, error, setLesson } = useLessonEngine();
  const { play, pause, resume, stop, isPlaying, isPaused, highlightStartIndex, highlightEndIndex } = useTTS();
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isReaderMode, setIsReaderMode] = useState(false);

  // If page changes, reset lesson and exit reader mode automatically
  useEffect(() => {
    setLesson(null);
    if (isReaderMode) {
      closeReaderMode();
    }
  }, [currentPage, setLesson]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      loadPDF(file);
    }
  };

  const handleReadPage = async () => {
    if (isReaderMode) return;
    
    // Fallback: If we have the core text in a lesson, just read that. 
    // If not, we could extract text, but for the MVP, let's keep the audio focused on the lesson's explanation!
    if (lesson?.explanation) {
      setIsReaderMode(true);
      play(lesson.explanation);
    } else {
      alert("Generate a lesson first to read its explanation aloud.");
    }
  };

  const closeReaderMode = () => {
    setIsReaderMode(false);
    stop();
  };

  const handleNextPageWithLesson = () => {
    goToNextPage();
  };

  return (
    <div className="flex h-screen w-full bg-zinc-100 overflow-hidden font-sans">
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

      {/* Sidebar / Navigation */}
      <nav className="w-16 bg-white border-r border-zinc-200 flex flex-col items-center py-4 gap-6 shrink-0 z-10">
        <div className="p-2 bg-black text-white rounded-lg">
          <BookOpen size={24} />
        </div>
        <div className="flex-1"></div>
        <button 
          onClick={() => setIsSettingsOpen(true)}
          className="p-2 text-zinc-400 hover:text-black transition-colors rounded-lg hover:bg-zinc-100"
          title="Settings"
        >
          <Settings size={24} />
        </button>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 flex overflow-hidden">
        
        {/* Left Pane: Original Text / Image View */}
        <div className="flex-1 flex flex-col border-r border-zinc-200 bg-white overflow-hidden relative">
          {/* Header */}
          <header className="h-14 border-b border-zinc-200 flex items-center justify-between px-6 shrink-0">
            <h1 className="font-semibold text-zinc-800 text-sm">
              Source View {totalPages > 0 && <span className="text-zinc-400 font-normal ml-2">Page {currentPage} of {totalPages}</span>}
            </h1>
            <div className="flex items-center gap-3">
              {totalPages > 0 && (
                <div className="flex items-center gap-1 mr-4 bg-zinc-100 rounded-lg p-1">
                  <button 
                    onClick={goToPrevPage}
                    disabled={currentPage <= 1 || isRendering || isGenerating}
                    className="p-1 rounded text-zinc-600 hover:bg-white disabled:opacity-50 transition-colors"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button 
                    onClick={goToNextPage}
                    disabled={currentPage >= totalPages || isRendering || isGenerating}
                    className="p-1 rounded text-zinc-600 hover:bg-white disabled:opacity-50 transition-colors"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
              
              {!isReaderMode ? (
                <button 
                  onClick={handleReadPage}
                  disabled={!lesson || isGenerating || isRendering}
                  className="flex items-center gap-2 text-xs font-medium text-zinc-500 hover:text-black transition-colors bg-zinc-100 px-3 py-1.5 rounded-full disabled:opacity-50"
                  title="Reads the lesson explanation aloud"
                >
                  <Volume2 size={14} />
                  Listen to Lesson
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button 
                    onClick={isPaused ? resume : pause}
                    className="flex items-center gap-2 text-xs font-medium text-white bg-black px-3 py-1.5 rounded-full hover:bg-zinc-800 transition-colors"
                  >
                    {isPaused ? <Play size={14} /> : <Pause size={14} />}
                    {isPaused ? 'Resume' : 'Pause'}
                  </button>
                  <button 
                    onClick={closeReaderMode}
                    className="flex items-center gap-2 text-xs font-medium text-zinc-500 hover:text-black transition-colors bg-zinc-100 px-3 py-1.5 rounded-full"
                  >
                    <X size={14} />
                    Close
                  </button>
                </div>
              )}
            </div>
          </header>
          
          {/* Document Area */}
          <div className="flex-1 overflow-auto p-8 bg-zinc-50/50 flex justify-center">
            {isReaderMode && lesson ? (
              <div className="w-full max-w-2xl bg-white shadow-sm ring-1 ring-zinc-200 rounded-lg p-10 md:p-14 overflow-auto">
                <h3 className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-6">Audio Lesson</h3>
                <p className="text-xl md:text-2xl leading-relaxed text-zinc-700 whitespace-pre-wrap font-serif">
                  {lesson.explanation.slice(0, highlightStartIndex)}
                  <span className="bg-yellow-200 text-black rounded-sm px-0.5">
                    {lesson.explanation.slice(highlightStartIndex, highlightEndIndex)}
                  </span>
                  {lesson.explanation.slice(highlightEndIndex)}
                </p>
              </div>
            ) : pageImage ? (
              <div className="w-full max-w-3xl flex justify-center h-fit">
                <img 
                  src={pageImage} 
                  alt={`Page ${currentPage}`} 
                  className={`max-w-full h-auto object-contain shadow-sm ring-1 ring-zinc-200 rounded transition-opacity duration-300 ${isRendering || isGenerating ? 'opacity-50' : 'opacity-100'}`}
                />
              </div>
            ) : (
              <div className="w-full max-w-2xl bg-white shadow-sm ring-1 ring-zinc-200 rounded-lg min-h-[800px] flex items-center justify-center text-zinc-400 p-12">
                <div className="text-center">
                  <BookOpen size={48} className="mx-auto mb-4 opacity-20" />
                  <p>Upload a PDF to start reading.</p>
                  <input 
                    type="file" 
                    accept="application/pdf"
                    className="hidden" 
                    ref={fileInputRef}
                    onChange={handleFileChange}
                  />
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-6 px-4 py-2 bg-black text-white text-sm font-medium rounded-lg flex items-center gap-2 mx-auto hover:bg-zinc-800 transition-colors"
                  >
                    <UploadCloud size={16} />
                    Select Book
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Pane: Lesson Engine */}
        <div className="w-[450px] lg:w-[500px] flex flex-col bg-white shrink-0 border-l border-zinc-200">
           {/* Header */}
           <header className="h-14 border-b border-zinc-200 flex items-center justify-between px-6 shrink-0 bg-white">
            <h2 className="font-semibold text-zinc-800 text-sm flex items-center gap-2">
              <Brain size={16} className="text-blue-600" />
              Learning Module
            </h2>
          </header>

          {/* Lesson Content */}
          {lesson ? (
            <LessonView lesson={lesson} onNextPage={handleNextPageWithLesson} />
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
                     onClick={() => generateLesson(pageImage)}
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
                   <div>
                     <h3 className="font-bold text-zinc-900 text-lg mb-2">Ready to Learn?</h3>
                     <p className="text-sm text-zinc-500 leading-relaxed max-w-xs mx-auto">
                       I'll convert this page into a bite-sized lesson, explain the core concepts, and quiz your understanding before we move on.
                     </p>
                   </div>
                   <button 
                     onClick={() => generateLesson(pageImage)}
                     className="w-full py-3 bg-black text-white text-sm font-bold rounded-xl hover:bg-zinc-800 transition-colors shadow-lg shadow-black/10 flex items-center justify-center gap-2"
                   >
                     Generate Lesson
                     <ArrowRight size={16} />
                   </button>
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
        
      </main>
    </div>
  );
}

export default App;
