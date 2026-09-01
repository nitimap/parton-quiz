create extension if not exists pgcrypto;
create table if not exists public.quizzes (
  id uuid primary key default gen_random_uuid(), title text not null,
  subject text, description text, source_filename text,
  questions jsonb not null check (jsonb_typeof(questions) = 'array' and jsonb_array_length(questions) > 0),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index if not exists quizzes_created_at_idx on public.quizzes (created_at desc);
alter table public.quizzes enable row level security;
drop policy if exists "Public can read quizzes" on public.quizzes;
create policy "Public can read quizzes" on public.quizzes for select to anon using (true);
-- No anonymous insert/update/delete policies. Management uses the server-only service role.

create table if not exists public.assignments (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  label text not null default 'Quiz assignment',
  token uuid not null default gen_random_uuid() unique,
  created_at timestamptz not null default now()
);
create index if not exists assignments_quiz_id_idx on public.assignments (quiz_id);
create table if not exists public.attempts (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.assignments(id) on delete cascade,
  status text not null default 'in_progress' check (status in ('in_progress','completed')),
  mode text check (mode in ('practice','test')),
  question_count integer,
  correct_count integer,
  score_percent integer,
  answers jsonb,
  started_at timestamptz not null default now(),
  completed_at timestamptz
);
create index if not exists attempts_assignment_id_idx on public.attempts (assignment_id, started_at desc);
alter table public.assignments enable row level security;
alter table public.attempts enable row level security;
-- Assignment and attempt access goes through validated server routes only.
