-- Parking Lot message store for ariana's site.
-- Paste all of this into Supabase > SQL Editor > New query, then press Run.

create table if not exists public.lot_messages (
  id           bigint generated always as identity primary key,
  created_at   timestamptz not null default now(),
  name         text not null default '' check (char_length(name) <= 40),
  body         text not null check (char_length(body) between 1 and 600),
  author_token text not null check (char_length(author_token) between 16 and 64)
);

alter table public.lot_messages enable row level security;

-- Visitors can read messages, but never the private author_token column.
revoke all on public.lot_messages from anon, authenticated;
grant select (id, created_at, name, body) on public.lot_messages to anon, authenticated;
grant insert (name, body, author_token) on public.lot_messages to anon, authenticated;

drop policy if exists "read messages" on public.lot_messages;
create policy "read messages" on public.lot_messages for select to anon, authenticated using (true);

drop policy if exists "post messages" on public.lot_messages;
create policy "post messages" on public.lot_messages for insert to anon, authenticated with check (true);

-- A visitor can delete only the messages posted from their own browser.
-- (Ariana deletes anything from Supabase > Table Editor > lot_messages.)
create or replace function public.delete_own_message(p_id bigint, p_token text)
returns integer
language sql
security definer
set search_path = public
as $$
  with d as (delete from public.lot_messages where id = p_id and author_token = p_token returning 1)
  select count(*)::int from d;
$$;

revoke all on function public.delete_own_message(bigint, text) from public;
grant execute on function public.delete_own_message(bigint, text) to anon, authenticated;
