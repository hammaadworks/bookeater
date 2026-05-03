import { BookOpen, UploadCloud, Headphones, ChevronLeft, ChevronRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Lesson } from '../../types/lesson';
import { useState } from 'react';

interface DocumentViewerProps {
  isReaderMode: boolean;
  lesson: Lesson | null;
  pageImage: string | null;
  pageContextText?: string;
  fileName?: string;
  currentPage: number;
  isRendering: boolean;
  isGenerating: boolean;
  highlightStartIndex: number;
  highlightEndIndex: number;
  onFileSelect: () => void;
  onParagraphClick?: (text: string) => void;
  currentReadingText?: string;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  isReaderMode,
  lesson,
  pageImage,
  pageContextText,
  fileName,
  currentPage,
  isRendering,
  isGenerating,
  highlightStartIndex,
  highlightEndIndex,
  onFileSelect,
  onParagraphClick,
  currentReadingText,
}) => {
  const [showMiniMap, setShowMiniMap] = useState(true);
  const isMarkdown = fileName?.toLowerCase().endsWith('.md');
  const isText = fileName?.toLowerCase().endsWith('.txt');
  const isCode = !isMarkdown && !isText && !!fileName && !!pageContextText;

  const markdownContent = isCode 
    ? `\`\`\`${fileName?.split('.').pop() || ''}\n${pageContextText}\n\`\`\``
    : pageContextText;

  // Split source text into logical paragraphs for clicking
  const sourceParagraphs = pageContextText 
    ? pageContextText.split(/\n{2,}/).filter(p => p.trim().length > 0)
    : [];

  if (isReaderMode && lesson) {
    return (
      <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden bg-white relative">
        {/* Lesson Pane (Left) */}
        <div className="flex-1 overflow-auto border-r border-zinc-200 p-6 md:p-12 lg:p-16">
          <div className="max-w-2xl mx-auto space-y-8">
            <div 
              className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wider cursor-pointer hover:bg-blue-100 transition-colors"
              onClick={() => onParagraphClick?.(lesson.explanation)}
            >
              <Headphones size={14} />
              AI Mentor
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-zinc-900 leading-tight">
              {lesson.title}
            </h1>
            <div className="prose prose-zinc prose-lg">
              <p className="text-lg md:text-xl leading-relaxed text-zinc-700 font-serif">
                {currentReadingText === lesson.explanation ? (
                  <>
                    {lesson.explanation.slice(0, highlightStartIndex)}
                    <span className="bg-yellow-200 text-black rounded-sm px-0.5">
                      {lesson.explanation.slice(highlightStartIndex, highlightEndIndex)}
                    </span>
                    {lesson.explanation.slice(highlightEndIndex)}
                  </>
                ) : (
                  lesson.explanation
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Source Pane (Right) */}
        <div className="flex-1 overflow-auto bg-zinc-50/50 p-6 md:p-12 lg:p-16">
          <div className="max-w-2xl mx-auto space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-200 text-zinc-700 rounded-full text-xs font-bold uppercase tracking-wider">
              Source Text
            </div>
            <div className="space-y-6">
              {sourceParagraphs.map((para, idx) => (
                <div 
                  key={idx}
                  onClick={() => onParagraphClick?.(para)}
                  className={`p-4 rounded-xl transition-all cursor-pointer border ${
                    currentReadingText === para 
                      ? 'bg-blue-50 border-blue-200 shadow-sm ring-1 ring-blue-500/20' 
                      : 'bg-white border-white hover:border-zinc-200 hover:shadow-sm'
                  }`}
                >
                  <p className="text-base md:text-lg leading-relaxed text-zinc-600 font-serif">
                    {currentReadingText === para ? (
                      <>
                        {para.slice(0, highlightStartIndex)}
                        <span className="bg-yellow-200 text-black rounded-sm px-0.5">
                          {para.slice(highlightStartIndex, highlightEndIndex)}
                        </span>
                        {para.slice(highlightEndIndex)}
                      </>
                    ) : para}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mini-map (Floating) */}
        {pageImage && (
          <div className={`fixed bottom-6 right-6 z-40 transition-all duration-300 ${showMiniMap ? 'w-48' : 'w-10'}`}>
            <div className="bg-white rounded-xl shadow-2xl border border-zinc-200 overflow-hidden">
              <div 
                className="p-2 flex items-center justify-between bg-zinc-100 border-b border-zinc-200 cursor-pointer"
                onClick={() => setShowMiniMap(!showMiniMap)}
              >
                {showMiniMap && <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-tighter ml-1">Original Page</span>}
                <div className="p-1 rounded hover:bg-zinc-200">
                  {showMiniMap ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                </div>
              </div>
              {showMiniMap && (
                <div className="p-2 aspect-[3/4]">
                  <img src={pageImage} alt="Mini-map" className="w-full h-full object-contain rounded border border-zinc-100" />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto p-4 md:p-8 bg-zinc-50/50 flex justify-center items-center">
      {pageImage ? (
        <div className="w-full h-full flex justify-center">
          <img 
            src={pageImage} 
            alt={`Page ${currentPage}`} 
            className={`max-w-full max-h-full object-contain shadow-sm ring-1 ring-zinc-200 rounded transition-opacity duration-300 ${isRendering || isGenerating ? 'opacity-50' : 'opacity-100'}`}
          />
        </div>
      ) : markdownContent ? (
        <div className="w-full h-full flex justify-center">
          <div className="w-full max-w-4xl bg-white shadow-sm ring-1 ring-zinc-200 rounded-lg p-6 md:p-10 overflow-auto text-left">
            <article className="prose prose-zinc prose-sm md:prose-base max-w-none">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  code({node, inline, className, children, ...props}: any) {
                    const match = /language-(\w+)/.exec(className || '');
                    return !inline && match ? (
                      <SyntaxHighlighter
                        style={vscDarkPlus as any}
                        language={match[1]}
                        PreTag="div"
                        {...props}
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    ) : (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    )
                  }
                }}
              >
                {markdownContent}
              </ReactMarkdown>
            </article>
          </div>
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
              Choose File
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
