import { tool, type UIMessageStreamWriter } from "ai";
import type { Session } from "next-auth";
import { z } from "zod";
import { runCursorJson } from "@/lib/ai/cursor-agent";
import { getDocumentById, saveSuggestions } from "@/lib/db/queries";
import type { Suggestion } from "@/lib/db/schema";
import type { ChatMessage } from "@/lib/types";
import { generateUUID } from "@/lib/utils";

type RequestSuggestionsProps = {
  session: Session;
  dataStream: UIMessageStreamWriter<ChatMessage>;
  modelId: string;
};

const suggestionsSchema = z.object({
  suggestions: z
    .array(
      z.object({
        originalSentence: z.string(),
        suggestedSentence: z.string(),
        description: z.string(),
      })
    )
    .min(1)
    .max(5),
});

export const requestSuggestions = ({
  session,
  dataStream,
  modelId,
}: RequestSuggestionsProps) =>
  tool({
    description:
      "Request writing suggestions for an existing document artifact. Only use this when the user explicitly asks to improve or get suggestions for a document they have already created. Never use for general questions.",
    inputSchema: z.object({
      documentId: z
        .string()
        .describe(
          "The UUID of an existing document artifact that was previously created with createDocument"
        ),
    }),
    execute: async ({ documentId }) => {
      const document = await getDocumentById({ id: documentId });

      if (!document?.content) {
        return { error: "Document not found" };
      }

      if (document.userId !== session.user?.id) {
        return { error: "Forbidden" };
      }

      const prompt = `You are a writing assistant. Given the document below, offer up to 5 suggestions to improve it. Each suggestion must contain full sentences (not just individual words) and describe what changed and why.

Return JSON matching this shape exactly:
{
  "suggestions": [
    {
      "originalSentence": string,
      "suggestedSentence": string,
      "description": string
    }
  ]
}

Document:
${document.content}`;

      const { data } = await runCursorJson(prompt, suggestionsSchema, {
        modelId,
      });

      const suggestions: Omit<
        Suggestion,
        "userId" | "createdAt" | "documentCreatedAt"
      >[] = data.suggestions.map((element) => ({
        originalText: element.originalSentence,
        suggestedText: element.suggestedSentence,
        description: element.description,
        id: generateUUID(),
        documentId,
        isResolved: false,
      }));

      for (const suggestion of suggestions) {
        dataStream.write({
          type: "data-suggestion",
          data: suggestion as Suggestion,
          transient: true,
        });
      }

      if (session.user?.id) {
        const userId = session.user.id;
        await saveSuggestions({
          suggestions: suggestions.map((suggestion) => ({
            ...suggestion,
            userId,
            createdAt: new Date(),
            documentCreatedAt: document.createdAt,
          })),
        });
      }

      return {
        id: documentId,
        title: document.title,
        kind: document.kind,
        message: "Suggestions have been added to the document",
      };
    },
  });
