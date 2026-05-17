"use client";

import { useCallback, useRef, useState } from "react";
import { QuizCard } from "@/components/study/quiz-card";
import { Button } from "@/components/ui/button";
import type { QuizQuestion, SummaryJSON } from "@/lib/study/types";

type QuizSessionProps = {
  questions: QuizQuestion[];
  summary?: SummaryJSON | null;
  onComplete?: (score: number, total: number) => void;
};

export function QuizSession({
  questions,
  summary,
  onComplete,
}: QuizSessionProps) {
  const [index, setIndex] = useState(0);
  const [displayScore, setDisplayScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const scoreRef = useRef(0);

  const current = questions.at(index);
  const total = questions.length;
  const progress =
    total > 0 ? ((finished ? total : index + 1) / total) * 100 : 0;

  const handleAnswer = useCallback((correct: boolean) => {
    if (correct) {
      scoreRef.current += 1;
      setDisplayScore(scoreRef.current);
    }
  }, []);

  const handleNext = useCallback(() => {
    if (index >= total - 1) {
      setFinished(true);
      onComplete?.(scoreRef.current, total);
      return;
    }
    setIndex((i) => i + 1);
  }, [index, total, onComplete]);

  const handleRetry = () => {
    setIndex(0);
    setDisplayScore(0);
    scoreRef.current = 0;
    setFinished(false);
  };

  if (questions.length === 0) {
    return (
      <p className="text-center text-muted-foreground text-sm">
        No quiz questions yet. Click Quiz Me after analyzing material.
      </p>
    );
  }

  if (finished) {
    const pct = Math.round((displayScore / total) * 100);
    const weak = pct < 60 && summary?.topics?.length;
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-border/40 bg-card/40 p-6 text-center animate-in fade-in duration-300">
        <p className="font-bold text-2xl tracking-tight">
          You scored {displayScore}/{total}
        </p>
        <p className="text-muted-foreground text-sm">
          {pct >= 80
            ? "Strong work — you know this material."
            : pct >= 60
              ? "Solid base — review missed explanations."
              : "Keep going — focus on the gaps below."}
        </p>
        {weak ? (
          <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-amber-800 text-sm dark:text-amber-200">
            Focus on: {summary.topics.slice(0, 3).join(", ")}
          </p>
        ) : null}
        <Button onClick={handleRetry} type="button" variant="outline">
          Retry quiz
        </Button>
      </div>
    );
  }

  if (!current) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-muted-foreground text-xs font-medium uppercase tracking-wider">
          <span>
            Question {index + 1} of {total}
          </span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-muted/50">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      <QuizCard
        correctIndex={current.correctIndex}
        explanation={current.explanation}
        key={current.id}
        onAnswer={handleAnswer}
        onNext={handleNext}
        options={current.options}
        question={current.question}
        showNext
      />
    </div>
  );
}
