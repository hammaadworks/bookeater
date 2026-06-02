import { BookOpen, UploadCloud, FileText, Image as ImageIcon } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useState, useMemo } from 'react';

interface DocumentViewerProps {
  pageImage: string | null;
  pageText?: string;
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
  pageImage,
  pageText,
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
  const [viewMode, setViewMode] = useState<'page' | 'text'>('page');
  
  const isMarkdown = fileName?.toLowerCase().endsWith('.md');
  const isText = fileName?.toLowerCase().endsWith('.txt');
  const isCode = !isMarkdown && !isText && !!fileName && !!pageText;

  const markdownContent = isCode 
    ? `\`\`\`${fileName?.split('.').pop() || ''}\n${pageText}\n\`\`\``
    : pageText;

  const sourceParagraphs = useMemo(() => {
    if (!pageText) return [];
    
    // Normalize escaped newlines to actual newlines to support weird data formats
    const normalizedText = pageText.replace(/\\n/g, '\n');
    
    const paragraphs: { text: string; startIndex: number; endIndex: number }[] = [];
    const splits = normalizedText.split(/(?:\r?\n){2,}/);
    let currentIndex = 0;
    
    for (const split of splits) {
      const trimmed = split.trim();
      if (trimmed.length > 0) {
        const startIndex = normalizedText.indexOf(split, currentIndex);
        paragraphs.push({ text: split, startIndex, endIndex: startIndex + split.length });
        currentIndex = startIndex + split.length;
      }
    }
    return paragraphs;
  }, [pageText]);

  const normalizedPageText = pageText ? pageText.replace(/\\n/g, '\n') : undefined;

  const readingOffset = normalizedPageText && currentReadingText ? normalizedPageText.indexOf(currentReadingText) : -1;
  const absoluteHighlightStart = readingOffset !== -1 ? readingOffset + highlightStartIndex : -1;
  const absoluteHighlightEnd = readingOffset !== -1 ? readingOffset + highlightEndIndex : -1;

  const hasLoadedContent = pageImage || markdownContent;

  if (!hasLoadedContent) {
    return (
      <div className="flex-1 overflow-auto p-4 md:p-8 bg-zinc-50/50 flex justify-center items-center">
        <div className="w-full max-w-2xl bg-white shadow-sm ring-1 ring-zinc-200 rounded-lg min-h-[300px] flex items-center justify-center text-zinc-400 p-8 md:p-12 h-full">
          <div className="text-center animate-in fade-in zoom-in-95 duration-500">
            <BookOpen size={48} className="mx-auto mb-4 opacity-20" />
            <h2 className="text-xl font-semibold text-zinc-700 mb-2">Your study space is empty</h2>
            <p className="text-zinc-500 mb-6 max-w-sm mx-auto">Upload a document, video, or YouTube link to start learning with deep, AI-powered notes.</p>
            <button 
              onClick={onFileSelect}
              className="px-6 py-3 bg-black text-white font-medium rounded-xl flex items-center gap-2 mx-auto hover:bg-zinc-800 active:scale-[0.98] transition-all shadow-md"
            >
              <UploadCloud size={18} />
              Add Source
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-zinc-50/50 relative">
      {/* Toggle View Control */}
      {pageImage && pageText && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-white shadow-md border border-zinc-200 rounded-full p-1 flex items-center gap-1">
          <button
            onClick={() => setViewMode('page')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
              viewMode === 'page' ? 'bg-black text-white shadow' : 'text-zinc-500 hover:text-black hover:bg-zinc-100'
            }`}
          >
            <ImageIcon size={14} />
            Page
          </button>
          <button
            onClick={() => setViewMode('text')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
              viewMode === 'text' ? 'bg-black text-white shadow' : 'text-zinc-500 hover:text-black hover:bg-zinc-100'
            }`}
          >
            <FileText size={14} />
            Text
          </button>
        </div>
      )}

      {/* Content Area */}
      <div className="flex-1 overflow-auto p-4 md:p-8 flex justify-center items-start">
        {pageImage && (viewMode === 'page' || !pageText) ? (
          <img 
            src={pageImage} 
            alt={`Page ${currentPage}`} 
            className={`max-w-full max-h-full object-contain shadow-sm ring-1 ring-zinc-200 rounded transition-opacity duration-300 mx-auto ${isRendering || isGenerating ? 'opacity-50' : 'opacity-100'}`}
          />
        ) : markdownContent && (!pageImage || viewMode === 'text') ? (
          <div className="w-full max-w-2xl mx-auto space-y-6 pb-20">
            {sourceParagraphs.map((para, idx) => {
              const isActive = absoluteHighlightStart >= para.startIndex && absoluteHighlightStart < para.endIndex;
              
              let content = <>{para.text}</>;
              if (isActive) {
                const localStart = Math.max(0, absoluteHighlightStart - para.startIndex);
                const localEnd = Math.min(para.text.length, absoluteHighlightEnd - para.startIndex);
                
                content = (
                  <>
                    {para.text.slice(0, localStart)}
                    <span className="bg-yellow-200 text-black rounded-sm px-0.5">
                      {para.text.slice(localStart, localEnd)}
                    </span>
                    {para.text.slice(localEnd)}
                  </>
                );
              }

              return (
                <div 
                  key={idx}
                  onClick={() => onParagraphClick?.(normalizedPageText!.slice(para.startIndex))}
                  className={`p-5 rounded-xl transition-all cursor-pointer border shadow-sm ${
                    isActive 
                      ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-500/20' 
                      : 'bg-white border-zinc-100 hover:border-zinc-300'
                  }`}
                  title="Click to start reading from here"
                >
                  <p className="text-base md:text-lg leading-relaxed text-zinc-700 font-serif whitespace-pre-wrap">
                    {content}
                  </p>
                </div>
              );
            })}
            {/* If it's a code or pure markdown file and has no paragraphs parsed well, fallback to ReactMarkdown */}
            {sourceParagraphs.length === 0 && (
              <div className="w-full bg-white shadow-sm ring-1 ring-zinc-200 rounded-lg p-6 md:p-10 overflow-auto text-left">
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
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
};
