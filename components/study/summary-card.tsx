"use client";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { SummaryJSON } from "@/lib/study/types";

type SummaryCardProps = {
  summary: SummaryJSON | null;
  isLoading?: boolean;
};

export function SummaryCard({ summary, isLoading }: SummaryCardProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-3 rounded-2xl border border-border/50 bg-card/40 p-4 shadow-[var(--shadow-card)]">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="flex min-h-[200px] flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-card/20 p-6 text-center text-muted-foreground text-sm">
        Upload or paste material, then click Analyze to see your summary.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border/50 bg-card/40 p-4 shadow-[var(--shadow-card)]">
      <div>
        <h3 className="font-semibold text-base">
          {summary.courseName ?? "Course summary"}
        </h3>
        {summary.difficulty ? (
          <p className="mt-1 text-muted-foreground text-xs">
            Difficulty: {summary.difficulty}
          </p>
        ) : null}
      </div>

      {summary.topics.length > 0 ? (
        <section>
          <p className="mb-2 font-medium text-muted-foreground text-xs uppercase tracking-wide">
            Topics
          </p>
          <div className="flex flex-wrap gap-1.5">
            {summary.topics.map((topic) => (
              <Badge key={topic} variant="secondary">
                {topic}
              </Badge>
            ))}
          </div>
        </section>
      ) : null}

      {summary.deadlines.length > 0 ? (
        <section>
          <p className="mb-2 font-medium text-muted-foreground text-xs uppercase tracking-wide">
            Deadlines
          </p>
          <ul className="space-y-1.5 text-sm">
            {summary.deadlines.map((deadline) => (
              <li
                className="flex justify-between gap-2 border-border/40 border-b pb-1.5 last:border-0"
                key={`${deadline.label}-${deadline.date}`}
              >
                <span>{deadline.label}</span>
                <span className="shrink-0 text-muted-foreground">
                  {deadline.date}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {summary.learningObjectives.length > 0 ? (
        <section>
          <p className="mb-2 font-medium text-muted-foreground text-xs uppercase tracking-wide">
            Objectives
          </p>
          <ul className="list-disc space-y-1 pl-4 text-sm">
            {summary.learningObjectives.map((objective) => (
              <li key={objective}>{objective}</li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
