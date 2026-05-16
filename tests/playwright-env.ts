import { config } from "dotenv";

config({ path: ".env.local" });
config({ path: ".env.test" });

/** NextAuth requires AUTH_SECRET; Playwright webServer must receive it explicitly. */
const PLAYWRIGHT_AUTH_SECRET_FALLBACK =
  "playwright-test-auth-secret-at-least-32-characters";

export function applyPlaywrightTestEnv(): Record<string, string> {
  process.env.PLAYWRIGHT = "True";

  if (!process.env.AUTH_SECRET) {
    process.env.AUTH_SECRET = PLAYWRIGHT_AUTH_SECRET_FALLBACK;
  }

  return {
    ...Object.fromEntries(
      Object.entries(process.env).filter(
        (entry): entry is [string, string] => typeof entry[1] === "string"
      )
    ),
    PLAYWRIGHT: "True",
    AUTH_SECRET: process.env.AUTH_SECRET,
  };
}
