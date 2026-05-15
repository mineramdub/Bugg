-- ============================================================
-- BUGG — schema v1
-- Anonymous device-based auth, daily C bug challenge
-- Already applied to project cyfzahgqjphvzltxhgbk
-- ============================================================

-- ── Devices: one row per anonymous user, identified by client UUID ──
create table public.devices (
  id          uuid primary key default gen_random_uuid(),
  device_id   text unique not null,                 -- client-generated UUID stored in localStorage
  created_at  timestamptz not null default now(),
  last_seen   timestamptz not null default now(),
  -- denormalized stats — kept up to date by the submit endpoint
  streak      int  not null default 0,              -- consecutive successful days
  best_streak int  not null default 0,
  total_xp    int  not null default 0,
  bugs_solved int  not null default 0,
  last_solved_date date                             -- date (UTC) of last correct submission
);

create index devices_device_id_idx on public.devices(device_id);

-- ── Bugs: catalogue, ordered by difficulty progression ──
create table public.bugs (
  id           int primary key,                     -- stable id matches frontend numbering
  day_label    text not null,                       -- "Jour 1", "Jour 2", ...
  difficulty   text not null,                       -- "Facile" | "Moyen" | "Difficile"
  streak_level int  not null,                       -- which streak this bug unlocks (1-indexed)
  title        text not null,
  description  text not null,
  code         text[] not null,                     -- array of code lines
  bug_line     int  not null,                       -- 0-indexed line containing the bug
  answer       text not null,                       -- canonical fix (shown on result screen)
  accept       text[] not null,                     -- regex patterns (without delimiters / flags)
  hint         text not null,
  explanation  text not null,
  xp           int  not null,
  created_at   timestamptz not null default now()
);

create index bugs_streak_level_idx on public.bugs(streak_level);

-- ── Submissions: every attempt, correct or not ──
create table public.submissions (
  id          uuid primary key default gen_random_uuid(),
  device_pk   uuid not null references public.devices(id) on delete cascade,
  bug_id      int  not null references public.bugs(id),
  draft       text not null,                        -- what the user typed
  correct     boolean not null,
  xp_awarded  int  not null default 0,
  created_at  timestamptz not null default now()
);

create index submissions_device_idx     on public.submissions(device_pk, created_at desc);
create index submissions_device_bug_idx on public.submissions(device_pk, bug_id);

-- ============================================================
-- Row Level Security
-- ============================================================
-- All access goes through the Edge Function using the service role key
-- (which bypasses RLS). RLS is enabled with no policies so direct anon
-- access via PostgREST is denied.
alter table public.devices     enable row level security;
alter table public.bugs        enable row level security;
alter table public.submissions enable row level security;
