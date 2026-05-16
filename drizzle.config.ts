import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";
import { getPostgresConnectionString } from "./lib/db/postgres-url";

config({
  path: ".env.local",
});

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./lib/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: getPostgresConnectionString(),
  },
});
