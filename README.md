# UniBuddy

A **German Academic Success Tool** for international students in Germany: practice K-aus-N style exams from your lecture PDFs and decode official letters (Beamtendeutsch) into plain English.

## Phase 1 (MVP) features

- **Exam pilot**: Upload a lecture PDF → AI generates 10 MCQs (single-choice and K-aus-N) → take a timed mock exam with German 1.0–5.0 grading.
- **Letter scanner**: Upload a photo or PDF of a letter from the University or Ausländerbehörde → get an English summary, “action required”, and a short tone check.

Dashboard requires sign-in. **Sign in with Google** (single sign-on); all signed-in users are stored in the database so the owner can build an email list.

## Tech stack

- **Next.js 14** (App Router), **Tailwind**, **Shadcn/UI**, **Framer Motion**, **Zustand**
- **NextAuth** with **Google OAuth** and **Prisma** (SQLite) for auth and user storage
- **OpenAI (GPT-4o)** for question generation and letter analysis
- **pdfjs-dist** (client) and **pdf-parse** (server) for PDF text extraction

## Setup

1. **Clone or open the project**
   ```bash
   cd unibuddy
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   - Copy `.env.example` to `.env.local` (or use `.env`).
   - Set **OpenAI**: `OPENAI_API_KEY=sk-your-key-here`
   - Set **database**: `DATABASE_URL="file:./prisma/dev.db"` (SQLite; already set if you use `.env` from example)
   - Set **NextAuth**: `NEXTAUTH_SECRET` (random string, e.g. `openssl rand -base64 32`), `NEXTAUTH_URL=http://localhost:3000`
   - Set **Google OAuth**: create a project in [Google Cloud Console](https://console.cloud.google.com/apis/credentials) → APIs & Services → Credentials → Create OAuth 2.0 Client ID (Web application). Add redirect URI `http://localhost:3000/api/auth/callback/google`. Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.
   - Set **owner email** (for the users/email list page): `OWNER_EMAIL=your@email.com` and `NEXT_PUBLIC_OWNER_EMAIL=your@email.com`
   - Run migrations: `npx prisma migrate dev`

4. **Run the app**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000). You’ll be redirected to **Sign in with Google**; after signing in you can use **Dashboard** → **My Modules** or **Admin Inbox**.

## Usage

- **Sign in**: Only the dashboard and below require sign-in; everyone signs in with Google. As the **owner** (email set in `OWNER_EMAIL`), you’ll see **Users** in the sidebar: a table of all signed-in users and an **Export CSV** button to build your email list.
- **My Modules**: “Add module” → upload a PDF and name the module → questions are generated → open the module and start a **mock exam (strict)** or **practice mode**.
- **Admin Inbox**: Upload a PDF or image of a German official letter → get summary, action required (if any), and tone check.

## Project structure

- `src/app/dashboard/` – Dashboard layout, modules list, new module, module detail, exam UI, letter scanner
- `src/app/api/` – `generate-questions` (PDF text → MCQs), `scan-letter` (image/PDF → summary)
- `src/lib/` – Store (Zustand), German grade mapping, PDF client (browser), utils
- `src/components/` – UI (Shadcn) and app sidebar

## Build

```bash
npm run build
npm start
```

Requires `OPENAI_API_KEY` at runtime for the API routes; build succeeds without it.
