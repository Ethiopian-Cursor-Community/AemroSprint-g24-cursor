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
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-2 py-8 md:px-4">
      <header className="text-center space-y-2">
        <div className="flex items-center justify-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
            <BrainIcon className="size-6" />
          </div>
          <h2 className="font-bold text-2xl tracking-tight md:text-3xl bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
            AemroSprint
          </h2>
        </div>
        <p className="text-muted-foreground text-sm md:text-base max-w-md mx-auto">
          Your AI academic survival system — upload, plan, and cram smarter.
        </p>
      </header>

      <section className="grid gap-6 md:grid-cols-2">
        <div
          {...getRootProps()}
          className={`flex min-h-[160px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 transition-all duration-300 ${
            isDragActive
              ? "border-primary bg-primary/10 scale-[1.01]"
              : "border-border/40 bg-card/40 backdrop-blur-sm hover:border-primary/40 hover:bg-card/60"
          }`}
        >
          <input {...getInputProps()} />
          <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-muted/50 text-muted-foreground group-hover:text-primary transition-colors">
            <FileUpIcon className="size-6" />
          </div>
          <p className="font-semibold text-sm">
            {pendingFile?.name ?? fileName ?? "Drop syllabus PDF here"}
          </p>
          <p className="mt-1 text-muted-foreground text-xs">
            PDF or .txt up to 5MB
          </p>
        </div>

        <div className="flex flex-col gap-2.5">
          <Label className="text-sm font-medium pl-1" htmlFor="syllabus-text">Or paste syllabus text</Label>
          <Textarea
            className="min-h-[160px] resize-none bg-card/40 backdrop-blur-sm border-border/40 focus:border-primary/50 focus:ring-primary/20 transition-all rounded-2xl"
            id="syllabus-text"
            onChange={(e) => setPastedText(e.target.value)}
            placeholder="Paste course outline, deadlines, topics..."
            value={pastedText}
          />
        </div>
      </section>

      <section className="flex flex-wrap items-end gap-4 p-6 rounded-2xl bg-secondary/30 border border-border/40 backdrop-blur-sm">
        <div className="flex flex-col gap-2">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground" htmlFor="exam-date">Exam date</Label>
          <Input
            className="w-full md:w-[200px] bg-background/50 border-border/40 focus:border-primary/50 rounded-xl"
            id="exam-date"
            onChange={(e) => setExamDate(e.target.value)}
            type="date"
            value={examDate}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground" htmlFor="hours-per-day">Hours / day</Label>
          <Input
            className="w-full md:w-[120px] bg-background/50 border-border/40 focus:border-primary/50 rounded-xl"
            id="hours-per-day"
            max={16}
            min={1}
            onChange={(e) => setHoursPerDay(Number(e.target.value) || 1)}
            type="number"
            value={hoursPerDay}
          />
        </div>
        <div className="flex flex-1 gap-3">
          <Button
            className="flex-1 font-semibold rounded-xl h-11 transition-all hover:scale-[1.02] active:scale-[0.98]"
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
            className="flex-1 font-semibold rounded-xl h-11 transition-all hover:scale-[1.02] active:scale-[0.98]"
            disabled={isLoading || !summary}
            onClick={() => generateRoadmap()}
            type="button"
            variant="secondary"
          >
            {loadingStep === "roadmap" ? "Planning..." : "Generate Roadmap"}
          </Button>
        </div>
      </section>

      <section className="grid gap-8 md:grid-cols-2">
        <div className="space-y-3">
          <div className="flex items-center gap-2 pl-1">
            <div className="size-1.5 rounded-full bg-primary" />
            <h3 className="font-bold text-sm uppercase tracking-widest text-muted-foreground">Summary</h3>
          </div>
          <SummaryCard
            isLoading={loadingStep === "summary"}
            summary={summary}
          />
        </div>
        <div className="space-y-3">
          <div className="flex items-center gap-2 pl-1">
            <div className="size-1.5 rounded-full bg-primary" />
            <h3 className="font-bold text-sm uppercase tracking-widest text-muted-foreground">Roadmap</h3>
          </div>
          <RoadmapView days={roadmap} isLoading={loadingStep === "roadmap"} />
        </div>
      </section>
    </div>
  );
}
