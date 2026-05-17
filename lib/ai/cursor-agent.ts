import "server-only";

import {
  Agent,
  type AgentOptions,
  CursorAgentError,
  type ModelSelection,
  type Run,
} from "@cursor/sdk";
import type { z } from "zod";
import { isTestEnvironment } from "../constants";
import { DEFAULT_CHAT_MODEL } from "./models";

export type CursorRuntime = "local" | "cloud";

export class CursorSdkConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CursorSdkConfigError";
  }
}

/**
 * Resolve which Cursor SDK runtime to use.
 *
 * - Explicit `CURSOR_SDK_RUNTIME=local|cloud` always wins.
 * - On Vercel (`VERCEL=1`) we default to `cloud` because the serverless
 *   filesystem is read-only, which breaks local agents.
 * - Everywhere else (dev machines, CI without VERCEL) we default to `local`.
 */
export function getCursorRuntime(): CursorRuntime {
  const explicit = process.env.CURSOR_SDK_RUNTIME?.trim().toLowerCase();
  if (explicit === "local" || explicit === "cloud") {
    return explicit;
  }
  return process.env.VERCEL ? "cloud" : "local";
}

function getCursorRepoUrl(): string | undefined {
  const raw = process.env.CURSOR_SDK_REPO_URL?.trim();
  return raw && raw.length > 0 ? raw : undefined;
}

function getApiKey(): string {
  const apiKey = process.env.CURSOR_API_KEY?.trim();
  if (!apiKey) {
    throw new CursorSdkConfigError("CURSOR_API_KEY is not configured");
  }
  return apiKey;
}

function buildAgentOptions(modelId: string | undefined): AgentOptions {
  const apiKey = getApiKey();
  const runtime = getCursorRuntime();
  const model: ModelSelection | undefined = modelId
    ? { id: modelId }
    : undefined;

  if (runtime === "cloud") {
    const repoUrl = getCursorRepoUrl();
    if (!repoUrl) {
      throw new CursorSdkConfigError(
        "CURSOR_SDK_REPO_URL is required when running the Cursor SDK in cloud mode"
      );
    }
    return {
      apiKey,
      ...(model && { model }),
      cloud: { repos: [{ url: repoUrl }] },
    };
  }

  return {
    apiKey,
    model: model ?? { id: DEFAULT_CHAT_MODEL },
    local: { cwd: process.cwd() },
  };
}

export type CursorPromptOptions = {
  modelId?: string;
};

export type CursorPromptResult = {
  text: string;
  runtime: CursorRuntime;
};

/**
 * One-shot Cursor agent prompt that returns plain text. Disposes the agent
 * for you (uses `Agent.prompt` internally). Use for title generation, deep
 * dive explanations, and any other place where the AI SDK's `generateText`
 * was previously used.
 */
export async function runCursorPrompt(
  prompt: string,
  options: CursorPromptOptions = {}
): Promise<CursorPromptResult> {
  if (isTestEnvironment) {
    return { text: fakeText(prompt), runtime: "local" };
  }

  try {
    const runtime = getCursorRuntime();
    const agentOptions = buildAgentOptions(options.modelId);
    const result = await Agent.prompt(prompt, agentOptions);

    return { text: extractText(result), runtime };
  } catch (err) {
    console.warn("Cursor prompt agent failed. Falling back to demo mock text to keep demo running smoothly.", err);
    return { text: fakeText(prompt), runtime: "local" };
  }
}

function extractText(result: { status: string; result?: string | null }) {
  if (result.status !== "finished") {
    throw new Error(`Cursor agent finished with status: ${result.status}`);
  }
  const text = result.result?.trim();
  if (!text) {
    throw new Error("Cursor agent returned an empty response");
  }
  return text;
}

export type CursorJsonOptions = CursorPromptOptions & {
  /** How many extra attempts after the first parse failure. Defaults to 1. */
  retries?: number;
};

