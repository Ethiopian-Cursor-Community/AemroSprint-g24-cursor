import { streamCursorChat } from "@/lib/ai/cursor-agent";
import { updateDocumentPrompt } from "@/lib/ai/prompts";
import { createDocumentHandler } from "@/lib/artifacts/server";

export const textDocumentHandler = createDocumentHandler<"text">({
  kind: "text",
  onCreateDocument: async ({ title, dataStream, modelId }) => {
    let draftContent = "";

    for await (const chunk of streamCursorChat({
      system:
        "Write about the given topic. Markdown is supported. Use headings wherever appropriate.",
      userMessage: title,
      modelId,
    })) {
      if (chunk.type === "text-delta") {
        draftContent += chunk.delta;
        dataStream.write({
          type: "data-textDelta",
          data: chunk.delta,
          transient: true,
        });
      }
    }

    return draftContent;
  },
  onUpdateDocument: async ({ document, description, dataStream, modelId }) => {
    let draftContent = "";

    for await (const chunk of streamCursorChat({
      system: updateDocumentPrompt(document.content, "text"),
      userMessage: description,
      modelId,
    })) {
      if (chunk.type === "text-delta") {
        draftContent += chunk.delta;
        dataStream.write({
          type: "data-textDelta",
          data: chunk.delta,
          transient: true,
        });
      }
    }

    return draftContent;
  },
});
