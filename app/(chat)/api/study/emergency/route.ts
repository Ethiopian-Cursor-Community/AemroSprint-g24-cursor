import { generateObject } from "ai";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/app/(auth)/auth";
import { DEFAULT_CHAT_MODEL } from "@/lib/ai/models";
import { getLanguageModel } from "@/lib/ai/providers";
import { emergencyPlanSchema, summaryJsonSchema } from "@/lib/study/types";

const bodySchema = z.object({
  summary: summaryJsonSchema,
  hoursRemaining: z.number().min(1).max(168),
});

const emergencyPlanLooseSchema = z.object({
  priorityTopics: z.array(z.string()),
  mustKnowFacts: z.array(z.string()),
  skipThese: z.array(z.string()).optional(),
  studyOrder: z
    .array(
      z.object({
        topic: z.string(),
        minutes: z.coerce.number(),
        why: z.string(),
      })
    )
    .optional(),
  mindsetTip: z.string().optional(),
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
    const { summary, hoursRemaining } = bodySchema.parse(json);

    const { object } = await generateObject({
      model: getLanguageModel(DEFAULT_CHAT_MODEL),
      schema: emergencyPlanLooseSchema,
      temperature: 0.2,
      system: `You are a crisis academic coach. The student has ${hoursRemaining} hour(s) until their exam.
Be brutally prioritized — no fluff. Return priorityTopics, mustKnowFacts, skipThese, studyOrder (topic, minutes as number, why), and mindsetTip.
studyOrder minutes should sum to roughly ${hoursRemaining * 60} or less.`,
      prompt: JSON.stringify(summary),
    });

    const parsed = emergencyPlanSchema.safeParse({
      priorityTopics: object.priorityTopics.length
        ? object.priorityTopics
        : summary.topics.slice(0, 3),
      mustKnowFacts: object.mustKnowFacts.length
        ? object.mustKnowFacts
        : summary.learningObjectives.slice(0, 3),
      skipThese: object.skipThese ?? [],
      studyOrder: object.studyOrder ?? [],
      mindsetTip:
        object.mindsetTip ??
        "Focus on high-yield topics first — perfect is the enemy of done.",
    });

    if (!parsed.success) {
      console.error("Emergency plan validation failed:", parsed.error);
      return NextResponse.json(
        { error: "Failed to generate emergency plan" },
        { status: 500 }
      );
    }

    return NextResponse.json(parsed.data);
  } catch (error) {
    console.error("Emergency plan generation failed:", error);
    return NextResponse.json(
      { error: "Failed to generate emergency plan" },
      { status: 500 }
    );
  }
}
