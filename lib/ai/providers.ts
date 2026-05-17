import { customProvider } from "ai";
import { isTestEnvironment } from "../constants";
import { titleModel } from "./models";

// TODO: Teammate will install the real Cursor SDK package and import it:
// import { createCursorSDK } from "@cursor/sdk";

export const myProvider = isTestEnvironment
  ? (() => {
      const { chatModel, titleModel: mockTitleModel } = require("./models.mock");
      return customProvider({
        languageModels: {
          "chat-model": chatModel,
          "title-model": mockTitleModel,
        },
      });
    })()
  : null;

/**
 * Placeholder client for the Cursor SDK integration.
 * This will be fully implemented and wired by the other teammate.
 */
export class CursorSDKClient {
  private apiKey: string;

  constructor(config: { apiKey: string }) {
    this.apiKey = config.apiKey;
  }

  // Placeholder for structural generation / generateObject calls
  async generateObject<T>(params: {
    model: string;
    schema: any;
    prompt: string;
    system?: string;
  }): Promise<{ object: T }> {
    console.log(`[Cursor SDK TODO] Calling generateObject with model ${params.model}`);
    throw new Error(
      "Cursor SDK generateObject is not yet implemented. Please replace this placeholder with the actual Cursor agent SDK logic."
    );
  }

  // Placeholder for streaming text / streamText calls
  async streamText(params: {
    model: string;
    prompt: string;
    system?: string;
  }) {
    console.log(`[Cursor SDK TODO] Calling streamText with model ${params.model}`);
    throw new Error(
      "Cursor SDK streamText is not yet implemented. Please replace this placeholder with the actual Cursor agent SDK logic."
    );
  }
}

let cursorClientInstance: CursorSDKClient | null = null;

export function getCursorClient() {
  if (!cursorClientInstance) {
    const apiKey = process.env.CURSOR_API_KEY || "";
    cursorClientInstance = new CursorSDKClient({ apiKey });
  }
  return cursorClientInstance;
}

/**
 * Retrieves a language model instance for the Vercel AI SDK.
 * Returns a custom placeholder model compatible with the Vercel AI SDK to prevent compiler breaks.
 */
export function getLanguageModel(modelId: string) {
  if (isTestEnvironment && myProvider) {
    return myProvider.languageModel(modelId);
  }

  // TODO: Teammate will initialize the actual Cursor SDK language model here.
  // Example:
  // const cursor = createCursorSDK({ apiKey: process.env.CURSOR_API_KEY });
  // return cursor.languageModel(modelId);

  console.warn(`[Cursor SDK Placeholder] getLanguageModel called for ID: ${modelId}`);

  // Compliant placeholder to prevent compilation issues
  return {
    modelId,
    specificationVersion: "v1",
    provider: "cursor",
    doGenerate: async () => {
      throw new Error(
        `Cursor SDK language model ${modelId} is not yet implemented. Please replace this placeholder with the actual integration.`
      );
    },
    doStream: async () => {
      throw new Error(
        `Cursor SDK language model ${modelId} is not yet implemented. Please replace this placeholder with the actual integration.`
      );
    },
  } as any;
}

export function getTitleModel() {
  if (isTestEnvironment && myProvider) {
    return myProvider.languageModel("title-model");
  }

  return getLanguageModel(titleModel.id);
}
