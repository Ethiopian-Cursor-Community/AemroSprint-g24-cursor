"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { toast } from "sonner";
import type {
  EmergencyPlan,
  QuizQuestion,
  RoadmapDay,
  SummaryJSON,
} from "@/lib/study/types";

export type StudyLoadingStep =
  | "idle"
  | "upload"
  | "summary"
  | "roadmap"
  | "quiz"
  | "emergency";

type StudyContextValue = {
  extractedText: string;
  fileName: string | null;
  summary: SummaryJSON | null;
  roadmap: RoadmapDay[];
  quiz: QuizQuestion[];
  emergency: EmergencyPlan | null;
  examDate: string;
  hoursPerDay: number;
  isDemo: boolean;
  isLoading: boolean;
  loadingStep: StudyLoadingStep;
  setExamDate: (date: string) => void;
  setHoursPerDay: (hours: number) => void;
  setPastedText: (text: string) => void;
  pastedText: string;
  analyzeMaterial: (file?: File) => Promise<void>;
  generateRoadmap: () => Promise<void>;
  resetStudy: () => void;
  buildStudyContextString: () => string;
};

const StudyContext = createContext<StudyContextValue | null>(null);

const basePath = () => process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function StudyProvider({ children }: { children: ReactNode }) {
  const [extractedText, setExtractedText] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [pastedText, setPastedText] = useState("");
  const [summary, setSummary] = useState<SummaryJSON | null>(null);
  const [roadmap, setRoadmap] = useState<RoadmapDay[]>([]);
  const [quiz, setQuiz] = useState<QuizQuestion[]>([]);
  const [emergency, setEmergency] = useState<EmergencyPlan | null>(null);
  const [examDate, setExamDate] = useState("");
  const [hoursPerDay, setHoursPerDay] = useState(3);
  const [isDemo, setIsDemo] = useState(false);
  const [loadingStep, setLoadingStep] = useState<StudyLoadingStep>("idle");

  const isLoading = loadingStep !== "idle";

  const resetStudy = useCallback(() => {
    setExtractedText("");
    setFileName(null);
    setPastedText("");
    setSummary(null);
    setRoadmap([]);
    setQuiz([]);
    setEmergency(null);
    setIsDemo(false);
    setLoadingStep("idle");
  }, []);

  const buildStudyContextString = useCallback(() => {
    if (!extractedText && !summary) {
      return "";
    }
    const parts: string[] = [];
    if (summary) {
      parts.push(`Course summary:\n${JSON.stringify(summary, null, 2)}`);
    }
    if (extractedText) {
      parts.push(`Source material excerpt:\n${extractedText.slice(0, 4000)}`);
    }
    return parts.join("\n\n");
  }, [extractedText, summary]);

  const analyzeMaterial = useCallback(
    async (file?: File) => {
      try {
        setLoadingStep("upload");
        let text = pastedText.trim();

        if (file) {
          const formData = new FormData();
          formData.append("file", file);
          const uploadRes = await fetch(`${basePath()}/api/study/upload`, {
            method: "POST",
            body: formData,
          });
          if (!uploadRes.ok) {
            const err = (await uploadRes.json()) as { error?: string };
            throw new Error(err.error ?? "Upload failed");
          }
          const uploadData = (await uploadRes.json()) as {
            text: string;
            fileName: string;
            truncated: boolean;
          };
          text = uploadData.text;
          setFileName(uploadData.fileName);
          if (uploadData.truncated) {
            toast.message("Large file truncated for AI processing");
          }
        }

        if (!text) {
          throw new Error("Add a PDF or paste syllabus text first");
        }

        setExtractedText(text);
        setIsDemo(false);
        setLoadingStep("summary");

        const summaryRes = await fetch(`${basePath()}/api/study/summarize`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
        });

        if (!summaryRes.ok) {
          const err = (await summaryRes.json()) as { error?: string };
          throw new Error(err.error ?? "Summary failed");
        }

        const summaryData = (await summaryRes.json()) as SummaryJSON;
        setSummary(summaryData);
        setRoadmap([]);
        setQuiz([]);
        setEmergency(null);
        toast.success("Material analyzed");
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Analysis failed";
        toast.error(message);
      } finally {
        setLoadingStep("idle");
      }
    },
    [pastedText]
  );

  const generateRoadmap = useCallback(async () => {
    if (!summary) {
      toast.error("Analyze your material first");
      return;
    }
    if (!examDate) {
      toast.error("Set an exam date");
      return;
    }

    try {
      setLoadingStep("roadmap");
      const res = await fetch(`${basePath()}/api/study/roadmap`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ summary, examDate, hoursPerDay }),
      });

      if (!res.ok) {
        const err = (await res.json()) as { error?: string };
        throw new Error(err.error ?? "Roadmap failed");
      }

      const data = (await res.json()) as { days: RoadmapDay[] };
      setRoadmap(data.days);
      toast.success("Study roadmap ready");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Roadmap failed";
      toast.error(message);
    } finally {
      setLoadingStep("idle");
    }
  }, [summary, examDate, hoursPerDay]);

  const value = useMemo(
    () => ({
      extractedText,
      fileName,
      summary,
      roadmap,
      quiz,
      emergency,
      examDate,
      hoursPerDay,
      isDemo,
      isLoading,
      loadingStep,
      pastedText,
      setExamDate,
      setHoursPerDay,
      setPastedText,
      analyzeMaterial,
      generateRoadmap,
      resetStudy,
      buildStudyContextString,
    }),
    [
      extractedText,
      fileName,
      summary,
      roadmap,
      quiz,
      emergency,
      examDate,
      hoursPerDay,
      isDemo,
      isLoading,
      loadingStep,
      pastedText,
      analyzeMaterial,
      generateRoadmap,
      resetStudy,
      buildStudyContextString,
    ]
  );

  return (
    <StudyContext.Provider value={value}>{children}</StudyContext.Provider>
  );
}

export function useStudyContext() {
  const ctx = useContext(StudyContext);
  if (!ctx) {
    throw new Error("useStudyContext must be used within StudyProvider");
  }
  return ctx;
}
