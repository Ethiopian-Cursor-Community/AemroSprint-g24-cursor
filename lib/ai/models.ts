export const DEFAULT_CHAT_MODEL = "cursor-fast";

export const titleModel = {
  id: "cursor-fast",
  name: "Cursor Fast",
  provider: "cursor",
  description: "Fast model for title generation",
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
    id: "cursor-fast",
    name: "Cursor Fast",
    provider: "cursor",
    description: "Extremely fast next-gen study model with massive context capacity",
  },
  {
    id: "cursor-medium",
    name: "Cursor Medium",
    provider: "cursor",
    description: "Balanced model optimized for deep analytical reasoning and structure",
  },
  {
    id: "cursor-large",
    name: "Cursor Large",
    provider: "cursor",
    description: "State-of-the-art reasoning model for highly complex concepts and quizzes",
  },
  {
    id: "cursor-preview",
    name: "Cursor Preview",
    provider: "cursor",
    description: "Experimental cutting-edge preview model for testing new intelligence",
  },
];

export async function getCapabilities(): Promise<
  Record<string, ModelCapabilities>
> {
  return Object.fromEntries(
    chatModels.map((model) => [
      model.id,
      {
        tools: true,
        vision: true,
        reasoning: model.id.includes("pro") || model.id.includes("3"),
      },
    ])
  );
}

export const isDemo = process.env.IS_DEMO === "1";

export type GatewayModelWithCapabilities = ChatModel & {
  capabilities: ModelCapabilities;
};

export async function getAllGatewayModels(): Promise<
  GatewayModelWithCapabilities[]
> {
  const capabilities = await getCapabilities();
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
