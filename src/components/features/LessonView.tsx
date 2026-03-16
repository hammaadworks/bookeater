import { useState } from 'react';
import { CheckCircle2, XCircle, ArrowRight, BrainCircuit } from 'lucide-react';
import { Lesson } from '../../types/lesson';
import { Mermaid } from '../ui/Mermaid';

interface LessonViewProps {
  lesson: Lesson;
  onNextPage: () => void;
}

export function LessonView({ lesson, onNextPage }: LessonViewProps) {
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
        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Core Concept</h3>
        <p className="text-zinc-800 font-serif text-lg leading-relaxed">
          "{lesson.coreContent}"
        </p>
      </div>

      {/* Explanation */}
      <div>
        <h3 className="flex items-center gap-2 text-sm font-bold text-blue-600 mb-2">
          <BrainCircuit size={16} />
          Mentor's Explanation
        </h3>
        <p className="text-zinc-700 leading-relaxed">
          {lesson.explanation}
        </p>
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
