import { Agent, CursorAgentError } from "@cursor/sdk";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/app/(auth)/auth";

export const maxDuration = 60;

const bodySchema = z.object({
  topic: z.string().min(1).max(200),
  courseName: z.string().max(200).optional(),
  otherTopics: z.array(z.string()).max(20).optional(),
});

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.CURSOR_API_KEY?.trim()) {
    return NextResponse.json(
      { error: "CURSOR_API_KEY is not configured" },
      { status: 500 }
    );
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

  const { topic, courseName, otherTopics } = body;

  const contextLines: string[] = [];
  if (courseName) {
    contextLines.push(`Course: ${courseName}`);
  }
  if (otherTopics && otherTopics.length > 0) {
    contextLines.push(
      `Related topics in the course: ${otherTopics.join(", ")}`
    );
  }
  const contextBlock = contextLines.length
    ? `\n\nContext for the student:\n${contextLines.join("\n")}`
    : "";

  const prompt = `You are an expert tutor helping a student cram for an exam.
Explain "${topic}" clearly and concisely in well-formatted markdown.

Structure:
- Start with a 1-2 sentence plain-English definition.
- Cover the 3-5 key ideas a student MUST know to answer exam questions.
- Include one short worked example or analogy.
- End with a "Common pitfalls" callout (2-3 bullet points).

Keep it under 350 words. Use headings, bullet points, and short paragraphs.${contextBlock}`;

  try {
    const result = await Agent.prompt(prompt, {
      apiKey: process.env.CURSOR_API_KEY,
      model: { id: "composer-2" },
      local: { cwd: process.cwd() },
    });

    if (result.status !== "finished") {
      return NextResponse.json(
        { error: `Deep dive failed (status: ${result.status})` },
        { status: 500 }
      );
    }

    const explanation = result.result?.trim();
    if (!explanation) {
      return NextResponse.json(
        { error: "Deep dive returned an empty answer" },
        { status: 500 }
      );
    }

    return NextResponse.json({ explanation });
  } catch (error) {
    if (error instanceof CursorAgentError) {
      return NextResponse.json(
        {
          error: error.isRetryable
            ? "Cursor SDK is temporarily unavailable, please try again"
            : `Cursor SDK error: ${error.message}`,
        },
        { status: 502 }
      );
    }

    return NextResponse.json(
      { error: "Failed to generate deep dive" },
      { status: 500 }
    );
  }
}
