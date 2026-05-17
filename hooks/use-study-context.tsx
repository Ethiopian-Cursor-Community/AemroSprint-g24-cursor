"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
  useEffect,
} from "react";
import { toast } from "sonner";
import type {
  EmergencyPlan,
  QuizQuestion,
  RoadmapDay,
  SummaryJSON,
} from "@/lib/study/types";
import {
  DEMO_SUMMARY,
  DEMO_ROADMAP,
  DEMO_QUIZ,
  DEMO_EMERGENCY,
  DEMO_EXTRACTED_TEXT,
} from "@/lib/study/demo-data";

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
  generateQuiz: () => Promise<QuizQuestion[] | null>;
  generateEmergency: (hoursRemaining?: number) => Promise<void>;
  resetStudy: () => void;
  setFromDemo: () => void;
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

  // Hydrate state from sessionStorage on mount
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("second-brain-study");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.extractedText) setExtractedText(parsed.extractedText);
        if (parsed.fileName) setFileName(parsed.fileName);
        if (parsed.pastedText) setPastedText(parsed.pastedText);
        if (parsed.summary) setSummary(parsed.summary);
        if (parsed.roadmap) setRoadmap(parsed.roadmap);
        if (parsed.quiz) setQuiz(parsed.quiz);
        if (parsed.emergency) setEmergency(parsed.emergency);
        if (parsed.examDate) setExamDate(parsed.examDate);
        if (parsed.hoursPerDay) setHoursPerDay(parsed.hoursPerDay);
        if (parsed.isDemo !== undefined) setIsDemo(parsed.isDemo);
      }
    } catch (e) {
      console.error("Failed to load study session from sessionStorage", e);
    }
  }, []);

  // Persist state to sessionStorage on changes
  useEffect(() => {
    try {
      const stateToSave = {
        extractedText,
        fileName,
        pastedText,
        summary,
        roadmap,
        quiz,
        emergency,
        examDate,
        hoursPerDay,
        isDemo,
      };
      sessionStorage.setItem("second-brain-study", JSON.stringify(stateToSave));
    } catch (e) {
      // Ignore storage errors (e.g. quota exceeded)
    }
  }, [
    extractedText,
    fileName,
    pastedText,
    summary,
    roadmap,
    quiz,
    emergency,
    examDate,
    hoursPerDay,
    isDemo,
  ]);

  const resetStudy = useCallback(() => {
    setExtractedText("");
    setFileName(null);
    setPastedText("");
    setSummary(null);
    setRoadmap([]);
    setQuiz([]);
    setEmergency(null);
    setExamDate("");
    setHoursPerDay(3);
    setIsDemo(false);
    setLoadingStep("idle");
    try {
      sessionStorage.removeItem("second-brain-study");
    } catch (_) {}
  }, []);

  const setFromDemo = useCallback(() => {
    setExtractedText(DEMO_EXTRACTED_TEXT);
    setFileName("CS_301_Syllabus.pdf");
    setPastedText(DEMO_EXTRACTED_TEXT);
    setSummary(DEMO_SUMMARY);
    setRoadmap(DEMO_ROADMAP);
    setQuiz(DEMO_QUIZ);
    setEmergency(DEMO_EMERGENCY);
    setExamDate("2026-05-22");
    setHoursPerDay(3);
    setIsDemo(true);
    setLoadingStep("idle");
    toast.success("CS 301 Study Demo loaded instantly!");
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
        toast.success("Material analyzed successfully!");
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
      setIsDemo(false);
      toast.success("Study roadmap generated!");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Roadmap failed";
      toast.error(message);
    } finally {
      setLoadingStep("idle");
    }
  }, [summary, examDate, hoursPerDay]);

  const generateQuiz = useCallback(async (): Promise<QuizQuestion[] | null> => {
    if (!extractedText.trim()) {
      toast.error("Analyze your material first");
      return null;
    }

    try {
      setLoadingStep("quiz");
      const res = await fetch(`${basePath()}/api/study/quiz`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: extractedText }),
      });

      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(err.error ?? `Quiz failed (${res.status})`);
      }

      const data = (await res.json()) as { questions: QuizQuestion[] };
      setQuiz(data.questions);
      setIsDemo(false);
      toast.success(`Quiz ready — ${data.questions.length} questions`);
      return data.questions;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Quiz failed";
      toast.error(message);
      return null;
    } finally {
      setLoadingStep("idle");
    }
  }, [extractedText]);

  const generateEmergency = useCallback(
    async (hoursRemaining = 24) => {
      if (!summary) {
        toast.error("Analyze your material first");
        return;
      }

      try {
        setLoadingStep("emergency");
        const res = await fetch(`${basePath()}/api/study/emergency`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ summary, hoursRemaining }),
        });

        if (!res.ok) {
          const err = (await res.json().catch(() => ({}))) as {
            error?: string;
          };
          throw new Error(
            err.error ?? `Emergency plan failed (${res.status})`
          );
        }

        const data = (await res.json()) as EmergencyPlan;
        setEmergency(data);
        setIsDemo(false);
        toast.success("Emergency cram plan ready");
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Emergency plan failed";
        toast.error(message);
      } finally {
        setLoadingStep("idle");
      }
    },
    [summary]
  );

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
      generateQuiz,
      generateEmergency,
      resetStudy,
      setFromDemo,
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
      generateQuiz,
      generateEmergency,
      resetStudy,
      setFromDemo,
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
