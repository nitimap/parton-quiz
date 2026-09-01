# Family Quiz Practice

A small Next.js application for turning printable `.docx` worksheets into reusable online quizzes. A parent uploads and previews a worksheet behind a server-validated PIN; a child can use any device to practice saved quizzes without an account.

## Local setup

1. Install Node.js 20.9 or newer.
2. Run `npm install`.
3. Copy `.env.example` to `.env.local` and fill in all four variables.
4. In Supabase, open **SQL Editor**, paste `supabase/schema.sql`, and run it.
5. Run `npm run dev`, then open `http://localhost:3000`.

Without Supabase variables, the student library intentionally shows a two-question sample quiz. Saving and managing cloud quizzes requires Supabase.

## Supabase setup and security

Create a Supabase project and copy the project URL and anon key from **Project Settings → API**. Copy the service-role key only into `.env.local` and Vercel; never put it in browser code or share it. Run `supabase/schema.sql` once.

The schema uses one JSONB-backed `quizzes` table, which is the simplest reliable fit for this family application. Row Level Security allows anonymous `SELECT` only. There are no anonymous write policies. Create, update, and delete requests run in server route handlers only after the parent session cookie is verified, using the server-only service-role key.

## Environment variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
PARENT_PIN=choose-a-long-private-pin
```

Choose a PIN that is not easily guessed (8+ digits or a memorable passphrase). It is compared server-side and never shipped to browser JavaScript. Successful access creates an HTTP-only, same-site cookie lasting eight hours. Five failed attempts from the same address trigger a five-minute lockout. `.env.local` is ignored by Git.

## Worksheet format

Questions may be Thai or English. Use four choices, then a `เฉลย` or `Answer Key` heading:

```text
1. รายได้หลักของรัฐบาลได้มาจากที่ใด
ก. ดอกเบี้ยเงินฝาก
ข. กำไรจากการขายสินค้า
ค. การทำงาน
ง. ภาษี

2. Which planet is known as the Red Planet?
A) Venus
B) Mars
C) Jupiter
D) Mercury

เฉลย
1. ง
2. B
```

The parser accepts `1. Question` and `1.Question`, choices using `.` or `)`, Thai `ก ข ค ง`, and English `A B C D`. It rejects missing choices, missing answers, duplicate question numbers, and answer keys that point to missing questions. The original document is parsed in memory and is not stored.

## Routes

- `/` — public quiz library
- `/quiz/[id]` — setup, randomized practice/test session, results, and mistake practice
- `/manage` — PIN-gated upload, parsing preview, save, preview, and delete

## Subjects and assignment tracking

Parents can choose a consistent subject category for every quiz. The public library displays subject filters automatically. In `/manage`, **Create Assignment Link** creates a unique share link; opening that link records an in-progress attempt, and finishing the quiz records the server-verified score. The parent activity section shows not started, in progress, completed, the latest score, and prior attempts. Direct non-assignment quiz links remain playable without creating tracking records.

After updating an existing installation to this version, run the latest `supabase/schema.sql` again in Supabase SQL Editor. It safely keeps the existing `quizzes` table and adds the new `assignments` and `attempts` tables.

## Quality checks

Run `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build`.

## Deploy to Vercel

1. Push this repository to GitHub, GitLab, or Bitbucket.
2. Import it at Vercel and keep the detected Next.js settings.
3. Add all four environment variables under **Project Settings → Environment Variables** for Production (and Preview if desired).
4. Deploy. The application does not use filesystem persistence; saved quizzes remain in Supabase and are available across devices.

## Test the first upload

Open `/manage`, enter `PARENT_PIN`, choose a `.docx`, review the parsing summary and every previewed answer, enter a title, and select **Save Quiz**. Open the quiz from the existing list or return to `/`, start it in Practice Mode, finish it, and try **Practice My Mistakes**. Open the deployed URL on another device to confirm the same quiz appears.
