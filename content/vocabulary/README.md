# Vocabulary PDFs (Learn German)

This folder is the **permanent source** for all vocabulary quizzes. Place exactly 4 PDFs here, one per CEFR level:

| File      | Level |
|-----------|--------|
| `A1.pdf`  | A1    |
| `A2.pdf`  | A2    |
| `B1.pdf`  | B1    |
| `B2.pdf`  | B2    |

- Each PDF should contain the vocabulary list (or word list) for that level.

## How vocabulary is populated

**At deploy time (build):** The build runs `npm run sync-vocabulary`, which reads these 4 PDFs, extracts words, writes them to the database, and **translates** them (English + display form) using OpenAI. So the database is fully populated on each deploy.

- **Required:** `DIRECT_DATABASE_URL` or `DATABASE_URL` in the build environment (e.g. Vercel Build env vars).
- **For translation:** Set `OPENAI_API_KEY` in the build environment. If it is not set, words are synced but not translated (quizzes need translated words; use **Translate missing** in the app after deploy, or set the key and redeploy). Build may take several minutes while translation runs.

**From the app (fallback):**

- **Sync from PDFs** re-syncs words from the PDFs into the DB only (no translation; avoids timeouts). Use after adding or changing PDFs and redeploying, or if you need to refresh words without a full rebuild.
- **Translate missing** runs translation for words that have no English yet (one-off backfill).

**From the command line:** Run `npm run sync-vocabulary` locally (with `DIRECT_DATABASE_URL` or `DATABASE_URL` and optional `OPENAI_API_KEY` in `.env` / `.env.local`) to sync and translate without deploying.

Do not commit very large PDFs if your repo has size limits; otherwise committing them is fine so the source stays in version control.
