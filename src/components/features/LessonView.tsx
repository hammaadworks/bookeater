import { useState } from 'react';
import { CheckCircle2, XCircle, ArrowRight, BrainCircuit, Key, Sparkles, Lightbulb, ListChecks, Hash } from 'lucide-react';
import { Lesson } from '../../types/lesson';
import { Mermaid } from '../ui/Mermaid';

interface LessonViewProps {
  lesson: Lesson;
  onNextPage: () => void;
  currentReadingText?: string;
  highlightStartIndex?: number;
  highlightEndIndex?: number;
}

export function LessonView({ 
  lesson, 
  onNextPage,
  currentReadingText,
  highlightStartIndex,
  highlightEndIndex
}: LessonViewProps) {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasPassed, setHasPassed] = useState(false);

  const handleOptionSelect = (index: number) => {
    if (hasPassed) return; // Don't allow changing after passing
    setSelectedOption(index);
    if (index === lesson.checkpoint.correctAnswerIndex) {
      setHasPassed(true);
    }
  };

  return (
    <div className="flex-1 overflow-auto p-6 space-y-8 bg-white">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-zinc-900 mb-2">{lesson.title}</h2>
        <p className="text-sm text-zinc-500">{lesson.context}</p>
      </div>

      {/* Core Content */}
      <div className="bg-zinc-50 border-l-4 border-black p-4 rounded-r-lg">
        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Original Context</h3>
        <p className="text-zinc-800 font-serif text-lg leading-relaxed italic">
          "{lesson.coreContent}"
        </p>
      </div>

      {/* Exam Ready Definition */}
      <div>
        <h3 className="flex items-center gap-2 text-sm font-bold text-blue-600 mb-2">
          <BrainCircuit size={16} />
          Exam-Ready Definition
        </h3>
        <p className="text-zinc-700 leading-relaxed font-serif text-lg font-medium">
          {currentReadingText === lesson.explanation && highlightStartIndex !== undefined && highlightEndIndex !== undefined ? (
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

      {/* Key Points */}
      <div>
        <h3 className="flex items-center gap-2 text-sm font-bold text-indigo-600 mb-3">
          <ListChecks size={16} />
          Examiner's Key Points
        </h3>
        <ul className="space-y-2">
          {lesson.keyPoints.map((point, i) => (
            <li key={i} className="flex gap-3 text-zinc-700 text-sm leading-relaxed">
              <span className="flex-shrink-0 w-5 h-5 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center text-[10px] font-bold mt-0.5">
                {i + 1}
              </span>
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Keywords & Exam Sentences */}
      <div className="grid grid-cols-1 gap-6">
        {lesson.keywords && lesson.keywords.length > 0 && (
          <div>
            <h3 className="flex items-center gap-2 text-sm font-bold text-amber-600 mb-2">
              <Hash size={16} />
              Must-Use Keywords
            </h3>
            <div className="flex flex-wrap gap-2">
              {lesson.keywords.map((word, i) => (
                <span key={i} className="px-2 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-md border border-amber-100">
                  {word}
                </span>
              ))}
            </div>
          </div>
        )}

        {lesson.examSentences && lesson.examSentences.length > 0 && (
          <div className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-xl">
            <h3 className="flex items-center gap-2 text-sm font-bold text-emerald-700 mb-2">
              <Sparkles size={16} />
              Write This in Your Exam
            </h3>
            <div className="space-y-3">
              {lesson.examSentences.map((sentence, i) => (
                <p key={i} className="text-zinc-700 text-sm italic leading-relaxed">
                  "{sentence}"
                </p>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Diagram (Optional) */}
      {lesson.diagram && (
        <div className="border border-zinc-200 rounded-xl p-4 bg-zinc-50">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4 text-center">Visual Aid</h3>
          <Mermaid chart={lesson.diagram} />
        </div>
      )}

      {/* Checkpoint */}
      <div className="border-t border-zinc-200 pt-8 mt-8 pb-12">
        <h3 className="text-lg font-bold text-zinc-900 mb-4 flex items-center gap-2">
          <Key size={20} className="text-blue-600" />
          Knowledge Checkpoint
        </h3>
        <p className="text-zinc-700 font-medium mb-4">{lesson.checkpoint.question}</p>
        
        <div className="space-y-3">
          {lesson.checkpoint.options.map((option, index) => {
            const isSelected = selectedOption === index;
            const isCorrect = index === lesson.checkpoint.correctAnswerIndex;
            
            let btnStyle = "border-zinc-200 hover:border-black text-zinc-700 bg-white";
            
            if (isSelected) {
              if (isCorrect) {
                btnStyle = "border-green-500 bg-green-50 text-green-800 ring-1 ring-green-500";
              } else {
                btnStyle = "border-red-500 bg-red-50 text-red-800 ring-1 ring-red-500";
              }
            } else if (hasPassed && isCorrect) {
               btnStyle = "border-green-500 bg-green-50 text-green-800 opacity-50";
            }

            return (
              <button
                key={index}
                onClick={() => handleOptionSelect(index)}
                disabled={hasPassed}
                className={`w-full text-left p-4 rounded-xl border transition-all flex justify-between items-center active:scale-[0.98] ${btnStyle}`}
              >
                <span>{option}</span>
                {isSelected && isCorrect && <CheckCircle2 className="text-green-600" size={20} />}
                {isSelected && !isCorrect && <XCircle className="text-red-500" size={20} />}
              </button>
            );
          })}
        </div>

        {selectedOption !== null && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-xl animate-in fade-in slide-in-from-top-2 duration-300">
            <h4 className="flex items-center gap-2 text-xs font-bold text-blue-700 uppercase tracking-wider mb-2">
              <Lightbulb size={14} />
              MCQ Trick
            </h4>
            <p className="text-blue-800 text-sm leading-relaxed">
              {lesson.checkpoint.mcqTrick}
            </p>
          </div>
        )}

        {hasPassed && (
          <div className="mt-8 flex justify-center animate-in fade-in slide-in-from-bottom-4 duration-500">
            <button 
              onClick={onNextPage}
              className="flex items-center gap-2 px-6 py-3 bg-black text-white font-bold rounded-full hover:bg-zinc-800 transition-colors shadow-lg shadow-black/20"
            >
              Move to Next Bite
              <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
