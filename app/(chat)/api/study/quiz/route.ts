import { generateObject } from "ai";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/app/(auth)/auth";
import { DEFAULT_CHAT_MODEL } from "@/lib/ai/models";
import { getLanguageModel } from "@/lib/ai/providers";
import { normalizeQuizQuestions } from "@/lib/study/normalize";
import { truncateStudyText } from "@/lib/study/types";

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

  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim()) {
    return NextResponse.json(
      { error: "GOOGLE_GENERATIVE_AI_API_KEY is not configured" },
      { status: 500 }
    );
  }

  try {
    const json = await request.json();
    const { text, topic, difficulty } = bodySchema.parse(json);
    const { text: trimmed } = truncateStudyText(text);

    const focus =
      topic && difficulty
        ? `Focus on topic "${topic}" at ${difficulty} difficulty.`
        : topic
          ? `Focus on topic "${topic}".`
          : difficulty
            ? `Use ${difficulty} difficulty.`
            : "";

    const { object } = await generateObject({
      model: getLanguageModel(DEFAULT_CHAT_MODEL),
      schema: quizResponseSchema,
      temperature: 0.3,
      system:
        `You are an academic quiz author. Create 5–10 multiple-choice questions from the study material.
Each question must include: question text, options (array of exactly 4 strings), correctIndex (0-3), explanation, and id (q1, q2, ...).
${focus}`.trim(),
      prompt: trimmed,
    });

    const questions = normalizeQuizQuestions(
      object.questions.map((q, i) => ({
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
    return NextResponse.json(
      { error: "Failed to generate quiz" },
      { status: 500 }
    );
  }
}
