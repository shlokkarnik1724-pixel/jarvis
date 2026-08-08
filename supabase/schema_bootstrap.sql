-- Circle Web Portal — production bootstrap policies
-- Run AFTER supabase/schema.sql

-- Allow authenticated users to create a circle
create policy circles_authenticated_insert on public.circles
  for insert to authenticated
  with check (true);

-- Owners/admins can update circle metadata
create policy circles_member_update on public.circles
  for update using (public.is_circle_member(id))
  with check (public.is_circle_member(id));

-- Look up a circle by invite code without already being a member
create or replace function public.get_circle_by_invite(code text)
returns table (id uuid, name text, invite_code text)
language sql
stable
security definer
set search_path = public
as $$
  select c.id, c.name, c.invite_code
  from public.circles c
  where lower(c.invite_code) = lower(trim(code))
  limit 1;
$$;

revoke all on function public.get_circle_by_invite(text) from public;
grant execute on function public.get_circle_by_invite(text) to authenticated;

-- Allow a user to insert themselves into a circle (join flow validates invite in app)
create policy circle_members_self_insert on public.circle_members
  for insert to authenticated
  with check (user_id = auth.uid());

-- Photos: members can insert their own uploads
create policy photos_member_insert on public.photos
  for insert to authenticated
  with check (
    uploader_id = auth.uid()
    and public.is_circle_member(circle_id)
  );

-- Storage policies for private vault bucket
create policy vault_member_read on storage.objects
  for select to authenticated
  using (
    bucket_id = 'vault'
    and public.is_circle_member((storage.foldername(name))[1]::uuid)
  );

create policy vault_member_insert on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'vault'
    and public.is_circle_member((storage.foldername(name))[1]::uuid)
  );
