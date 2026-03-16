import { BookOpen, UploadCloud } from 'lucide-react';
import { Lesson } from '../../types/lesson';

interface DocumentViewerProps {
  isReaderMode: boolean;
  lesson: Lesson | null;
  pageImage: string | null;
  currentPage: number;
  isRendering: boolean;
  isGenerating: boolean;
  highlightStartIndex: number;
  highlightEndIndex: number;
  onFileSelect: () => void;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  isReaderMode,
  lesson,
  pageImage,
  currentPage,
  isRendering,
  isGenerating,
  highlightStartIndex,
  highlightEndIndex,
  onFileSelect,
}) => {
  return (
    <div className="flex-1 overflow-auto p-4 md:p-8 bg-zinc-50/50 flex justify-center items-center">
      {isReaderMode && lesson ? (
        <div className="w-full max-w-2xl bg-white shadow-sm ring-1 ring-zinc-200 rounded-lg p-6 md:p-14 overflow-auto h-full">
          <h3 className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-6">Audio Lesson</h3>
          <p className="text-lg md:text-2xl leading-relaxed text-zinc-700 whitespace-pre-wrap font-serif">
            {lesson.explanation.slice(0, highlightStartIndex)}
            <span className="bg-yellow-200 text-black rounded-sm px-0.5">
              {lesson.explanation.slice(highlightStartIndex, highlightEndIndex)}
            </span>
            {lesson.explanation.slice(highlightEndIndex)}
          </p>
        </div>
      ) : pageImage ? (
        <div className="w-full h-full flex justify-center">
          <img 
            src={pageImage} 
            alt={`Page ${currentPage}`} 
            className={`max-w-full max-h-full object-contain shadow-sm ring-1 ring-zinc-200 rounded transition-opacity duration-300 ${isRendering || isGenerating ? 'opacity-50' : 'opacity-100'}`}
          />
        </div>
      ) : (
        <div className="w-full max-w-2xl bg-white shadow-sm ring-1 ring-zinc-200 rounded-lg min-h-[300px] flex items-center justify-center text-zinc-400 p-8 md:p-12 h-full">
          <div className="text-center animate-in fade-in zoom-in-95 duration-500">
            <BookOpen size={48} className="mx-auto mb-4 opacity-20" />
            <h2 className="text-xl font-semibold text-zinc-700 mb-2">Your library is empty</h2>
            <p className="text-zinc-500 mb-6 max-w-sm mx-auto">Upload a PDF to start extracting bite-sized lessons, core concepts, and quizzes.</p>
            <button 
              onClick={onFileSelect}
              className="px-6 py-3 bg-black text-white font-medium rounded-xl flex items-center gap-2 mx-auto hover:bg-zinc-800 active:scale-[0.98] transition-all shadow-md"
            >
              <UploadCloud size={18} />
              Choose PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
