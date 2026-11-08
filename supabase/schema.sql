-- Run after enabling Supabase Auth. Policies are dropped first so this file is rerunnable.
create table if not exists public.analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  analysis_type text not null check (analysis_type in ('Regression','Hypothesis testing')),
  summary text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.analyses enable row level security;

-- Newer Supabase projects do NOT expose new public tables to the Data API automatically,
-- so the signed-in role needs explicit privileges (RLS policies below still limit rows to the owner).
grant usage on schema public to authenticated;
grant select, insert, update, delete on table public.analyses to authenticated;

drop policy if exists "Users can read own analyses" on public.analyses;
drop policy if exists "Users can insert own analyses" on public.analyses;
drop policy if exists "Users can update own analyses" on public.analyses;
drop policy if exists "Users can delete own analyses" on public.analyses;

create policy "Users can read own analyses" on public.analyses
  for select using (auth.uid() = user_id);
create policy "Users can insert own analyses" on public.analyses
  for insert with check (auth.uid() = user_id);
create policy "Users can update own analyses" on public.analyses
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete own analyses" on public.analyses
  for delete using (auth.uid() = user_id);
