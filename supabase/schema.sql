-- Destructive reset script: clears public schema and auth.users, then recreates the app database.

drop schema if exists public cascade;

do $$
begin
  execute 'delete from auth.identities';
exception
  when undefined_table then
    null;
end
$$;

do $$
begin
  execute 'delete from auth.users';
exception
  when undefined_table then
    null;
end
$$;

create schema if not exists public;
create extension if not exists pgcrypto;

do $$ begin
  create type public.user_role as enum ('leader', 'member', 'admin');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.problem_status as enum ('available', 'locked', 'assigned', 'completed');
exception
  when duplicate_object then null;
end $$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.current_user_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    nullif(auth.jwt() -> 'user_metadata' ->> 'role', ''),
    nullif(auth.jwt() -> 'app_metadata' ->> 'role', ''),
    'member'
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_user_role() = 'admin';
$$;

create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  team_name text not null,
  leader_id uuid not null,
  team_uid text,
  team_password text,
  selected_problem_id uuid,
  room_id uuid,
  seat_number text,
  problem_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null,
  email text not null unique,
  role public.user_role not null default 'member',
  team_name text,
  team_id uuid,
  seat_id text,
  selected_problem text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.team_members (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null,
  user_id uuid,
  name text not null,
  email text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.problems (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  status public.problem_status not null default 'available',
  locked_by uuid,
  assigned_to uuid,
  locked_until timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  block text not null,
  room_number text not null,
  capacity integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  message text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null,
  github_link text,
  ppt_link text,
  submitted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.users
  add constraint users_team_id_fkey
  foreign key (team_id)
  references public.teams (id)
  on delete set null;

alter table public.teams
  add constraint teams_leader_id_fkey
  foreign key (leader_id)
  references public.users (id)
  on delete cascade;

alter table public.teams
  add constraint teams_room_id_fkey
  foreign key (room_id)
  references public.rooms (id)
  on delete set null;

alter table public.teams
  add constraint teams_problem_id_fkey
  foreign key (problem_id)
  references public.problems (id)
  on delete set null;

alter table public.teams
  add constraint teams_selected_problem_id_fkey
  foreign key (selected_problem_id)
  references public.problems (id)
  on delete set null;

alter table public.team_members
  add constraint team_members_team_id_fkey
  foreign key (team_id)
  references public.teams (id)
  on delete cascade;

alter table public.team_members
  add constraint team_members_user_id_fkey
  foreign key (user_id)
  references public.users (id)
  on delete cascade;

alter table public.problems
  add constraint problems_locked_by_fkey
  foreign key (locked_by)
  references public.teams (id)
  on delete set null;

alter table public.problems
  add constraint problems_assigned_to_fkey
  foreign key (assigned_to)
  references public.teams (id)
  on delete set null;

alter table public.submissions
  add constraint submissions_team_id_fkey
  foreign key (team_id)
  references public.teams (id)
  on delete cascade;

create unique index if not exists teams_team_uid_key on public.teams (team_uid);
create unique index if not exists team_members_user_id_key on public.team_members (user_id);

create index if not exists team_members_team_id_idx on public.team_members (team_id);
create index if not exists teams_leader_id_idx on public.teams (leader_id);
create index if not exists teams_room_id_idx on public.teams (room_id);
create index if not exists teams_problem_id_idx on public.teams (problem_id);
create index if not exists problems_status_idx on public.problems (status);
create index if not exists problems_locked_until_idx on public.problems (locked_until);
create index if not exists submissions_team_id_idx on public.submissions (team_id);

create or replace function public.is_team_leader(team_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.teams t
    where t.id = team_uuid
      and t.leader_id = auth.uid()
  );
$$;

create or replace function public.is_team_member(team_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.team_members tm
    where tm.team_id = team_uuid
      and tm.user_id = auth.uid()
  );
$$;

create or replace function public.can_manage_team(team_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_admin() or public.is_team_leader(team_uuid);
$$;

create or replace function public.can_manage_problem_actions()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_user_role() in ('leader', 'admin');
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  raw_metadata jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  next_role text := coalesce(nullif(raw_metadata ->> 'role', ''), 'member');
  next_team_id uuid := nullif(raw_metadata ->> 'team_id', '')::uuid;
  next_team_name text := coalesce(nullif(raw_metadata ->> 'team_name', ''), '');
  next_seat_id text := nullif(raw_metadata ->> 'seat_id', '');
  next_selected_problem text := nullif(raw_metadata ->> 'selected_problem', '');
begin
  insert into public.users (
    id,
    name,
    email,
    role,
    team_name,
    team_id,
    seat_id,
    selected_problem
  ) values (
    new.id,
    coalesce(nullif(raw_metadata ->> 'name', ''), nullif(raw_metadata ->> 'full_name', ''), new.email, 'User'),
    coalesce(new.email, ''),
    case
      when next_role in ('leader', 'member', 'admin') then next_role::public.user_role
      else 'member'::public.user_role
    end,
    next_team_name,
    next_team_id,
    next_seat_id,
    next_selected_problem
  )
  on conflict (id) do update set
    name = excluded.name,
    email = excluded.email,
    role = excluded.role,
    team_name = excluded.team_name;

  return new;
end;
$$;

alter table public.users enable row level security;
alter table public.teams enable row level security;
alter table public.team_members enable row level security;
alter table public.problems enable row level security;
alter table public.rooms enable row level security;
alter table public.announcements enable row level security;
alter table public.submissions enable row level security;

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on public.users to anon, authenticated;
grant select, insert, update, delete on public.teams to anon, authenticated;
grant select, insert, update, delete on public.team_members to anon, authenticated;
grant select, insert, update, delete on public.problems to anon, authenticated;
grant select, insert, update, delete on public.rooms to anon, authenticated;
grant select, insert, update, delete on public.announcements to anon, authenticated;
grant select, insert, update, delete on public.submissions to anon, authenticated;

create policy "users_select_own_or_admin"
on public.users
for select
using (id = auth.uid() or public.is_admin());

create policy "users_insert_own_or_admin"
on public.users
for insert
with check (id = auth.uid() or public.is_admin());

create policy "users_update_own_or_admin"
on public.users
for update
using (id = auth.uid() or public.is_admin())
with check (id = auth.uid() or public.is_admin());

create policy "users_delete_admin"
on public.users
for delete
using (public.is_admin());

create policy "teams_select_related_or_admin"
on public.teams
for select
using (
  public.is_admin()
  or leader_id = auth.uid()
  or public.is_team_member(id)
);

create policy "teams_insert_leader_or_admin"
on public.teams
for insert
with check (
  public.is_admin()
  or leader_id = auth.uid()
);

create policy "teams_update_leader_or_admin"
on public.teams
for update
using (
  public.is_admin()
  or leader_id = auth.uid()
)
with check (
  public.is_admin()
  or leader_id = auth.uid()
);

create policy "teams_delete_admin"
on public.teams
for delete
using (public.is_admin());

create policy "team_members_select_related_or_admin"
on public.team_members
for select
using (
  public.is_admin()
  or user_id = auth.uid()
  or public.can_manage_team(team_id)
  or public.is_team_member(team_id)
);

create policy "team_members_insert_related_or_admin"
on public.team_members
for insert
with check (
  public.is_admin()
  or user_id = auth.uid()
  or public.can_manage_team(team_id)
);

create policy "team_members_update_related_or_admin"
on public.team_members
for update
using (
  public.is_admin()
  or user_id = auth.uid()
  or public.can_manage_team(team_id)
)
with check (
  public.is_admin()
  or user_id = auth.uid()
  or public.can_manage_team(team_id)
);

create policy "team_members_delete_related_or_admin"
on public.team_members
for delete
using (
  public.is_admin()
  or user_id = auth.uid()
  or public.can_manage_team(team_id)
);

create policy "problems_select_authenticated"
on public.problems
for select
using (auth.uid() is not null);

create policy "problems_insert_admin"
on public.problems
for insert
with check (public.is_admin());

create policy "problems_update_leader_or_admin"
on public.problems
for update
using (
  public.is_admin()
  or public.can_manage_problem_actions()
)
with check (
  public.is_admin()
  or public.can_manage_problem_actions()
);

create policy "problems_delete_admin"
on public.problems
for delete
using (public.is_admin());

create policy "rooms_select_authenticated"
on public.rooms
for select
using (auth.uid() is not null);

create policy "rooms_write_admin"
on public.rooms
for insert
with check (public.is_admin());

create policy "rooms_update_admin"
on public.rooms
for update
using (public.is_admin())
with check (public.is_admin());

create policy "rooms_delete_admin"
on public.rooms
for delete
using (public.is_admin());

create policy "announcements_select_authenticated"
on public.announcements
for select
using (auth.uid() is not null);

create policy "announcements_write_admin"
on public.announcements
for insert
with check (public.is_admin());

create policy "announcements_update_admin"
on public.announcements
for update
using (public.is_admin())
with check (public.is_admin());

create policy "announcements_delete_admin"
on public.announcements
for delete
using (public.is_admin());

create policy "submissions_select_related_or_admin"
on public.submissions
for select
using (
  public.is_admin()
  or public.is_team_leader(team_id)
  or public.is_team_member(team_id)
);

create policy "submissions_insert_leader_or_admin"
on public.submissions
for insert
with check (
  public.is_admin()
  or public.is_team_leader(team_id)
);

create policy "submissions_update_admin"
on public.submissions
for update
using (public.is_admin())
with check (public.is_admin());

create policy "submissions_delete_admin"
on public.submissions
for delete
using (public.is_admin());

create trigger set_users_updated_at
before update on public.users
for each row execute function public.set_updated_at();

create trigger set_teams_updated_at
before update on public.teams
for each row execute function public.set_updated_at();

create trigger set_team_members_updated_at
before update on public.team_members
for each row execute function public.set_updated_at();

create trigger set_problems_updated_at
before update on public.problems
for each row execute function public.set_updated_at();

create trigger set_rooms_updated_at
before update on public.rooms
for each row execute function public.set_updated_at();

create trigger set_announcements_updated_at
before update on public.announcements
for each row execute function public.set_updated_at();

create trigger set_submissions_updated_at
before update on public.submissions
for each row execute function public.set_updated_at();

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();


