-- Circle Web Portal schema + RLS
-- Run in Supabase SQL editor after enabling Google Auth.

create extension if not exists "pgcrypto";

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  name text not null,
  avatar_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.circles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  invite_code text unique not null default encode(gen_random_bytes(6), 'hex'),
  created_at timestamptz not null default now()
);

create table if not exists public.circle_members (
  circle_id uuid not null references public.circles(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  nickname text,
  role text not null default 'member' check (role in ('owner', 'admin', 'member')),
  joined_at timestamptz not null default now(),
  primary key (circle_id, user_id)
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  circle_id uuid not null references public.circles(id) on delete cascade,
  title text not null,
  date timestamptz not null,
  location text,
  latitude double precision,
  longitude double precision,
  tags text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.event_checkins (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  checked_in_at timestamptz not null default now(),
  unique (event_id, user_id)
);

create table if not exists public.shopping_list_items (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  item_name text not null,
  claimer_id uuid references public.users(id) on delete set null,
  quantity text,
  created_at timestamptz not null default now()
);

create table if not exists public.photos (
  id uuid primary key default gen_random_uuid(),
  circle_id uuid not null references public.circles(id) on delete cascade,
  uploader_id uuid not null references public.users(id) on delete cascade,
  storage_path text not null,
  encrypted_url text,
  iv text,
  mime_type text not null default 'image/jpeg',
  caption_enc text,
  created_at timestamptz not null default now()
);

create table if not exists public.leaderboard (
  id uuid primary key default gen_random_uuid(),
  circle_id uuid not null references public.circles(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  score_type text not null check (score_type in ('game_win', 'event_attendance', 'custom', 'roast_toast')),
  points int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.tab_tracker (
  id uuid primary key default gen_random_uuid(),
  circle_id uuid not null references public.circles(id) on delete cascade,
  payer_id uuid not null references public.users(id) on delete cascade,
  amount numeric(12,2) not null,
  description text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.game_sessions (
  id uuid primary key default gen_random_uuid(),
  circle_id uuid not null references public.circles(id) on delete cascade,
  game_type text not null check (game_type in ('mafia', 'trivia', 'prediction_league', 'myth_buster')),
  state jsonb not null default '{}'::jsonb,
  status text not null default 'lobby' check (status in ('lobby', 'active', 'completed', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.roast_toasts (
  id uuid primary key default gen_random_uuid(),
  circle_id uuid not null references public.circles(id) on delete cascade,
  kind text not null check (kind in ('roast', 'toast')),
  encrypted_body text not null,
  iv text not null,
  vote_score int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.roast_toast_votes (
  id uuid primary key default gen_random_uuid(),
  roast_toast_id uuid not null references public.roast_toasts(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  value int not null check (value in (-1, 1)),
  created_at timestamptz not null default now(),
  unique (roast_toast_id, user_id)
);

create table if not exists public.nickname_history (
  id uuid primary key default gen_random_uuid(),
  circle_id uuid not null references public.circles(id) on delete cascade,
  target_id uuid not null,
  editor_id uuid not null references public.users(id) on delete cascade,
  nickname text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_events_circle_date on public.events (circle_id, date);
create index if not exists idx_photos_circle_uploader on public.photos (circle_id, uploader_id);
create index if not exists idx_leaderboard_circle_type on public.leaderboard (circle_id, score_type);
create index if not exists idx_tabs_circle on public.tab_tracker (circle_id);
create index if not exists idx_games_circle_status on public.game_sessions (circle_id, status);

create or replace function public.is_circle_member(target_circle uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.circle_members cm
    where cm.circle_id = target_circle
      and cm.user_id = auth.uid()
  );
$$;

alter table public.users enable row level security;
alter table public.circles enable row level security;
alter table public.circle_members enable row level security;
alter table public.events enable row level security;
alter table public.event_checkins enable row level security;
alter table public.shopping_list_items enable row level security;
alter table public.photos enable row level security;
alter table public.leaderboard enable row level security;
alter table public.tab_tracker enable row level security;
alter table public.game_sessions enable row level security;
alter table public.roast_toasts enable row level security;
alter table public.roast_toast_votes enable row level security;
alter table public.nickname_history enable row level security;

create policy users_self_read on public.users
  for select using (id = auth.uid() or exists (
    select 1 from public.circle_members me
    join public.circle_members them on them.circle_id = me.circle_id
    where me.user_id = auth.uid() and them.user_id = users.id
  ));

create policy users_self_upsert on public.users
  for all using (id = auth.uid()) with check (id = auth.uid());

create policy circles_member_read on public.circles
  for select using (public.is_circle_member(id));

create policy circle_members_read on public.circle_members
  for select using (public.is_circle_member(circle_id));

create policy circle_members_write on public.circle_members
  for all using (public.is_circle_member(circle_id))
  with check (public.is_circle_member(circle_id));

create policy events_member_all on public.events
  for all using (public.is_circle_member(circle_id))
  with check (public.is_circle_member(circle_id));

create policy checkins_member_all on public.event_checkins
  for all using (
    exists (
      select 1 from public.events e
      where e.id = event_id and public.is_circle_member(e.circle_id)
    )
  )
  with check (
    exists (
      select 1 from public.events e
      where e.id = event_id and public.is_circle_member(e.circle_id)
    )
  );

create policy shopping_member_all on public.shopping_list_items
  for all using (
    exists (
      select 1 from public.events e
      where e.id = event_id and public.is_circle_member(e.circle_id)
    )
  )
  with check (
    exists (
      select 1 from public.events e
      where e.id = event_id and public.is_circle_member(e.circle_id)
    )
  );

create policy photos_member_all on public.photos
  for all using (public.is_circle_member(circle_id))
  with check (public.is_circle_member(circle_id));

create policy leaderboard_member_all on public.leaderboard
  for all using (public.is_circle_member(circle_id))
  with check (public.is_circle_member(circle_id));

create policy tabs_member_all on public.tab_tracker
  for all using (public.is_circle_member(circle_id))
  with check (public.is_circle_member(circle_id));

create policy games_member_all on public.game_sessions
  for all using (public.is_circle_member(circle_id))
  with check (public.is_circle_member(circle_id));

create policy roast_member_all on public.roast_toasts
  for all using (public.is_circle_member(circle_id))
  with check (public.is_circle_member(circle_id));

create policy roast_votes_member_all on public.roast_toast_votes
  for all using (
    exists (
      select 1 from public.roast_toasts rt
      where rt.id = roast_toast_id and public.is_circle_member(rt.circle_id)
    )
  )
  with check (
    exists (
      select 1 from public.roast_toasts rt
      where rt.id = roast_toast_id and public.is_circle_member(rt.circle_id)
    )
  );

create policy nickname_history_member_all on public.nickname_history
  for all using (public.is_circle_member(circle_id))
  with check (public.is_circle_member(circle_id));

-- Private vault bucket (no public read). Stream only via /api/vault/stream/[id]
insert into storage.buckets (id, name, public)
values ('vault', 'vault', false)
on conflict (id) do update set public = false;
