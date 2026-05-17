"use client";

import { AlertTriangleIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { EmergencyPlan } from "@/lib/study/types";

type EmergencyPanelProps = {
  plan: EmergencyPlan | null;
  isLoading?: boolean;
};

export function EmergencyPanel({ plan, isLoading }: EmergencyPanelProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-3 rounded-2xl border border-red-500/20 bg-red-500/5 p-5">
        <Skeleton className="h-6 w-40 rounded-lg" />
        <Skeleton className="h-20 w-full rounded-xl" />
        <Skeleton className="h-20 w-full rounded-xl" />
        <Skeleton className="h-24 w-full rounded-xl" />
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="flex min-h-[200px] flex-col items-center justify-center rounded-2xl border border-dashed border-red-500/30 bg-red-500/5 p-8 text-center">
        <AlertTriangleIcon className="mb-3 size-8 text-red-500/70" />
        <p className="max-w-[220px] text-muted-foreground text-sm font-medium leading-relaxed">
          Exam soon? Hit PANIC MODE for a brutally prioritized cram plan.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 rounded-2xl border border-red-500/30 bg-gradient-to-b from-red-500/10 to-card/40 p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <AlertTriangleIcon className="size-5 text-red-500" />
        <h4 className="font-bold text-red-600 text-sm uppercase tracking-widest dark:text-red-400">
          Emergency cram plan
        </h4>
      </div>

      <section className="space-y-2">
        <p className="font-semibold text-xs uppercase tracking-wider text-red-600/80 dark:text-red-400/80">
          Priority topics
        </p>
        <div className="flex flex-wrap gap-1.5">
          {plan.priorityTopics.map((topic) => (
            <Badge
              className="border-red-500/30 bg-red-500/15 text-red-800 dark:text-red-200"
              key={topic}
              variant="outline"
            >
              {topic}
            </Badge>
          ))}
        </div>
      </section>

      <section className="space-y-2">
        <p className="font-semibold text-xs uppercase tracking-wider text-red-600/80 dark:text-red-400/80">
          Must know
        </p>
        <ul className="space-y-1.5">
          {plan.mustKnowFacts.map((fact) => (
            <li
              className="rounded-lg border border-border/20 bg-background/40 px-3 py-2 text-sm leading-snug"
              key={fact}
            >
              {fact}
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-2">
        <p className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">
          Skip these
        </p>
        <ul className="list-inside list-disc space-y-1 text-muted-foreground text-sm">
          {plan.skipThese.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="space-y-2">
        <p className="font-semibold text-xs uppercase tracking-wider text-red-600/80 dark:text-red-400/80">
          Study order
        </p>
        <ol className="space-y-2">
          {plan.studyOrder.map((block) => (
            <li
              className="rounded-xl border border-red-500/20 bg-background/50 p-3"
              key={`${block.topic}-${block.minutes}`}
            >
              <div className="mb-1 flex items-center justify-between gap-2">
                <span className="font-semibold text-sm">{block.topic}</span>
                <Badge variant="secondary">{block.minutes} min</Badge>
              </div>
              <p className="text-muted-foreground text-xs leading-relaxed">
                {block.why}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <p className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-red-900 text-sm italic leading-relaxed dark:text-red-100">
        {plan.mindsetTip}
      </p>
    </div>
  );
}
