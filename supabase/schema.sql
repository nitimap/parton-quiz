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