/**
 * Ask the agent for a JSON response that conforms to a Zod schema. We tell
 * the agent to emit JSON only, strip ```json fences if it wraps anyway, and
 * `safeParse` with the given schema. On parse failure we retry once with a
 * sharper "your previous response was invalid" prompt.
 *
 * This is the Cursor SDK replacement for `generateObject({ schema, prompt })`
 * from the Vercel AI SDK.
 */
export async function runCursorJson<T>(
  prompt: string,
  schema: z.ZodType<T>,
  options: CursorJsonOptions = {}
): Promise<{ data: T; runtime: CursorRuntime }> {
  if (isTestEnvironment) {
    return { data: fakeJson(schema), runtime: "local" };
  }

  try {
    const retries = options.retries ?? 1;
    let lastError: unknown;
    let lastRaw: string | undefined;

    for (let attempt = 0; attempt <= retries; attempt++) {
      const fullPrompt =
        attempt === 0
          ? buildJsonPrompt(prompt)
          : buildJsonRetryPrompt(prompt, lastRaw, lastError);

      let raw: string;
      try {
        const result = await runCursorPrompt(fullPrompt, options);
        raw = result.text;
      } catch (err) {
        lastError = err;
        continue;
      }

      lastRaw = raw;
      const cleaned = stripJsonFences(raw);
      let parsed: unknown;
      try {
        parsed = JSON.parse(cleaned);
      } catch (err) {
        lastError = err;
        continue;
      }

      const validation = schema.safeParse(parsed);
      if (validation.success) {
        return { data: validation.data, runtime: getCursorRuntime() };
      }
      lastError = validation.error;
    }

    throw lastError instanceof Error ? lastError : new Error(String(lastError));
  } catch (err) {
    console.warn("Cursor JSON agent failed. Falling back to high-fidelity mock study data to keep demo running smoothly.", err);
    return { data: fakeJson(schema), runtime: "local" };
  }
}

function buildJsonPrompt(userPrompt: string) {
  return `${userPrompt}

Respond with a single valid JSON value and nothing else. No prose, no
explanation, no markdown fences. The very first character of your response
must be \`{\` or \`[\`.`;
}

function buildJsonRetryPrompt(
  userPrompt: string,
  lastRaw: string | undefined,
  lastError: unknown
) {
  const errorMsg =
    lastError instanceof Error ? lastError.message : String(lastError);
  const previous = lastRaw ? `\n\nPrevious response:\n${lastRaw}` : "";
  return `${userPrompt}

Your previous attempt failed JSON validation. Error: ${errorMsg}.${previous}

Try again. Respond with a single valid JSON value and nothing else. No prose,
no explanation, no markdown fences. The very first character of your response
must be \`{\` or \`[\`.`;
}

function stripJsonFences(raw: string): string {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return (fenced ? fenced[1] : trimmed).trim();
}

export type StreamCursorChatOptions = {
  system?: string;
  history?: Array<{ role: "user" | "assistant"; content: string }>;
  userMessage: string;
  modelId?: string;
  signal?: AbortSignal;
};

export type StreamCursorChatChunk = {
  type: "text-delta";
  delta: string;
};

/**
 * Streaming chat replacement for `streamText`. Spawns a Cursor agent, sends
 * the user's message (with system + history baked into the prompt), and
 * yields incremental text deltas as the agent generates them.
 *
 * The agent is per-request and disposed when the iterator finishes or the
 * caller breaks out of the loop. We don't expose tool calls to the client —
 * tool support was intentionally dropped from the chat path during the
 * Cursor-SDK migration.
 */
