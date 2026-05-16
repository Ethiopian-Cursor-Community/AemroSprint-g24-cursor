"use client";

import { Badge } from "@/components/ui/badge";
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
      <div className="flex flex-col gap-3">
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-24 w-full rounded-xl" />
      </div>
    );
  }

  if (days.length === 0) {
    return (
      <div className="flex min-h-[200px] items-center justify-center rounded-2xl border border-dashed border-border/60 bg-card/20 p-6 text-center text-muted-foreground text-sm">
        Set your exam date and generate a personalized study roadmap.
      </div>
    );
  }

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="flex max-h-[420px] flex-col gap-3 overflow-y-auto pr-1">
      {days.map((day) => {
        const isToday = day.date === today;
        return (
          <article
            className={`rounded-xl border border-border/50 border-l-4 bg-card/40 p-4 ${priorityBorder[day.priority]}`}
            key={`${day.day}-${day.date}`}
          >
            <div className="mb-2 flex items-start justify-between gap-2">
              <div>
                <p className="font-medium text-sm">
                  Day {day.day}
                  {isToday ? (
                    <Badge className="ml-2" variant="default">
                      TODAY
                    </Badge>
                  ) : null}
                </p>
                <p className="text-muted-foreground text-xs">{day.date}</p>
              </div>
              <Badge variant="outline">{day.estimatedHours}h</Badge>
            </div>
            <div className="mb-2 flex flex-wrap gap-1">
              {day.topics.map((topic) => (
                <Badge key={topic} variant="secondary">
                  {topic}
                </Badge>
              ))}
            </div>
            <ul className="list-disc space-y-1 pl-4 text-sm">
              {day.tasks.map((task) => (
                <li key={task}>{task}</li>
              ))}
            </ul>
          </article>
        );
      })}
    </div>
  );
}
