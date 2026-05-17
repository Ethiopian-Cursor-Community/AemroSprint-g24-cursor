"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type QuizCardProps = {
  question: string;
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
  explanation: string;
  onAnswer: (correct: boolean) => void;
  onNext?: () => void;
  showNext?: boolean;
};

export function QuizCard({
  question,
  options,
  correctIndex,
  explanation,
  onAnswer,
  onNext,
  showNext = false,
}: QuizCardProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const answered = selected !== null;

  const handleSelect = (index: number) => {
    if (answered) {
      return;
    }
    setSelected(index);
    onAnswer(index === correctIndex);
  };

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border/40 bg-card/50 p-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <p className="font-semibold text-sm leading-snug md:text-base">{question}</p>
      <div className="grid gap-2">
        {options.map((option, index) => {
          const isCorrect = index === correctIndex;
          const isSelected = index === selected;
          return (
            <Button
              className={cn(
                "h-auto min-h-11 justify-start whitespace-normal px-4 py-3 text-left text-sm font-normal",
                answered &&
                  isCorrect &&
                  "border-green-600/50 bg-green-500/15 text-green-700 dark:text-green-400",
                answered &&
                  isSelected &&
                  !isCorrect &&
                  "border-red-600/50 bg-red-500/15 text-red-700 dark:text-red-400",
                !answered && "hover:border-primary/40"
              )}
              disabled={answered}
              key={option}
              onClick={() => handleSelect(index)}
              type="button"
              variant="outline"
            >
              <span className="mr-2 font-mono text-xs opacity-60">
                {String.fromCharCode(65 + index)}.
              </span>
              {option}
            </Button>
          );
        })}
      </div>
      {answered ? (
        <div className="animate-in fade-in slide-in-from-bottom-1 space-y-3 duration-200">
          <p className="rounded-xl border border-border/30 bg-muted/30 p-3 text-muted-foreground text-sm leading-relaxed">
            {explanation}
          </p>
          {showNext && onNext ? (
            <Button className="w-full rounded-xl" onClick={onNext} type="button">
              Next question
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
