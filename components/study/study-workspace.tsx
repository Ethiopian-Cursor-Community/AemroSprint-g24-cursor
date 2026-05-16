"use client";

import { BrainIcon, FileUpIcon } from "lucide-react";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useStudyContext } from "@/hooks/use-study-context";
import { RoadmapView } from "./roadmap-view";
import { SummaryCard } from "./summary-card";

export function StudyWorkspace() {
  const {
    summary,
    roadmap,
    examDate,
    hoursPerDay,
    isLoading,
    loadingStep,
    pastedText,
    setPastedText,
    setExamDate,
    setHoursPerDay,
    analyzeMaterial,
    generateRoadmap,
    fileName,
  } = useStudyContext();

  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const onDrop = useCallback((accepted: File[]) => {
    const file = accepted.at(0);
    if (file) {
      setPendingFile(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "text/plain": [".txt"],
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
  });

  const handleAnalyze = () => {
    analyzeMaterial(pendingFile ?? undefined);
  };

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-2 py-4 md:px-4">
      <header className="text-center">
        <div className="mb-2 flex items-center justify-center gap-2">
          <BrainIcon className="size-6 text-indigo-500" />
          <h2 className="font-semibold text-xl tracking-tight md:text-2xl">
            Second Brain
          </h2>
        </div>
        <p className="text-muted-foreground text-sm">
          Your AI academic survival system — upload, plan, and cram smarter.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        <div
          {...getRootProps()}
          className={`flex min-h-[140px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 transition-colors ${
            isDragActive
              ? "border-indigo-500 bg-indigo-500/5"
              : "border-border/60 bg-card/30 hover:border-indigo-400/50"
          }`}
        >
          <input {...getInputProps()} />
          <FileUpIcon className="mb-2 size-8 text-muted-foreground" />
          <p className="font-medium text-sm">
            {pendingFile?.name ?? fileName ?? "Drop syllabus PDF here"}
          </p>
          <p className="mt-1 text-muted-foreground text-xs">
            PDF or .txt up to 5MB
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="syllabus-text">Or paste syllabus text</Label>
          <Textarea
            className="min-h-[140px] resize-none"
            id="syllabus-text"
            onChange={(e) => setPastedText(e.target.value)}
            placeholder="Paste course outline, deadlines, topics..."
            value={pastedText}
          />
        </div>
      </section>

      <section className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="exam-date">Exam date</Label>
          <Input
            className="w-[180px]"
            id="exam-date"
            onChange={(e) => setExamDate(e.target.value)}
            type="date"
            value={examDate}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="hours-per-day">Hours / day</Label>
          <Input
            className="w-[100px]"
            id="hours-per-day"
            max={16}
            min={1}
            onChange={(e) => setHoursPerDay(Number(e.target.value) || 1)}
            type="number"
            value={hoursPerDay}
          />
        </div>
        <Button
          disabled={isLoading}
          onClick={handleAnalyze}
          type="button"
          variant="default"
        >
          {loadingStep === "upload" || loadingStep === "summary"
            ? "Analyzing..."
            : "Analyze Material"}
        </Button>
        <Button
          disabled={isLoading || !summary}
          onClick={() => generateRoadmap()}
          type="button"
          variant="secondary"
        >
          {loadingStep === "roadmap" ? "Planning..." : "Generate Roadmap"}
        </Button>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div>
          <h3 className="mb-2 font-medium text-sm">Summary</h3>
          <SummaryCard
            isLoading={loadingStep === "summary"}
            summary={summary}
          />
        </div>
        <div>
          <h3 className="mb-2 font-medium text-sm">Roadmap</h3>
          <RoadmapView days={roadmap} isLoading={loadingStep === "roadmap"} />
        </div>
      </section>
    </div>
  );
}
