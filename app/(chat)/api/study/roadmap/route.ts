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

    const { object } = await generateObject({
      model: getLanguageModel(DEFAULT_CHAT_MODEL),
      schema: roadmapResponseSchema,
      system: `You are a study planner. Build a day-by-day roadmap from today until the exam date.
Each day needs: day number, date (YYYY-MM-DD), topics, specific time-blocked tasks, estimatedHours, and priority (critical|high|medium).
Respect hoursPerDay. Front-load weak/high-weight topics. Be actionable, not vague.`,
      prompt: JSON.stringify({ summary, examDate, hoursPerDay }),
    });

    return NextResponse.json(object);
  } catch {
    return NextResponse.json(
      { error: "Failed to generate roadmap" },
      { status: 500 }
    );
  }
}
