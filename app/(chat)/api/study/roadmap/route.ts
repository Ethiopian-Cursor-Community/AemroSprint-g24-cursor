import { generateObject } from "ai";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/app/(auth)/auth";
import { DEFAULT_CHAT_MODEL } from "@/lib/ai/models";
import { getLanguageModel } from "@/lib/ai/providers";
import { roadmapDaySchema, summaryJsonSchema } from "@/lib/study/types";

const bodySchema = z.object({
  summary: summaryJsonSchema,
  examDate: z.string(),
  hoursPerDay: z.number().min(1).max(16),
});

const roadmapResponseSchema = z.object({
  days: z.array(roadmapDaySchema),
});

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const json = await request.json();
    const { summary, examDate, hoursPerDay } = bodySchema.parse(json);

    const todayStr = new Date().toISOString().slice(0, 10);
    const today = new Date(todayStr);
    const exam = new Date(examDate);
    const diffTime = exam.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let consolidationInstruction = "";
    if (diffDays > 10) {
      consolidationInstruction = `The exam is ${diffDays} days away. Because this is a long duration, DO NOT generate an item for every single day to avoid token limits. Instead, consolidate the plan into a maximum of 10 key study checkpoints or phases spaced evenly across this period (e.g. Day 1, Day 5, Day 10, etc.), each representing a critical study milestone with its corresponding date.`;
    } else if (diffDays <= 0) {
      consolidationInstruction = `The exam is today or in the past. Generate a highly compressed, last-minute cram roadmap of 1-3 critical study checkpoints for today.`;
    } else {
      consolidationInstruction = `The exam is ${diffDays} days away. Build a day-by-day study roadmap with one item for each day from today until the exam date.`;
    }

    const { object } = await generateObject({
      model: getLanguageModel(DEFAULT_CHAT_MODEL),
      schema: roadmapResponseSchema,
      temperature: 0.2, // Low temperature for high speed and deterministic structures
      system: `You are a professional study planner. Today is ${todayStr}.
${consolidationInstruction}
Each roadmap item needs: day (the day number from start), date (YYYY-MM-DD), topics (1-3 key topics), specific time-blocked tasks (1-2 clear, actionable items), estimatedHours, and priority (critical|high|medium).
Be highly concise in your descriptions to keep generation extremely fast and prevent truncation.`,
      prompt: JSON.stringify({ summary, examDate, hoursPerDay, today: todayStr }),
    });

    return NextResponse.json(object);
  } catch (error) {
    console.error("Roadmap generation failed with error:", error);
    return NextResponse.json(
      { error: "Failed to generate roadmap" },
      { status: 500 }
    );
  }
}
