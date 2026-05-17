import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/app/(auth)/auth";
import { describeCursorError, runCursorJson } from "@/lib/ai/cursor-agent";
import { summaryJsonSchema, truncateStudyText } from "@/lib/study/types";

export const maxDuration = 60;

const bodySchema = z.object({
  text: z.string().min(1),
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

  const { text } = body;
  const { text: trimmed } = truncateStudyText(text);

  const prompt = `You are an academic analyst. Extract structured study intelligence from the syllabus or course notes below.

Identify the course name, key topics, deadlines (with labels), learning objectives, and overall difficulty. Be specific and practical. Use ISO dates (YYYY-MM-DD) when possible.

Return JSON matching this shape exactly:
{
  "courseName": string | undefined,
  "topics": string[],
  "deadlines": { "label": string, "date": string }[],
  "learningObjectives": string[],
  "difficulty": string | undefined
}

Course notes:
${trimmed}`;

  try {
    const { data } = await runCursorJson(prompt, summaryJsonSchema);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Summary extraction failed:", error);
    const { message, status } = describeCursorError(error);
    return NextResponse.json({ error: message }, { status });
  }
}
