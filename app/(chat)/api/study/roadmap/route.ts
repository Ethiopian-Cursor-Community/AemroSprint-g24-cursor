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

  let summary: any;
  let examDate: string = "";
  let hoursPerDay: number = 3;

  try {
    const json = await request.json();
    const parsed = bodySchema.parse(json);
    summary = parsed.summary;
    examDate = parsed.examDate;
    hoursPerDay = parsed.hoursPerDay;
  } catch (parseError) {
    console.error("Failed to parse roadmap request body:", parseError);
    return NextResponse.json(
      { error: "Invalid request payload" },
      { status: 400 }
    );
  }

  const todayStr = getTodayDateString();
  const diffDays = getDaysUntilExam(examDate, todayStr);
  const expectedCount = getExpectedRoadmapDayCount(examDate, todayStr);

  const roadmapResponseSchema = z.object({
    days: z.array(roadmapDaySchema).min(1).max(Math.max(expectedCount, 3)),
  });

  try {
    let planningInstruction: string;
    if (diffDays > 10) {
      planningInstruction = `The exam is ${diffDays} calendar days away (${todayStr} to ${examDate}). Output at most ${expectedCount} evenly spaced study checkpoints between those dates only — not one entry per distant syllabus deadline.`;
    } else if (diffDays <= 0) {
      planningInstruction = `The exam is today or past (${examDate}). Output 1–3 cram sessions dated ${todayStr} only.`;
    } else {
      planningInstruction = `The exam is ${diffDays} calendar day(s) away. Output exactly ${expectedCount} study day(s) with consecutive dates from ${todayStr} through ${examDate}. Ignore semester deadlines in the summary — only plan for exam date ${examDate}.`;
    }

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
    console.error("Roadmap generation failed, trying backup plan:", error);
    try {
      const backupTodayStr = new Date().toISOString().slice(0, 10);
      const today = new Date(backupTodayStr);
      const exam = new Date(examDate);
      const diffTime = exam.getTime() - today.getTime();
      const diffDaysBackup = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      let consolidationInstruction = "";
      if (diffDaysBackup > 10) {
        consolidationInstruction = `The exam is ${diffDaysBackup} days away. Because this is a long duration, DO NOT generate an item for every single day to avoid token limits. Instead, consolidate the plan into a maximum of 10 key study checkpoints or phases spaced evenly across this period (e.g. Day 1, Day 5, Day 10, etc.), each representing a critical study milestone with its corresponding date.`;
      } else if (diffDaysBackup <= 0) {
        consolidationInstruction = `The exam is today or in the past. Generate a highly compressed, last-minute cram roadmap of 1-3 critical study checkpoints for today.`;
      } else {
        consolidationInstruction = `The exam is ${diffDaysBackup} days away. Build a day-by-day study roadmap with one item for each day from today until the exam date.`;
      }

      const { object } = await generateObject({
        model: getLanguageModel(DEFAULT_CHAT_MODEL),
        schema: roadmapResponseSchema,
        temperature: 0.2,
        system: `You are a professional study planner. Today is ${backupTodayStr}.
${consolidationInstruction}
Each roadmap item needs: day (the day number from start), date (YYYY-MM-DD), topics (1-3 key topics), specific time-blocked tasks (1-2 clear, actionable items), estimatedHours, and priority (critical|high|medium).
Be highly concise in your descriptions to keep generation extremely fast and prevent truncation.`,
        prompt: JSON.stringify({ summary, examDate, hoursPerDay, today: backupTodayStr }),
      });

      return NextResponse.json(object);
    } catch (innerError) {
      console.error("Backup roadmap generation failed with error:", innerError);
      return NextResponse.json(
        { error: "Failed to generate roadmap" },
        { status: 500 }
      );
    }
  }
}
