"use client";

import { Badge } from "@/components/ui/badge";
import { CalendarIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { RoadmapDay } from "@/lib/study/types";

type RoadmapViewProps = {
  days: RoadmapDay[];
  isLoading?: boolean;
};

const priorityBorder: Record<RoadmapDay["priority"], string> = {
  critical: "border-l-red-500",
  high: "border-l-orange-500",
  medium: "border-l-green-500",
};

export function RoadmapView({ days, isLoading }: RoadmapViewProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-28 w-full rounded-2xl bg-muted/40" />
        <Skeleton className="h-28 w-full rounded-2xl bg-muted/40" />
        <Skeleton className="h-28 w-full rounded-2xl bg-muted/40" />
      </div>
    );
  }

  if (days.length === 0) {
    return (
      <div className="flex min-h-[240px] flex-col items-center justify-center rounded-2xl border border-dashed border-border/10 bg-card/20 p-8 text-center transition-all hover:bg-card/30">
        <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-muted/20 text-muted-foreground/40">
          <CalendarIcon className="size-6" />
        </div>
        <p className="max-w-[200px] text-muted-foreground/60 text-sm font-medium leading-relaxed">
          Set your exam date and generate a personalized study roadmap.
        </p>
      </div>
    );
  }

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="flex max-h-[500px] flex-col gap-4 overflow-y-auto pr-2 no-scrollbar hover:scrollbar-thin transition-all">
      {days.map((day) => {
        const isToday = day.date === today;
        return (
          <article
            className={`group relative rounded-2xl border border-border/10 border-l-4 bg-card/40 p-5 transition-all hover:bg-card/60 hover:scale-[1.01] shadow-sm ${priorityBorder[day.priority]}`}
            key={`${day.day}-${day.date}`}
          >
            {isToday && (
              <div className="absolute -left-[4px] top-0 bottom-0 w-1 bg-primary shadow-glow rounded-l-full" />
            )}
            <div className="mb-3 flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm tracking-tight">Day {day.day}</span>
                  {isToday ? (
                    <Badge className="bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0 rounded-md" variant="default">
                      TODAY
                    </Badge>
                  ) : null}
                </div>
                <p className="text-muted-foreground/60 font-mono text-[11px] mt-0.5">{day.date}</p>
              </div>
              <Badge variant="secondary" className="bg-background/50 border-border/5 text-[11px] font-bold px-2 py-0.5">
                {day.estimatedHours}h
              </Badge>
            </div>
            <div className="mb-3 flex flex-wrap gap-1.5">
              {day.topics.map((topic) => (
                <Badge key={topic} variant="outline" className="text-[10px] font-medium border-primary/20 bg-primary/5 text-primary/70 rounded-lg">
                  {topic}
                </Badge>
              ))}
            </div>
            <ul className="space-y-2">
              {day.tasks.map((task) => (
                <li key={task} className="flex gap-2.5 text-[13px] text-muted-foreground/80 leading-snug">
                  <div className="mt-1.5 size-1.5 shrink-0 rounded-full bg-border/40 group-hover:bg-primary/40 transition-colors" />
                  <span>{task}</span>
                </li>
              ))}
            </ul>
          </article>
        );
      })}
    </div>
  );
}

