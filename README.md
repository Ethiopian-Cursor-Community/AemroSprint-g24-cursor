# Second Brain

**AI Student Second Brain** — an AI-powered academic survival assistant built for the Cursor Hackathon (48-hour sprint).

Turn syllabi and lecture notes into summaries, study roadmaps, quizzes, and last-minute exam cram plans — then ask follow-up questions in chat grounded in your material.

## What it does (MVP)

| Feature | Status |
|---------|--------|
| PDF / text upload & parsing | Planned |
| AI study summary (topics, deadlines, objectives) | Planned |
| Day-by-day study roadmap | Planned |
| Quiz / flashcard generator | Planned |
| Emergency Exam Mode ("panic" cram guide) | Planned |
| Chat grounded in uploaded material | Planned |
| Try Demo (offline fallback data) | Planned |

See [`AI Student SecondBrain HackathonPlan.docx`](./AI%20Student%20SecondBrain%20HackathonPlan.docx) for the full execution plan and team prompts.

## Tech stack

- **Framework:** Next.js App Router (from [Vercel AI Chatbot](https://github.com/vercel/ai-chatbot) starter)
- **AI:** Vercel AI SDK + AI Gateway
- **UI:** shadcn/ui, Tailwind CSS
- **Auth:** Auth.js (guest + email)
- **Database:** Postgres (Drizzle) — chat history
- **Storage:** Vercel Blob (images); study PDFs via dedicated API (planned)

## Getting started

### Prerequisites

- Node.js 18+
- pnpm
- Postgres URL, AI Gateway key, Auth secret (see [`.env.example`](.env.example))

### Setup

```bash
pnpm install
cp .env.example .env.local
# Fill in POSTGRES_URL, AI_GATEWAY_API_KEY, AUTH_SECRET, etc.

pnpm db:migrate
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables

| Variable | Purpose |
|----------|---------|
| `AUTH_SECRET` | Session encryption |
| `AI_GATEWAY_API_KEY` | AI models (non-Vercel deploys) |
| `POSTGRES_URL` | Chat & user persistence |
| `BLOB_READ_WRITE_TOKEN` | Image uploads in chat |
| `REDIS_URL` | Optional — resumable streams |

## Project structure

```
app/
  (auth)/          # Login, register, guest
  (chat)/          # Main app — chat API, history, study APIs (planned)
components/
  chat/            # Chat shell, messages, sidebar
  study/           # Study workspace UI (planned)
lib/
  ai/              # Models, prompts, tools
  db/              # Drizzle schema & queries
```

## Team workflow

1. Branch from `dev`: `feat/member-N-description`
2. Merge order: foundation → quiz/emergency UI → chat/demo polish
3. Details: [`.cursor/plans/second_brain_mvp_b1934e2d.plan.md`](.cursor/plans/second_brain_mvp_b1934e2d.plan.md)

## Demo script (2 minutes)

1. Open app — student pain: exam soon, no plan
2. Upload syllabus PDF (or **Try Demo**)
3. Show summary → generate roadmap
4. Run quiz (flip 2–3 cards)
5. Hit **PANIC MODE** for cram priorities
6. Ask chat: "What should I study first tonight?"

## License

See [LICENSE](./LICENSE). Starter components retain their original open-source terms.
