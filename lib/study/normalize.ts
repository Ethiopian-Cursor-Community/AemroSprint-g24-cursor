import { addDays, differenceInCalendarDays, format, parseISO } from "date-fns";
import type { QuizQuestion, RoadmapDay } from "@/lib/study/types";

export function getTodayDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Calendar days from today until exam date (exam on same day = 0). */
export function getDaysUntilExam(
  examDate: string,
  todayStr = getTodayDateString()
): number {
  try {
    return differenceInCalendarDays(parseISO(examDate), parseISO(todayStr));
  } catch {
    return 0;
  }
}

/** Max roadmap entries for the study window. */
export function getExpectedRoadmapDayCount(
  examDate: string,
  todayStr = getTodayDateString()
): number {
  const diff = getDaysUntilExam(examDate, todayStr);
  if (diff <= 0) {
    return 3;
  }
  if (diff > 10) {
    return 10;
  }
  return diff + 1;
}

export function filterRoadmapDays(
  days: RoadmapDay[],
  examDate: string,
  todayStr = getTodayDateString()
): RoadmapDay[] {
  const maxCount = getExpectedRoadmapDayCount(examDate, todayStr);
  return days
    .filter((day) => day.date >= todayStr && day.date <= examDate)
    .sort((a, b) => a.date.localeCompare(b.date) || a.day - b.day)
    .slice(0, maxCount)
    .map((day, index) => ({ ...day, day: index + 1 }));
}

/** Re-date AI roadmap rows when the model used syllabus deadlines instead of the exam window. */
export function resolveRoadmapDays(
  rawDays: RoadmapDay[],
  examDate: string,
  hoursPerDay: number,
  todayStr = getTodayDateString()
): RoadmapDay[] {
  const filtered = filterRoadmapDays(rawDays, examDate, todayStr);
  if (filtered.length > 0) {
    return filtered;
  }

  const count = getExpectedRoadmapDayCount(examDate, todayStr);
  const templates =
    rawDays.length > 0
      ? rawDays
      : [
          {
            day: 1,
            date: todayStr,
            topics: ["Core review"],
            tasks: ["Review key material from your summary"],
            estimatedHours: hoursPerDay,
            priority: "critical" as const,
          },
        ];

  const start = parseISO(todayStr);
  const result: RoadmapDay[] = [];

  for (let i = 0; i < count; i++) {
    const template = templates[Math.min(i, templates.length - 1)];
    const date = format(addDays(start, i), "yyyy-MM-dd");
    if (date > examDate) {
      break;
    }
    result.push({
      day: i + 1,
      date,
      topics: template.topics?.length ? template.topics : ["Study block"],
      tasks: template.tasks?.length
        ? template.tasks
        : [`Study session ${i + 1}`],
      estimatedHours: Math.min(
        template.estimatedHours ?? hoursPerDay,
        hoursPerDay
      ),
      priority: template.priority ?? "high",
    });
  }

  return result;
}

type LooseQuizQuestion = {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

export function normalizeQuizQuestions(
  raw: LooseQuizQuestion[]
): QuizQuestion[] {
  return raw.slice(0, 10).map((q, index) => {
    const options = [...q.options].slice(0, 4);
    while (options.length < 4) {
      options.push(`Option ${options.length + 1}`);
    }
    const correctIndex = Math.min(
      3,
      Math.max(0, Math.round(Number(q.correctIndex) || 0))
    ) as 0 | 1 | 2 | 3;

    return {
      id: q.id || `q${index + 1}`,
      question: q.question,
      options: [options[0], options[1], options[2], options[3]],
      correctIndex,
      explanation: q.explanation || "Review the material for this topic.",
    };
  });
}
