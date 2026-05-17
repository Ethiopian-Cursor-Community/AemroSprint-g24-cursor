# 🧠 AemroSprint

**AemroSprint** is an AI-powered academic survival assistant built for the **Cursor Hackathon**. Designed specifically for students facing syllabus anxiety or crunch-time cramming, AemroSprint takes course syllabi, lecture notes, or text outlines and transforms them into comprehensive study summaries and tailored, day-by-day study roadmaps leading up to your exam date.

---

**[Live Demo] ([https://aemro-sprint-g24-cursor.vercel.app/])**

## 🌟 Key Features

- **📂 Multi-Format Material Parser:** Drag and drop syllabus PDFs, paste raw course outlines, or upload lecture notes (supporting PDF and text files up to 5MB).
- **📝 Intelligent Study Summaries:** Automatically extracts core learning objectives, key topics, major milestones, and important dates using Cursor SDK structured generation.
- **📅 Custom Study Roadmaps:** Generates a structured, day-by-day calendar countdown leading up to your exam, customized by your daily hour commitment.
- **💬 Material-Grounded Study Chat:** (Integration in progress) A conversation panel powered by Cursor SDK where you can ask follow-up questions directly grounded in your uploaded study material.
- **🚨 Emergency Panic Cram Mode:** (Integration in progress) A high-intensity mode designed to maximize study efficiency during the final 24-48 hours before an exam.

---

## 🛠️ Starter Template & Hackathon Attribution

To focus our engineering efforts on student-centric value, this project was developed using the open-source **[Vercel AI Chatbot](https://github.com/vercel/ai-chatbot)** starter template as our base infrastructure. 

### Original Template Assets Retained:
- **Core Infrastructure:** User authentication (Auth.js), sidebar navigation, session-based chat history, and basic streaming chat UI.
- **Database Architecture:** Basic PostgreSQL database schema (Drizzle ORM) for users and chat.
- **Component Styling:** Tailwind CSS and Radix UI primitives (`shadcn/ui`).

### What We Implemented (Our Hackathon Contribution):
We created the academic **"AemroSprint"** product layer on top of the generic chatbot structure:

| Functional Area | Upstream Starter Template | Our Custom AemroSprint Layer |
| :--- | :--- | :--- |
| **Product & UX Design** | Generic AI Chatbot shell, greeting messages, and generic demo prompts. | Fully custom **AemroSprint student workspace** branding, typography, color scheme, and copy. |
| **Core Product Flow** | Standard chat conversation and general document artifacts. | **Academic Pipeline:** Syllabus dropzone / input panel $\rightarrow$ AI summary generation $\rightarrow$ Custom calendar roadmap. |
| **Backend API Endpoints** | Standard chat endpoints, chat history, and file/image uploads. | **New Structured Study Endpoints:** `app/(chat)/api/study/upload`, `summarize`, and `roadmap` for structured JSON data parsing. |
| **Data Models & Validation** | Chat and message records only. | Strong TypeScript schemas (`lib/study/types.ts`) using **Zod** to validate study summaries, calendars, and tasks. |
| **State Management** | Local chat-specific state hooks. | Global study workspace React Context (`hooks/use-study-context.tsx`) coordinates upload state, exam parameters, and AI-generated outputs. |
| **AI System & Prompts** | General-purpose assistant prompts. | Academic tutor personality and roadmap prompt structures tuned specifically for study material analysis (`lib/ai/prompts.ts`). |

---

## 🏗️ Technology Stack

- **Framework:** [Next.js 16 (App Router)](https://nextjs.org/) + [React 19](https://react.dev/)
- **AI Integration:** [Vercel AI SDK Core](https://sdk.vercel.ai/docs) (`generateObject` for strict structured output and `streamObject` for fluid UI rendering)
- **AI Model Provider:** [Cursor SDK](https://cursor.sh/) leveraging Cursor family models:
  - `cursor-fast` (Primary fast model for general study interaction)
  - `cursor-medium` (Balanced model optimized for deep reasoning and timeline roadmaps)
  - `cursor-large` (State-of-the-art model for complex concept checks and quizzing)
  - `cursor-preview` (Experimental cutting-edge preview model)
- **Database & ORM:** [Drizzle ORM](https://orm.drizzle.team/) + [PostgreSQL](https://www.postgresql.org/) (Neon / Serverless Postgres)
- **Authentication:** [Auth.js v5 Beta (NextAuth)](https://authjs.dev/) supporting guest credentials and email login.
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) with PostCSS & CSS Variables for fluid modern aesthetics.
- **UI Components:** [Radix UI](https://www.radix-ui.com/) primitives + Lucide Icons.
- **Parser Library:** `pdf-parse` for fast text extraction from uploaded PDF course documents.
- **Tooling & DX:** [Biome](https://biomejs.dev/) for extremely fast linting & formatting, and [Playwright](https://playwright.dev/) for E2E integration testing.

---

## ⚙️ Local Setup & Development Guide

Follow these instructions to clone, configure, and run AemroSprint on your local machine.

### 📋 Prerequisites

Before starting, ensure you have the following installed:
- **Node.js** (v18.x or higher)
- **pnpm** (v10.x recommended, or npm/yarn)
- A running **PostgreSQL database** (local or serverless Neon instance)
- A **Cursor API Key** (available from your Cursor developer dashboard)

---

### 🚀 Step-by-Step Installation

#### 1. Clone the Repository
```bash
git clone https://github.com/niyatberhe/AemroSprint-cursor.git
cd AemroSprint-cursor
```

#### 2. Install Dependencies
This project uses `pnpm` for efficient package management. Run:
```bash
pnpm install
```

#### 3. Configure Environment Variables
Copy the sample environment file to create your local environment:
```bash
cp .env.example .env.local
```

Open `.env.local` in your text editor and fill in the necessary variables:

```env
# Required for Auth.js session encryption. Must be at least 32 characters.
# Generate one using: openssl rand -base64 32
AUTH_SECRET=your_auth_secret_here

# Your Cursor SDK API Key
CURSOR_API_KEY=your_cursor_api_key_here

# PostgreSQL connection string (Neon or local PostgreSQL instance)
# Example: postgresql://username:password@localhost:5432/aemrosprint
POSTGRES_URL=your_postgres_connection_string_here

# Optional: Required for chat image uploads (Vercel Blob storage)
BLOB_READ_WRITE_TOKEN=your_blob_token_if_applicable

# Optional: Redis connection string (for resumable streams)
REDIS_URL=your_redis_connection_string_if_applicable
```

#### 4. Run Database Migrations
Generate and run the PostgreSQL migrations using Drizzle to set up the users and chat tables:
```bash
# Generate the migration SQL files (if Drizzle schema is changed)
pnpm db:generate

# Execute the migrations on your database
pnpm db:migrate
```

*Note: You can also use `pnpm db:push` for local rapid prototyping to push the schema directly to the database without generating formal migration scripts.*

#### 5. Launch the Development Server
Start the local server with TurboPack enabled for fast builds:
```bash
pnpm dev
```

Open your browser and navigate to **[http://localhost:3000](http://localhost:3000)**.

---

### 🛠️ Helpful Database Commands

Drizzle ORM provides a set of helpful scripts defined in `package.json`:
- `pnpm db:studio` - Launches **Drizzle Studio**, an interactive database explorer, in your browser at `http://localhost:4983`.
- `pnpm db:check` - Validates the database schema matches your local Drizzle code.

---

## 🧪 E2E Testing with Playwright

We have an integration test suite configured using Playwright to ensure seamless user registration, logins, uploads, and AI responses.

### Prerequisites for Tests
Ensure you have `POSTGRES_URL` configured in your `.env.local` file. NextAuth also requires an `AUTH_SECRET`. If none is provided during local tests, the test suite applies a mock/testing secret defined in `tests/playwright-env.ts`.

### Run the Tests
To run all end-to-end integration tests locally, run:
```bash
pnpm test
```

To run Playwright in interactive UI mode:
```bash
pnpm exec playwright test --ui
```

---

## 📁 Project Directory Structure

```
├── app/
│   ├── (auth)/                  # User login, registration, and guest session routes
│   └── (chat)/                  # Chat interfaces and study workflow APIs
│       ├── api/
│       │   ├── chat/            # Streaming conversational chat endpoint
│       │   ├── study/           # AemroSprint API endpoints
│       │   │   ├── upload/      # PDF text parser endpoint (pdf-parse)
│       │   │   ├── summarize/   # AI study material summary route (structured JSON)
│       │   │   └── roadmap/     # Custom daily planner generation route
│       │   └── history/         # Fetching user chat history logs
│       └── page.tsx             # Main chat and study workspace container page
├── components/
│   ├── chat/                    # AI conversational chat panels (adapted from starter)
│   ├── study/                   # AemroSprint study dashboard components
│   │   ├── study-workspace.tsx  # Main dashboard structure (dropzones, calendar inputs)
│   │   ├── summary-card.tsx     # Display cards for objectives, topics, and tasks
│   │   └── roadmap-view.tsx     # Day-by-day structured timeline presentation
│   └── ui/                      # Base reusable shadcn/ui components (buttons, inputs)
├── hooks/
│   └── use-study-context.tsx    # State management hook for AemroSprint data pipeline
├── lib/
│   ├── ai/                      # System prompts, provider setups, and model profiles
│   ├── db/                      # Drizzle schemas, migrations, and database client
│   └── study/                   # Study data interfaces, Zod schemas, and mocks
└── tests/                       # Playwright E2E integration test suite
```

---

## 📄 License

This repository is distributed under the terms of the **MIT License**. Third-party starter assets inherited from the Vercel AI Chatbot remain governed by their upstream license agreements. See the [LICENSE](./LICENSE) file for full details.
