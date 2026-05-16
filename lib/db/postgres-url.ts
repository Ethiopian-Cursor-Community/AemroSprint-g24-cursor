/** Neon UI sometimes copies `psql "postgresql://..."` — strip to a valid URL. */
export function normalizePostgresUrl(raw: string): string {
  let url = raw.trim();
  if (url.startsWith("psql ")) {
    url = url.slice(4).trim();
  }
  if (
    (url.startsWith('"') && url.endsWith('"')) ||
    (url.startsWith("'") && url.endsWith("'"))
  ) {
    url = url.slice(1, -1);
  }
  return url;
}

export function getPostgresConnectionString(): string {
  const raw = process.env.POSTGRES_URL ?? "";
  if (!raw) {
    return "";
  }
  return normalizePostgresUrl(raw);
}