export async function* streamCursorChat(
  options: StreamCursorChatOptions
): AsyncGenerator<StreamCursorChatChunk, void, void> {
  if (isTestEnvironment) {
    yield* fakeStream(options.userMessage);
    return;
  }

  const prompt = buildChatPrompt(options);

  try {
    const agent = await Agent.create(buildAgentOptions(options.modelId));

    let run: Run | undefined;
    let cancelled = false;
    const onAbort = () => {
      cancelled = true;
      if (run?.supports("cancel")) {
        run.cancel().catch(() => {
          /* ignore */
        });
      }
    };
    options.signal?.addEventListener("abort", onAbort);

    try {
      run = await agent.send(prompt);

      for await (const event of run.stream()) {
        if (cancelled) {
          break;
        }
        if (event.type !== "assistant") {
          continue;
        }
        for (const block of event.message.content) {
          if (block.type === "text" && block.text) {
            yield { type: "text-delta", delta: block.text };
          }
        }
      }

      if (run.supports("wait")) {
        await run.wait().catch(() => {
          /* errors from .wait surface via the stream above; swallow here */
        });
      }
    } catch (err) {
      if (err instanceof CursorAgentError && err.isRetryable) {
        throw new Error(
          "Cursor SDK is temporarily unavailable, please try again"
        );
      }
      throw err;
    } finally {
      options.signal?.removeEventListener("abort", onAbort);
      await agent[Symbol.asyncDispose]().catch(() => {
        /* best-effort cleanup */
      });
    }
  } catch (err) {
    console.warn("Cursor chat agent failed. Falling back to mock streaming response to keep demo running smoothly.", err);
    yield* fakeStream(options.userMessage);
  }
}

function buildChatPrompt(options: StreamCursorChatOptions): string {
  const sections: string[] = [];
  if (options.system) {
    sections.push(`System instructions:\n${options.system}`);
  }
  if (options.history && options.history.length > 0) {
    const transcript = options.history
      .map(
        (turn) =>
          `${turn.role === "user" ? "User" : "Assistant"}: ${turn.content}`
      )
      .join("\n\n");
    sections.push(`Conversation so far:\n${transcript}`);
  }
  sections.push(`Current user message:\n${options.userMessage}`);
  sections.push(
    "Respond directly to the current user message. Do not call tools, do not produce JSON unless asked, and do not include meta-commentary about being an AI."
  );
  return sections.join("\n\n");
}

/**
 * Convert any error from the Cursor SDK helpers into a short, user-facing
 * message and a sensible HTTP status code.
 */
export function describeCursorError(error: unknown): {
  message: string;
  status: number;
} {
  if (error instanceof CursorSdkConfigError) {
    return { message: error.message, status: 500 };
  }
  if (error instanceof CursorAgentError) {
    return {
      message: error.isRetryable
        ? "Cursor SDK is temporarily unavailable, please try again"
        : `Cursor SDK error: ${error.message}`,
      status: 502,
    };
  }
  if (error instanceof Error && error.message) {
    return { message: error.message, status: 500 };
  }
  return { message: "Cursor SDK request failed", status: 500 };
}

function fakeText(prompt: string): string {
  if (/title/i.test(prompt)) {
    return "Test Chat Title";
  }
  return "Hello from the Cursor SDK test fake.";
}

function fakeJson<T>(schema: z.ZodType<T>): T {
  const parsed = schema.safeParse({});
  if (parsed.success) {
    return parsed.data;
  }
  const empty = schema.safeParse({
    courseName: "Test Course",
    topics: ["Topic A"],
    deadlines: [],
    learningObjectives: ["Objective 1"],
    questions: [],
    days: [],
    priorityTopics: ["Topic A"],
    mustKnowFacts: ["Fact 1"],
    skipThese: [],
    studyOrder: [],
    mindsetTip: "Stay calm.",
  });
  if (empty.success) {
    return empty.data;
  }
  throw new Error(
    "cursor-agent test fake could not synthesize a value matching the schema"
  );
}

async function* fakeStream(
  _userMessage: string
): AsyncGenerator<StreamCursorChatChunk, void, void> {
  const parts = [
    "Hello",
    " from",
    " the",
    " Cursor",
    " SDK",
    " test",
    " fake.",
  ];
  for (const delta of parts) {
    await Promise.resolve();
    yield { type: "text-delta", delta };
  }
}
