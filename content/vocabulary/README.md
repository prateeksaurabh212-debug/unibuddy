# Vocabulary PDFs (Learn German)

This folder is the **permanent source** for all vocabulary quizzes. Place exactly 4 PDFs here, one per CEFR level:

| File      | Level |
|-----------|--------|
| `A1.pdf`  | A1    |
| `A2.pdf`  | A2    |
| `B1.pdf`  | B1    |
| `B2.pdf`  | B2    |

- Each PDF should contain the vocabulary list (or word list) for that level.
- After adding or replacing a PDF, sync vocabulary into the database either:
  - **From the app:** Open **Learn German** in the dashboard and click **Sync from PDFs** (if the 4 PDFs are in this folder on the server).
  - **From the command line** (when using direct Postgres and `npm run sync-vocabulary` works):
    ```bash
    npm run sync-vocabulary
    ```
  This extracts text from each PDF, splits it into words, and updates the database so quizzes use the new vocabulary.

Do not commit very large PDFs if your repo has size limits; otherwise committing them is fine so the source stays in version control.
