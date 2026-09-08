-- Run this once in Supabase: SQL Editor -> New query -> Run.
create table public.food_diary_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  state jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.food_diary_state enable row level security;
revoke all on table public.food_diary_state from anon, authenticated;
grant select, insert, update, delete on table public.food_diary_state to authenticated;

create policy "Read own diary" on public.food_diary_state for select to authenticated
using ((select auth.uid()) = user_id);
create policy "Create own diary" on public.food_diary_state for insert to authenticated
with check ((select auth.uid()) = user_id);
create policy "Update own diary" on public.food_diary_state for update to authenticated
using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Delete own diary" on public.food_diary_state for delete to authenticated
using ((select auth.uid()) = user_id);
