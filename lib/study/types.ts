import { z } from "zod";

export const studyDeadlineSchema = z.object({
  label: z.string(),
  date: z.string(),
});

export const summaryJsonSchema = z.object({
  courseName: z.string().optional(),
  topics: z.array(z.string()),
  deadlines: z.array(studyDeadlineSchema),
  learningObjectives: z.array(z.string()),
  difficulty: z.string().optional(),
});

export type SummaryJSON = z.infer<typeof summaryJsonSchema>;

export const roadmapDaySchema = z.object({
  day: z.number(),
  date: z.string(),
  topics: z.array(z.string()),
  tasks: z.array(z.string()),
  estimatedHours: z.number(),
  priority: z.enum(["critical", "high", "medium"]),
});

export type RoadmapDay = z.infer<typeof roadmapDaySchema>;

export const quizQuestionSchema = z.object({
  id: z.string(),
  question: z.string(),
  options: z.tuple([z.string(), z.string(), z.string(), z.string()]),
  correctIndex: z.union([
    z.literal(0),
    z.literal(1),
    z.literal(2),
    z.literal(3),
  ]),
  explanation: z.string(),
});

export type QuizQuestion = z.infer<typeof quizQuestionSchema>;

export const emergencyPlanSchema = z.object({
  priorityTopics: z.array(z.string()),
  mustKnowFacts: z.array(z.string()),
  skipThese: z.array(z.string()),
  studyOrder: z.array(
    z.object({
      topic: z.string(),
      minutes: z.number(),
      why: z.string(),
    })
  ),
  mindsetTip: z.string(),
});

export type EmergencyPlan = z.infer<typeof emergencyPlanSchema>;

export const DEFAULT_STUDY_TEXT_MAX_CHARS = 12_000;

export function truncateStudyText(
  text: string,
  maxChars = DEFAULT_STUDY_TEXT_MAX_CHARS
): { text: string; truncated: boolean } {
  if (text.length <= maxChars) {
    return { text, truncated: false };
  }
  return {
    text: text.slice(0, maxChars),
    truncated: true,
  };
}
