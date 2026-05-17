"use client";

import { BrainIcon, FileUpIcon, FlameIcon, ZapIcon, SparklesIcon, RefreshCwIcon } from "lucide-react";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { EmergencyPanel } from "@/components/study/emergency-panel";
import { QuizSession } from "@/components/study/quiz-session";
import { RoadmapView } from "@/components/study/roadmap-view";
import { SummaryCard } from "@/components/study/summary-card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useStudyContext } from "@/hooks/use-study-context";

import { toast } from "sonner";

export function StudyWorkspace() {
  const {
    summary,
    roadmap,
    quiz,
    emergency,
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
    generateQuiz,
    generateEmergency,
    fileName,
    setFromDemo,
    resetStudy,
  } = useStudyContext();

  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [quizOpen, setQuizOpen] = useState(false);
  const [panicHours, setPanicHours] = useState(24);

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

  const handleQuizMe = async () => {
    if (!summary) {
      toast.warning("Please upload a syllabus or try the CS 301 Demo first to generate a custom AI quiz!");
      return;
    }
    const questions = await generateQuiz();
    if (questions && questions.length > 0) {
      setQuizOpen(true);
    }
  };

  const handlePanic = () => {
    if (!summary) {
      toast.warning("Please upload a syllabus or try the CS 301 Demo first to generate an emergency cram plan!");
      return;
    }
    const hours = Number(panicHours) || 24;
    generateEmergency(hours);
  };

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-2 py-6 md:px-4">
      {/* Header Banner */}
      <header className="text-center space-y-3">
        <div className="flex items-center justify-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20 shadow-[0_0_15px_rgba(124,58,237,0.15)]">
            <BrainIcon className="size-6 text-primary" />
          </div>
          <h2 className="font-extrabold text-2xl tracking-tight md:text-3xl bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
            AemroSprint
          </h2>
        </div>
        <p className="text-muted-foreground text-sm md:text-base max-w-md mx-auto">
          Your AI academic survival system — upload, plan, and cram smarter.
        </p>

        {/* Demo and Control triggers */}
        <div className="pt-2 flex flex-wrap justify-center items-center gap-2.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={setFromDemo}
            className="text-xs font-semibold px-4 rounded-full border-primary/20 hover:border-primary/50 hover:bg-primary/5 flex items-center gap-1.5 cursor-pointer"
          >
            <SparklesIcon className="size-3.5 text-primary" />
            <span>Try CS 301 Demo</span>
          </Button>

          {(summary || roadmap.length > 0 || quiz.length > 0 || emergency) && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={resetStudy}
              className="text-xs font-semibold px-4 rounded-full text-muted-foreground hover:text-foreground flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCwIcon className="size-3.5" />
              <span>Reset Dashboard</span>
            </Button>
          )}
        </div>

        {/* Feature Action Buttons for Quiz & Panic - Always Visible! */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Button
            className="rounded-xl font-semibold cursor-pointer"
            disabled={isLoading}
            onClick={handleQuizMe}
            type="button"
            variant="outline"
          >
            <ZapIcon className="mr-2 size-4 text-primary animate-pulse" />
            {loadingStep === "quiz" ? "Building quiz..." : "Quiz Me"}
          </Button>
          <Button
            className="rounded-xl font-semibold border-red-500/50 bg-red-500/10 text-red-700 hover:bg-red-500/20 dark:text-red-300 cursor-pointer"
            disabled={isLoading}
            onClick={handlePanic}
            type="button"
            variant="outline"
          >
            <FlameIcon className="mr-2 size-4 text-red-500" />
            {loadingStep === "emergency" ? "Panicking..." : "PANIC MODE"}
          </Button>
          <div className="flex items-center gap-2">
            <Label className="sr-only" htmlFor="panic-hours">
              Hours until exam
            </Label>
            <Input
              className="h-9 w-16 rounded-lg bg-background/50 text-center text-sm"
              id="panic-hours"
              max={168}
              min={1}
              onChange={(e) => setPanicHours(Number(e.target.value) || 24)}
              type="number"
              value={panicHours}
            />
            <span className="text-muted-foreground text-xs">h left</span>
          </div>
        </div>
      </header>

      {/* Main Dropzone / Paste panel */}
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
          <Label className="text-sm font-medium pl-1 text-muted-foreground" htmlFor="syllabus-text">
            Or paste syllabus text
          </Label>
          <Textarea
            className="min-h-[160px] resize-none bg-card/40 backdrop-blur-sm border-border/40 focus:border-primary/50 focus:ring-primary/20 transition-all rounded-2xl text-sm"
            id="syllabus-text"
            onChange={(e) => setPastedText(e.target.value)}
            placeholder="Paste course outline, deadlines, topics..."
            value={pastedText}
          />
        </div>
      </section>

      {/* Inputs and Controls */}
      <section className="flex flex-wrap items-end gap-4 p-6 rounded-2xl bg-secondary/20 border border-border/40 backdrop-blur-sm">
        <div className="flex flex-col gap-2 w-full md:w-auto">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground" htmlFor="exam-date">
            Exam Date
          </Label>
          <Input
            className="w-full md:w-[200px] bg-background/50 border-border/40 focus:border-primary/50 rounded-xl"
            id="exam-date"
            onChange={(e) => setExamDate(e.target.value)}
            type="date"
            value={examDate}
          />
        </div>
        <div className="flex flex-col gap-2 w-full md:w-auto">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground" htmlFor="hours-per-day">
            Hours / Day
          </Label>
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
        <div className="flex flex-1 flex-wrap gap-3 w-full">
          <Button
            className="flex-1 font-semibold rounded-xl h-11 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            disabled={isLoading}
            onClick={handleAnalyze}
            type="button"
            variant="default"
          >
            {loadingStep === "upload" || loadingStep === "summary"
              ? "Analyzing Material..."
              : "Analyze Material"}
          </Button>

          <Button
            className="flex-1 font-semibold rounded-xl h-11 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            disabled={isLoading || !summary}
            onClick={() => generateRoadmap()}
            type="button"
            variant="secondary"
          >
            {loadingStep === "roadmap" ? "Generating Plan..." : "Generate Roadmap"}
          </Button>
        </div>
      </section>

      {/* Main Content Outputs (Summary, Roadmap, and Panic) */}
      {(summary || roadmap.length > 0 || emergency || loadingStep === "summary" || loadingStep === "roadmap" || loadingStep === "emergency") && (
        <section className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {/* Summary column */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 pl-1">
              <div className="size-1.5 rounded-full bg-primary" />
              <h3 className="font-bold text-sm uppercase tracking-widest text-muted-foreground">
                Summary
              </h3>
            </div>
            <SummaryCard
              isLoading={loadingStep === "summary"}
              summary={summary}
            />
          </div>

          {/* Roadmap column */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 pl-1">
              <div className="size-1.5 rounded-full bg-primary" />
              <h3 className="font-bold text-sm uppercase tracking-widest text-muted-foreground">
                Roadmap
              </h3>
            </div>
            <RoadmapView days={roadmap} isLoading={loadingStep === "roadmap"} />
          </div>

          {/* Panic mode column */}
          <div className="space-y-3 md:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 pl-1">
              <div className="size-1.5 rounded-full bg-red-500" />
              <h3 className="font-bold text-sm uppercase tracking-widest text-muted-foreground">
                Panic mode
              </h3>
            </div>
            <EmergencyPanel
              isLoading={loadingStep === "emergency"}
              plan={emergency}
            />
          </div>
        </section>
      )}

      {/* Pop-up Quiz Dialog */}
      <Dialog onOpenChange={setQuizOpen} open={quizOpen}>
        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Quiz session</DialogTitle>
          </DialogHeader>
          <QuizSession questions={quiz} summary={summary} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
