-- OmniAgent OS upgrade — run after base supabase/schema.sql
alter table public.skills add column if not exists valid_from timestamptz default now();
alter table public.skills add column if not exists valid_to timestamptz;
alter table public.skills add column if not exists superseded_by uuid references public.skills(id);

create table if not exists public.ingestion_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  source text not null,
  channel text,
  summary text,
  raw_snippet text,
  decision_detected boolean default false,
  skill_id uuid references public.skills(id),
  created_at timestamptz not null default now()
);

alter table public.ingestion_events enable row level security;
drop policy if exists "ingestion member" on public.ingestion_events;
create policy "ingestion member" on public.ingestion_events for all using (organization_id in (select public.user_org_ids())) with check (organization_id in (select public.user_org_ids()));
