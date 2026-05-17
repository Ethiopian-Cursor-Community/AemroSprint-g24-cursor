import { generateObject } from "ai";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/app/(auth)/auth";
import { DEFAULT_CHAT_MODEL } from "@/lib/ai/models";
import { getLanguageModel } from "@/lib/ai/providers";
import {
  getDaysUntilExam,
  getExpectedRoadmapDayCount,
  getTodayDateString,
  resolveRoadmapDays,
} from "@/lib/study/normalize";
import { roadmapDaySchema, summaryJsonSchema } from "@/lib/study/types";

const bodySchema = z.object({
  summary: summaryJsonSchema,
  examDate: z.string(),
  hoursPerDay: z.number().min(1).max(16),
});

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim()) {
    return NextResponse.json(
      { error: "GOOGLE_GENERATIVE_AI_API_KEY is not configured" },
      { status: 500 }
    );
  }

  try {
    const json = await request.json();
    const { summary, examDate, hoursPerDay } = bodySchema.parse(json);

    const todayStr = getTodayDateString();
    const diffDays = getDaysUntilExam(examDate, todayStr);
    const expectedCount = getExpectedRoadmapDayCount(examDate, todayStr);

    let planningInstruction: string;
    if (diffDays > 10) {
      planningInstruction = `The exam is ${diffDays} calendar days away (${todayStr} to ${examDate}). Output at most ${expectedCount} evenly spaced study checkpoints between those dates only — not one entry per distant syllabus deadline.`;
    } else if (diffDays <= 0) {
      planningInstruction = `The exam is today or past (${examDate}). Output 1–3 cram sessions dated ${todayStr} only.`;
    } else {
      planningInstruction = `The exam is ${diffDays} calendar day(s) away. Output exactly ${expectedCount} study day(s) with consecutive dates from ${todayStr} through ${examDate}. Ignore semester deadlines in the summary — only plan for exam date ${examDate}.`;
    }

    const roadmapResponseSchema = z.object({
      days: z.array(roadmapDaySchema).min(1).max(Math.max(expectedCount, 3)),
    });

    const { object } = await generateObject({
      model: getLanguageModel(DEFAULT_CHAT_MODEL),
      schema: roadmapResponseSchema,
      temperature: 0.2,
      system: `You are a study planner. Build a practical roadmap for the student's EXAM DATE only.
TODAY: ${todayStr}
EXAM_DATE: ${examDate}
HOURS_PER_DAY: ${hoursPerDay}
${planningInstruction}
Each item needs: day (1-based index), date (YYYY-MM-DD between ${todayStr} and ${examDate}), topics, specific tasks, estimatedHours (<= ${hoursPerDay}), priority (critical|high|medium).`,
      prompt: JSON.stringify({
        summary,
        examDate,
        hoursPerDay,
        todayStr,
        expectedCount,
      }),
    });

    const days = resolveRoadmapDays(object.days, examDate, hoursPerDay, todayStr);

    if (days.length === 0) {
      return NextResponse.json(
        { error: "Could not build a roadmap for that exam date." },
        { status: 500 }
      );
    }

    return NextResponse.json({ days });
  } catch (error) {
    console.error("Roadmap generation failed:", error);
    return NextResponse.json(
      { error: "Failed to generate roadmap" },
      { status: 500 }
    );
  }
}
