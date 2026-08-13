-- hoshii schema — run in Supabase SQL editor
-- Two tables: library entries + journal reflections. Both are user-scoped via RLS.

-- ── library entries ───────────────────────────────────────────────
create table if not exists library_entries (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users (id) on delete cascade,
  media_id     integer not null,          -- AniList id
  media_type   text not null check (media_type in ('ANIME','MANGA')),
  title        text not null,             -- cached display title
  cover_image  text,
  cover_color  text,
  total_units  integer,
  status       text not null check (status in ('CURRENT','COMPLETED','PLANNING','PAUSED','DROPPED')),
  progress     integer not null default 0,
  score        integer check (score between 1 and 10),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (user_id, media_id, media_type)  -- one library row per title per user
);

-- ── journal entries ───────────────────────────────────────────────
create table if not exists journal_entries (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users (id) on delete cascade,
  media_id     integer not null,
  media_type   text not null check (media_type in ('ANIME','MANGA')),
  title        text not null,
  mood         text not null,
  at_unit      integer,                   -- episode/chapter this reflects on
  note         text not null default '',
  created_at   timestamptz not null default now()
);

create index if not exists library_user_idx  on library_entries (user_id, updated_at desc);
create index if not exists journal_user_idx   on journal_entries (user_id, created_at desc);
create index if not exists journal_media_idx  on journal_entries (user_id, media_id);

-- ── keep updated_at fresh on library rows ─────────────────────────
create or replace function touch_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists library_touch on library_entries;
create trigger library_touch before update on library_entries
  for each row execute function touch_updated_at();

-- ── row level security ────────────────────────────────────────────
alter table library_entries enable row level security;
alter table journal_entries enable row level security;

create policy "own library" on library_entries
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own journal" on journal_entries
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
