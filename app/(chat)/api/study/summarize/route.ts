import { generateObject } from "ai";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/app/(auth)/auth";
import { DEFAULT_CHAT_MODEL } from "@/lib/ai/models";
import { getLanguageModel } from "@/lib/ai/providers";
import { summaryJsonSchema, truncateStudyText } from "@/lib/study/types";

const bodySchema = z.object({
  text: z.string().min(1),
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
    const { text } = bodySchema.parse(json);
    const { text: trimmed } = truncateStudyText(text);

    const { object } = await generateObject({
      model: getLanguageModel(DEFAULT_CHAT_MODEL),
      schema: summaryJsonSchema,
      system: `You are an academic analyst. Extract structured study intelligence from syllabus or course notes.
Identify course name, key topics, deadlines with labels, and learning objectives.
Be specific and practical. Use ISO dates (YYYY-MM-DD) when possible.`,
      prompt: trimmed,
    });

    return NextResponse.json(object);
  } catch (error) {
    console.error("Summary extraction failed:", error);
    console.error("Summary extraction failed with error:", error);
    return NextResponse.json(
      { error: "Failed to generate summary" },
      { status: 500 }
    );
  }
}
