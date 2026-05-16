# AemroSprint

**AI Student AemroSprint** — an AI-powered academic survival assistant built for the Cursor Hackathon.

Turn syllabi and lecture notes into summaries, study roadmaps, quizzes, and last-minute exam cram plans — then ask follow-up questions in chat grounded in your material.

**Repository:** [github.com/niyatberhe/AemroSprint-cursor](https://github.com/niyatberhe/AemroSprint-cursor)

---

## Hackathon attribution (required by judges)

### Original project

This app is **based on** the open-source **[Vercel AI Chatbot](https://github.com/vercel/ai-chatbot)** template (Next.js App Router, Vercel AI SDK, Auth.js, Drizzle, shadcn/ui).

- **Original repository:** https://github.com/vercel/ai-chatbot  
- **License:** See [LICENSE](./LICENSE) (starter terms apply to upstream code we retained).

We did **not** use GitHub’s “Fork” button. We copied the starter into our own repository [`AemroSprint-cursor`](https://github.com/niyatberhe/AemroSprint-cursor) and developed **AemroSprint** there.

### What we implemented (our work vs. the starter)

The starter is a **generic multi-model chatbot** with artifacts, image upload, and chat history. **Our hackathon contribution** is the academic “AemroSprint” product layer:

| Area | Original starter | Our implementation |
|------|------------------|-------------------|
| **Product / UX** | Generic “Chatbot” greeting & demo prompts | **AemroSprint** branding, student-focused copy and suggested actions |
| **Core features** | General chat + document artifacts | **Study pipeline:** PDF/text upload → AI summary → study roadmap |
| **API routes** | Chat, history, files (images), documents | New `app/(chat)/api/study/upload`, `summarize`, `roadmap` with structured JSON |
| **Data / types** | Chat messages only | `lib/study/types.ts` — Zod schemas for summaries, roadmaps, quizzes, emergency plans |
| **Client state** | Chat hooks only | `hooks/use-study-context.tsx` — study session state across UI |
| **UI** | Chat shell only | `components/study/*` — workspace, summary card, roadmap timeline, dropzone upload |
| **AI behavior** | Generic assistant prompt | Student co-pilot prompts in `lib/ai/prompts.ts` |
| **Removed** | Weather demo tool | Removed as irrelevant to the academic use case |
| **Planned (in progress)** | — | Quiz, Emergency Exam Mode, Try Demo, chat grounded in uploaded material |

**Files that are clearly ours (not in the upstream template):**

- `lib/study/`, `components/study/`, `hooks/use-study-context.tsx`
- `app/(chat)/api/study/**`
- `AI Student AemroSprint HackathonPlan.docx`, `.cursor/plans/aemrosprint_mvp_b1934e2d.plan.md`
- Rewritten [`README.md`](./README.md) (this file)

**Files we kept from the starter (infrastructure):** auth, database schema, chat streaming, sidebar, shadcn components, artifact panel — extended where needed, not replaced.

---

## What it does (MVP)

| Feature | Status |
|---------|--------|
| PDF / text upload & parsing | Done |
| AI study summary (topics, deadlines, objectives) | Done |
| Day-by-day study roadmap | Done |
| Quiz / flashcard generator | Planned |
| Emergency Exam Mode (“panic” cram guide) | Planned |
| Chat grounded in uploaded material | Planned |
| Try Demo (offline fallback data) | Planned |

See [`AI Student AemroSprint HackathonPlan.docx`](./AI%20Student%20AemroSprint%20HackathonPlan.docx) for the full execution plan.

---

## Tech stack

- **Framework:** Next.js App Router (from [Vercel AI Chatbot](https://github.com/vercel/ai-chatbot))
- **AI:** Vercel AI SDK + AI Gateway (`generateObject` for structured study outputs)
- **UI:** shadcn/ui, Tailwind CSS
- **Auth:** Auth.js (guest + email)
- **Database:** Postgres (Drizzle) — chat history & users
- **PDF parsing:** `pdf-parse` on study upload route

---

## Getting started

### Prerequisites

- Node.js 18+
- pnpm
- Postgres URL, AI Gateway key, Auth secret (see [`.env.example`](.env.example))

### Setup

```bash
pnpm install
cp .env.example .env.local
# Fill in POSTGRES_URL, GOOGLE_GENERATIVE_AI_API_KEY, AUTH_SECRET, etc.

pnpm db:migrate
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables

| Variable | Purpose |
|----------|---------|
| `AUTH_SECRET` | **Required.** Session encryption (NextAuth). Min 32 characters. [Generate one](https://generate-secret.vercel.app/32) |
| `GOOGLE_GENERATIVE_AI_API_KEY` | AI models (Gemini free tier) |
| `POSTGRES_URL` | Chat, users, guest login |
| `BLOB_READ_WRITE_TOKEN` | Image uploads in chat |
| `REDIS_URL` | Optional — resumable streams |

### Playwright tests

E2E tests start the dev server via Playwright. **NextAuth needs `AUTH_SECRET`** — if it is missing you may see:

`MissingSecret: Please define a secret`

**Fix:**

1. Add `AUTH_SECRET` to `.env.local` (recommended), **or**
2. Rely on the test fallback in [`tests/playwright-env.ts`](./tests/playwright-env.ts) (local/CI only — not for production).

You still need **`POSTGRES_URL`** in `.env.local` for guest login during tests.

```bash
pnpm test
```

**GitHub Actions:** Add repository secrets `AUTH_SECRET` and `POSTGRES_URL` (and optionally `GOOGLE_GENERATIVE_AI_API_KEY`). If `AUTH_SECRET` is missing in CI, the workflow applies a test-only fallback.

---

## Project structure

```
app/
  (auth)/          # Login, register, guest
  (chat)/          # Chat + study APIs
components/
  chat/            # Chat shell (from starter, customized)
  study/           # Study workspace (our code)
lib/
  study/           # Types, PDF parsing (our code)
  ai/              # Models, prompts
  db/              # Drizzle schema & queries
```

---

## Team workflow

1. Branch from `main` or `dev`: `feat/member-N-description`
2. Merge order: foundation → quiz/emergency UI → chat/demo polish
3. Details: [`.cursor/plans/aemrosprint_mvp_b1934e2d.plan.md`](.cursor/plans/aemrosprint_mvp_b1934e2d.plan.md)

---

## Demo script (2 minutes)

1. Open app — student pain: exam soon, no plan
2. Upload syllabus PDF or paste text → **Analyze Material**
3. Show summary → set exam date → **Generate Roadmap**
4. (When built) Quiz + **PANIC MODE**
5. Ask chat: “What should I study first tonight?”

---

## License

See [LICENSE](./LICENSE). Third-party starter code remains under its original license; our additions are part of this hackathon submission.
