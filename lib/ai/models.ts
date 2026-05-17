export const DEFAULT_CHAT_MODEL = "composer-2";

export const titleModel = {
  id: "composer-2",
  name: "Composer 2",
  provider: "cursor",
  description: "Cursor-hosted default model used for short generations",
};

export type ModelCapabilities = {
  tools: boolean;
  vision: boolean;
  reasoning: boolean;
};

export type ChatModel = {
  id: string;
  name: string;
  provider: string;
  description: string;
  reasoningEffort?: "none" | "minimal" | "low" | "medium" | "high";
};

export const chatModels: ChatModel[] = [
  {
    id: "composer-2",
    name: "Cursor Composer 2",
    provider: "cursor",
    description:
      "Cursor's default agentic model — best balance of quality and latency for study help",
  },
  {
    id: "composer-2-fast",
    name: "Cursor Composer 2 Fast",
    provider: "cursor",
    description: "Faster, lower-latency Composer 2 variant for quick answers",
  },
  {
    id: "auto",
    name: "Cursor Auto",
    provider: "cursor",
    description: "Let Cursor pick the best available model for each request",
  },
];

export function getCapabilities(): Record<string, ModelCapabilities> {
  return Object.fromEntries(
    chatModels.map((model) => [
      model.id,
      {
        tools: false,
        vision: false,
        reasoning: false,
      },
    ])
  );
}

export const isDemo = process.env.IS_DEMO === "1";

export type GatewayModelWithCapabilities = ChatModel & {
  capabilities: ModelCapabilities;
};

export function getAllGatewayModels(): GatewayModelWithCapabilities[] {
  const capabilities = getCapabilities();
  return chatModels.map((m) => ({
    ...m,
    capabilities: capabilities[m.id],
  }));
}

export function getActiveModels(): ChatModel[] {
  return chatModels;
}

export const allowedModelIds = new Set(chatModels.map((m) => m.id));

export const modelsByProvider = chatModels.reduce(
  (acc, model) => {
    if (!acc[model.provider]) {
      acc[model.provider] = [];
    }
    acc[model.provider].push(model);
    return acc;
  },
  {} as Record<string, ChatModel[]>
);
