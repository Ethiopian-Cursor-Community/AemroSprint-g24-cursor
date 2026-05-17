import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/app/(auth)/auth";
import { describeCursorError, runCursorJson } from "@/lib/ai/cursor-agent";
import { normalizeQuizQuestions } from "@/lib/study/normalize";
import { truncateStudyText } from "@/lib/study/types";

export const maxDuration = 60;

const bodySchema = z.object({
  text: z.string().min(1),
  topic: z.string().optional(),
  difficulty: z.string().optional(),
});

const quizQuestionLooseSchema = z.object({
  id: z.string().optional(),
  question: z.string(),
  options: z.array(z.string()).min(2).max(6),
  correctIndex: z.coerce.number(),
  explanation: z.string().optional(),
});

const quizResponseSchema = z.object({
  questions: z.array(quizQuestionLooseSchema).min(3).max(12),
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

  const { text, topic, difficulty } = body;
  const { text: trimmed } = truncateStudyText(text);

  const focus =
    topic && difficulty
      ? `Focus on topic "${topic}" at ${difficulty} difficulty.`
      : topic
        ? `Focus on topic "${topic}".`
        : difficulty
          ? `Use ${difficulty} difficulty.`
          : "";

  const prompt = `You are an academic quiz author. Create 5-10 multiple-choice questions from the study material below.

Each question must include: question text, options (array of exactly 4 strings), correctIndex (0-3 integer), explanation, and id ("q1", "q2", ...).

${focus}

Return JSON matching this shape exactly:
{
  "questions": [
    {
      "id": string,
      "question": string,
      "options": [string, string, string, string],
      "correctIndex": 0 | 1 | 2 | 3,
      "explanation": string
    }
  ]
}

Study material:
${trimmed}`;

  try {
    const { data } = await runCursorJson(prompt, quizResponseSchema);
    const questions = normalizeQuizQuestions(
      data.questions.map((q, i) => ({
        id: q.id ?? `q${i + 1}`,
        question: q.question,
        options: q.options,
        correctIndex: q.correctIndex,
        explanation: q.explanation ?? "",
      }))
    );

    if (questions.length < 3) {
      return NextResponse.json(
        { error: "Quiz returned too few questions. Try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ questions });
  } catch (error) {
    console.error("Quiz generation failed:", error);
    const { message, status } = describeCursorError(error);
    return NextResponse.json({ error: message }, { status });
  }
}
