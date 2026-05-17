import { streamCursorChat } from "@/lib/ai/cursor-agent";
import { sheetPrompt, updateDocumentPrompt } from "@/lib/ai/prompts";
import { createDocumentHandler } from "@/lib/artifacts/server";

export const sheetDocumentHandler = createDocumentHandler<"sheet">({
  kind: "sheet",
  onCreateDocument: async ({ title, dataStream, modelId }) => {
    let draftContent = "";

    for await (const chunk of streamCursorChat({
      system: `${sheetPrompt}\n\nOutput ONLY the raw CSV data. No explanations, no markdown fences.`,
      userMessage: title,
      modelId,
    })) {
      if (chunk.type === "text-delta") {
        draftContent += chunk.delta;
        dataStream.write({
          type: "data-sheetDelta",
          data: draftContent,
          transient: true,
        });
      }
    }

    return draftContent;
  },
  onUpdateDocument: async ({ document, description, dataStream, modelId }) => {
    let draftContent = "";

    for await (const chunk of streamCursorChat({
      system: `${updateDocumentPrompt(document.content, "sheet")}\n\nOutput ONLY the raw CSV data. No explanations, no markdown fences.`,
      userMessage: description,
      modelId,
    })) {
      if (chunk.type === "text-delta") {
        draftContent += chunk.delta;
        dataStream.write({
          type: "data-sheetDelta",
          data: draftContent,
          transient: true,
        });
      }
    }

    return draftContent;
  },
});
