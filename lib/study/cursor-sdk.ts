import "server-only";

import { Agent, CursorAgentError } from "@cursor/sdk";

export type CursorRuntime = "local" | "cloud";

/**
 * Pick which Cursor SDK runtime to use.
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

export function getCursorRepoUrl(): string | undefined {
  const raw = process.env.CURSOR_SDK_REPO_URL?.trim();
  return raw && raw.length > 0 ? raw : undefined;
}

export type CursorPromptResult = {
  text: string;
  runtime: CursorRuntime;
};

export class CursorSdkConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CursorSdkConfigError";
  }
}

/**
 * Run a one-shot Cursor agent prompt and return its plain-text answer.
 *
 * Centralized so every study route (deep-dive, chat fallback, etc.) uses the
 * same runtime selection, error handling, and cleanup behaviour. Maps Cursor
 * SDK failures to short messages safe to surface to the client.
 */
export async function runCursorPrompt(
  prompt: string
): Promise<CursorPromptResult> {
  const apiKey = process.env.CURSOR_API_KEY?.trim();
  if (!apiKey) {
    throw new CursorSdkConfigError("CURSOR_API_KEY is not configured");
  }

  const runtime = getCursorRuntime();

  if (runtime === "cloud") {
    const repoUrl = getCursorRepoUrl();
    if (!repoUrl) {
      throw new CursorSdkConfigError(
        "CURSOR_SDK_REPO_URL is required when running the Cursor SDK in cloud mode"
      );
    }

    const result = await Agent.prompt(prompt, {
      apiKey,
      cloud: {
        repos: [{ url: repoUrl }],
      },
    });

    return {
      text: extractText(result),
      runtime,
    };
  }

  const result = await Agent.prompt(prompt, {
    apiKey,
    model: { id: "composer-2" },
    local: { cwd: process.cwd() },
  });

  return {
    text: extractText(result),
    runtime,
  };
}

function extractText(result: {
  status: string;
  result?: string | null;
}): string {
  if (result.status !== "finished") {
    throw new Error(`Cursor agent finished with status: ${result.status}`);
  }
  const text = result.result?.trim();
  if (!text) {
    throw new Error("Cursor agent returned an empty response");
  }
  return text;
}

/**
 * Convert any error from `runCursorPrompt` into a short, user-facing message
 * and a sensible HTTP status code for the response.
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
