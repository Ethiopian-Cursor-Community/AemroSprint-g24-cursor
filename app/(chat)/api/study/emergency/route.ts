import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/app/(auth)/auth";
import { describeCursorError, runCursorJson } from "@/lib/ai/cursor-agent";
import { emergencyPlanSchema, summaryJsonSchema } from "@/lib/study/types";

export const maxDuration = 60;

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

  let body: z.infer<typeof bodySchema>;
  try {
    body = bodySchema.parse(await request.json());
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }

  const { summary, hoursRemaining } = body;
  const totalMinutes = hoursRemaining * 60;

  const prompt = `You are a crisis academic coach. The student has ${hoursRemaining} hour(s) until their exam.

Be brutally prioritized — no fluff. Return priorityTopics, mustKnowFacts, skipThese, studyOrder (array of { topic, minutes (number), why }), and mindsetTip. studyOrder minutes should sum to roughly ${totalMinutes} or less.

Return JSON matching this shape exactly:
{
  "priorityTopics": string[],
  "mustKnowFacts": string[],
  "skipThese": string[],
  "studyOrder": { "topic": string, "minutes": number, "why": string }[],
  "mindsetTip": string
}

Course summary:
${JSON.stringify(summary)}`;

  try {
    const { data } = await runCursorJson(prompt, emergencyPlanLooseSchema);

    const parsed = emergencyPlanSchema.safeParse({
      priorityTopics: data.priorityTopics.length
        ? data.priorityTopics
        : summary.topics.slice(0, 3),
      mustKnowFacts: data.mustKnowFacts.length
        ? data.mustKnowFacts
        : summary.learningObjectives.slice(0, 3),
      skipThese: data.skipThese ?? [],
      studyOrder: data.studyOrder ?? [],
      mindsetTip:
        data.mindsetTip ??
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
    const { message, status } = describeCursorError(error);
    return NextResponse.json({ error: message }, { status });
  }
}
