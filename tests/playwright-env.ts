import { config } from "dotenv";
import { normalizePostgresUrl } from "@/lib/db/postgres-url";

config({ path: ".env.local" });
config({ path: ".env.test" });

/** NextAuth requires AUTH_SECRET; Playwright webServer must receive it explicitly. */
const PLAYWRIGHT_AUTH_SECRET_FALLBACK =
  "playwright-test-auth-secret-at-least-32-characters";

export function applyPlaywrightTestEnv(options?: { authUrl?: string }) {
  process.env.PLAYWRIGHT = "True";

  if (!process.env.AUTH_SECRET) {
    process.env.AUTH_SECRET = PLAYWRIGHT_AUTH_SECRET_FALLBACK;
  }

  if (process.env.POSTGRES_URL) {
    process.env.POSTGRES_URL = normalizePostgresUrl(process.env.POSTGRES_URL);
  }

  const port = process.env.PORT ?? "3000";
  const authUrl = options?.authUrl ?? process.env.AUTH_URL ?? `http://127.0.0.1:${port}`;
  process.env.AUTH_URL = authUrl;

  // <‑‑ NEW: expose the full NextAuth endpoint
  process.env.NEXTAUTH_URL = `${authUrl}/api/auth`;

  return {
    ...Object.fromEntries(
      Object.entries(process.env).filter(
        (entry): entry is [string, string] => typeof entry[1] === "string"
      )
    ),
    PLAYWRIGHT: "True",
    AUTH_SECRET: process.env.AUTH_SECRET,
    AUTH_URL: authUrl,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    ...(process.env.POSTGRES_URL
      ? { POSTGRES_URL: process.env.POSTGRES_URL }
      : {}),
  };
}
