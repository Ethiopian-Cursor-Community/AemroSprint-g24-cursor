"use client";

import { Badge } from "@/components/ui/badge";
import { BrainIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { SummaryJSON } from "@/lib/study/types";

type SummaryCardProps = {
  summary: SummaryJSON | null;
  isLoading?: boolean;
};

export function SummaryCard({ summary, isLoading }: SummaryCardProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 rounded-2xl border border-border/10 bg-card/40 p-5 backdrop-blur-md shadow-glow">
        <Skeleton className="h-6 w-32 rounded-lg bg-primary/10" />
        <Skeleton className="h-4 w-full rounded-md bg-muted/40" />
        <Skeleton className="h-4 w-5/6 rounded-md bg-muted/40" />
        <Skeleton className="h-4 w-4/6 rounded-md bg-muted/40" />
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="flex min-h-[240px] flex-col items-center justify-center rounded-2xl border border-dashed border-border/10 bg-card/20 p-8 text-center transition-all hover:bg-card/30">
        <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-muted/20 text-muted-foreground/40">
          <BrainIcon className="size-6" />
        </div>
        <p className="max-w-[200px] text-muted-foreground/60 text-sm font-medium leading-relaxed">
          Upload material to see your AI-generated study analysis.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 rounded-2xl border border-border/10 bg-card/40 p-6 backdrop-blur-md shadow-glow">
      <div className="space-y-1">
        <h3 className="font-bold text-lg tracking-tight text-foreground/90">
          {summary.courseName ?? "Course Analysis"}
        </h3>
        {summary.difficulty ? (
          <Badge variant="outline" className="text-[10px] uppercase tracking-wider bg-primary/5 text-primary/80 border-primary/20 px-2 py-0">
            {summary.difficulty}
          </Badge>
        ) : null}
      </div>

      {summary.topics.length > 0 ? (
        <section className="space-y-3">
          <p className="font-bold text-[10px] text-muted-foreground/40 uppercase tracking-[0.2em]">
            Core Topics
          </p>
          <div className="flex flex-wrap gap-2">
            {summary.topics.map((topic) => (
              <Badge key={topic} variant="secondary" className="bg-secondary/40 hover:bg-secondary/60 text-foreground/80 border-border/10 rounded-lg px-2.5 py-0.5 text-[11px] font-medium transition-colors">
                {topic}
              </Badge>
            ))}
          </div>
        </section>
      ) : null}

      {summary.deadlines.length > 0 ? (
        <section className="space-y-3 p-4 rounded-xl bg-background/30 border border-border/5">
          <p className="font-bold text-[10px] text-muted-foreground/40 uppercase tracking-[0.2em]">
            Critical Deadlines
          </p>
          <ul className="space-y-2 text-[13px]">
            {summary.deadlines.map((deadline) => (
              <li
                className="flex justify-between items-center gap-3"
                key={`${deadline.label}-${deadline.date}`}
              >
                <span className="font-medium text-foreground/70 truncate">{deadline.label}</span>
                <Badge variant="outline" className="shrink-0 bg-primary/5 text-primary/70 border-primary/10 text-[10px] font-mono">
                  {deadline.date}
                </Badge>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {summary.learningObjectives.length > 0 ? (
        <section className="space-y-3">
          <p className="font-bold text-[10px] text-muted-foreground/40 uppercase tracking-[0.2em]">
            Study Objectives
          </p>
          <ul className="space-y-2 text-[13px] text-muted-foreground/80">
            {summary.learningObjectives.map((objective) => (
              <li key={objective} className="flex gap-2 leading-relaxed">
                <span className="text-primary mt-1">•</span>
                <span>{objective}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

