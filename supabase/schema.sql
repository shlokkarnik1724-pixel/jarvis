-- Tactix AI — Supabase schema (run in SQL Editor)
-- Multi-tenant company brain with RLS by organization_id

create extension if not exists "pgcrypto";

-- Profiles mirror auth.users
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  industry text default 'SaaS',
  team_size text default '11-50',
  primary_use_case text default 'Support Ops',
  invite_code text unique not null,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.memberships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  role text not null check (role in ('admin', 'member')) default 'member',
  created_at timestamptz not null default now(),
  unique (user_id, organization_id)
);

create table if not exists public.connectors (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  provider text not null,
  name text not null,
  status text not null default 'disconnected'
    check (status in ('connected', 'syncing', 'disconnected', 'coming_soon')),
  meta jsonb default '{}'::jsonb,
  last_synced_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  connector_id uuid references public.connectors(id) on delete set null,
  raw_text text not null,
  source_ref text,
  created_at timestamptz not null default now()
);

create table if not exists public.skills (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  conversation_id uuid references public.conversations(id) on delete set null,
  title text not null,
  json_schema jsonb not null,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  confidence numeric,
  category text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.skill_versions (
  id uuid primary key default gen_random_uuid(),
  skill_id uuid not null references public.skills(id) on delete cascade,
  json_schema jsonb not null,
  edited_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.brain_messages (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid references auth.users(id),
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  citations jsonb default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.routing_items (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  title text not null,
  summary text,
  suggested_owner text,
  channel text,
  priority text default 'normal',
  status text default 'open',
  source_ref text,
  created_at timestamptz not null default now()
);

create table if not exists public.activities (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  message text not null,
  created_at timestamptz not null default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = coalesce(excluded.full_name, public.profiles.full_name),
    avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Helper: orgs the current user belongs to
create or replace function public.user_org_ids()
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select organization_id from public.memberships where user_id = auth.uid();
$$;

alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.memberships enable row level security;
alter table public.connectors enable row level security;
alter table public.conversations enable row level security;
alter table public.skills enable row level security;
alter table public.skill_versions enable row level security;
alter table public.brain_messages enable row level security;
alter table public.routing_items enable row level security;
alter table public.activities enable row level security;

create policy "profiles read own" on public.profiles for select using (id = auth.uid());
create policy "profiles update own" on public.profiles for update using (id = auth.uid());

create policy "orgs read member" on public.organizations for select using (id in (select public.user_org_ids()));
create policy "orgs insert auth" on public.organizations for insert with check (auth.uid() = created_by);
create policy "orgs update admin" on public.organizations for update using (
  id in (select organization_id from public.memberships where user_id = auth.uid() and role = 'admin')
);

create policy "memberships read org" on public.memberships for select using (organization_id in (select public.user_org_ids()) or user_id = auth.uid());
create policy "memberships insert" on public.memberships for insert with check (user_id = auth.uid() or organization_id in (
  select organization_id from public.memberships where user_id = auth.uid() and role = 'admin'
));

create policy "connectors member" on public.connectors for all using (organization_id in (select public.user_org_ids())) with check (organization_id in (select public.user_org_ids()));
create policy "conversations member" on public.conversations for all using (organization_id in (select public.user_org_ids())) with check (organization_id in (select public.user_org_ids()));
create policy "skills member" on public.skills for all using (organization_id in (select public.user_org_ids())) with check (organization_id in (select public.user_org_ids()));
create policy "skill_versions member" on public.skill_versions for all using (
  skill_id in (select id from public.skills where organization_id in (select public.user_org_ids()))
) with check (
  skill_id in (select id from public.skills where organization_id in (select public.user_org_ids()))
);
create policy "brain member" on public.brain_messages for all using (organization_id in (select public.user_org_ids())) with check (organization_id in (select public.user_org_ids()));
create policy "routing member" on public.routing_items for all using (organization_id in (select public.user_org_ids())) with check (organization_id in (select public.user_org_ids()));
create policy "activities member" on public.activities for all using (organization_id in (select public.user_org_ids())) with check (organization_id in (select public.user_org_ids()));
