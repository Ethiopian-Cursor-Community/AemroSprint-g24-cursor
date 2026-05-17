"use client";

import { BrainIcon, SparklesIcon } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { Streamdown } from "streamdown";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import type { SummaryJSON } from "@/lib/study/types";

type SummaryCardProps = {
  summary: SummaryJSON | null;
  isLoading?: boolean;
};

const basePath = () => process.env.NEXT_PUBLIC_BASE_PATH ?? "";

type DeepDiveProvider = "cursor-sdk" | "gemini";

const providerLabel: Record<DeepDiveProvider, string> = {
  "cursor-sdk": "Powered by the Cursor SDK",
  gemini: "Powered by Gemini",
};

export function SummaryCard({ summary, isLoading }: SummaryCardProps) {
  const [deepDiveTopic, setDeepDiveTopic] = useState<string | null>(null);
  const [deepDiveLoading, setDeepDiveLoading] = useState(false);
  const [deepDiveContent, setDeepDiveContent] = useState("");
  const [deepDiveError, setDeepDiveError] = useState<string | null>(null);
  const [deepDiveProvider, setDeepDiveProvider] =
    useState<DeepDiveProvider | null>(null);
  const [deepDiveFellBack, setDeepDiveFellBack] = useState(false);

  const openDeepDive = useCallback(
    async (topic: string) => {
      setDeepDiveTopic(topic);
      setDeepDiveContent("");
      setDeepDiveError(null);
      setDeepDiveProvider(null);
      setDeepDiveFellBack(false);
      setDeepDiveLoading(true);

      try {
        const res = await fetch(`${basePath()}/api/study/deep-dive`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            topic,
            courseName: summary?.courseName,
            otherTopics: summary?.topics.filter((t) => t !== topic).slice(0, 8),
          }),
        });

        if (!res.ok) {
          const err = (await res.json().catch(() => ({}))) as {
            error?: string;
          };
          throw new Error(err.error ?? `Deep dive failed (${res.status})`);
        }

        const data = (await res.json()) as {
          explanation: string;
          provider: DeepDiveProvider;
          fellBack?: boolean;
        };
        setDeepDiveContent(data.explanation);
        setDeepDiveProvider(data.provider);
        setDeepDiveFellBack(Boolean(data.fellBack));
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Deep dive failed";
        setDeepDiveError(message);
        toast.error(message);
      } finally {
        setDeepDiveLoading(false);
      }
    },
    [summary?.courseName, summary?.topics]
  );

  const closeDeepDive = useCallback((open: boolean) => {
    if (!open) {
      setDeepDiveTopic(null);
      setDeepDiveContent("");
      setDeepDiveError(null);
      setDeepDiveLoading(false);
      setDeepDiveProvider(null);
      setDeepDiveFellBack(false);
    }
  }, []);

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
    <>
      <div className="flex flex-col gap-6 rounded-2xl border border-border/10 bg-card/40 p-6 backdrop-blur-md shadow-glow">
        <div className="space-y-1">
          <h3 className="font-bold text-lg tracking-tight text-foreground/90">
            {summary.courseName ?? "Course Analysis"}
          </h3>
          {summary.difficulty ? (
            <Badge
              className="text-[10px] uppercase tracking-wider bg-primary/5 text-primary/80 border-primary/20 px-2 py-0"
              variant="outline"
            >
              {summary.difficulty}
            </Badge>
          ) : null}
        </div>

        {summary.topics.length > 0 ? (
          <section className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <p className="font-bold text-[10px] text-muted-foreground/40 uppercase tracking-[0.2em]">
                Core Topics
              </p>
              <p className="text-[10px] text-muted-foreground/40 italic">
                Click a topic for a Deep Dive
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {summary.topics.map((topic) => (
                <button
                  className="group inline-flex items-center gap-1.5 rounded-lg border border-border/10 bg-secondary/40 px-2.5 py-1 text-[11px] font-medium text-foreground/80 transition-all hover:border-primary/40 hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                  key={topic}
                  onClick={() => openDeepDive(topic)}
                  type="button"
                >
                  <SparklesIcon className="size-3 opacity-50 transition-opacity group-hover:opacity-100" />
                  {topic}
                </button>
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
                  <span className="font-medium text-foreground/70 truncate">
                    {deadline.label}
                  </span>
                  <Badge
                    className="shrink-0 bg-primary/5 text-primary/70 border-primary/10 text-[10px] font-mono"
                    variant="outline"
                  >
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
                <li className="flex gap-2 leading-relaxed" key={objective}>
                  <span className="text-primary mt-1">•</span>
                  <span>{objective}</span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>

      <Dialog onOpenChange={closeDeepDive} open={deepDiveTopic !== null}>
        <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 pr-6">
              <SparklesIcon className="size-4 text-primary" />
              Deep Dive: {deepDiveTopic}
            </DialogTitle>
            <DialogDescription>
              {deepDiveProvider
                ? `${providerLabel[deepDiveProvider]}${
                    deepDiveFellBack
                      ? " (Cursor SDK unavailable, fell back)"
                      : ""
                  } — exam-focused explanation tailored to your course.`
                : "Generating an exam-focused explanation tailored to your course."}
            </DialogDescription>
          </DialogHeader>

          {deepDiveLoading ? (
            <div className="flex flex-col gap-3 py-2">
              <Skeleton className="h-4 w-3/4 rounded-md bg-muted/40" />
              <Skeleton className="h-4 w-full rounded-md bg-muted/40" />
              <Skeleton className="h-4 w-5/6 rounded-md bg-muted/40" />
              <Skeleton className="h-4 w-4/6 rounded-md bg-muted/40" />
              <Skeleton className="h-4 w-3/4 rounded-md bg-muted/40" />
              <p className="text-center text-muted-foreground text-xs italic">
                Generating your deep dive…
              </p>
            </div>
          ) : null}

          {deepDiveError && !deepDiveLoading ? (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-700 text-sm dark:text-red-300">
              {deepDiveError}
            </div>
          ) : null}

          {deepDiveContent && !deepDiveLoading ? (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <Streamdown>{deepDiveContent}</Streamdown>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
