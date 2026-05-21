-- Supabase schema for the hackathon platform
-- Run this in the Supabase SQL editor.

create extension if not exists pgcrypto;

create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  team_name text not null,
  leader_id uuid not null references auth.users (id) on delete cascade,
  room_id uuid null,
  seat_number text null,
  problem_id uuid null,
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

create table if not exists public.problems (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  status text not null default 'available' check (status in ('available', 'locked', 'assigned', 'completed')),
  locked_by uuid null references public.teams (id) on delete set null,
  assigned_to uuid null references public.teams (id) on delete set null,
  locked_until timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  message text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null,
  email text not null,
  role text not null default 'student' check (role in ('student', 'coordinator', 'faculty', 'hoi')),
  team_id uuid null references public.teams (id) on delete set null,
  hidden_code text null,
  seat_id text null,
  selected_problem uuid null references public.problems (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.team_members (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams (id) on delete cascade,
  name text not null,
  email text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams (id) on delete cascade,
  github_link text null,
  ppt_link text null,
  submitted_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.teams
  add constraint teams_room_id_fkey foreign key (room_id) references public.rooms (id) on delete set null;

alter table public.teams
  add constraint teams_problem_id_fkey foreign key (problem_id) references public.problems (id) on delete set null;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists teams_set_updated_at on public.teams;
create trigger teams_set_updated_at
before update on public.teams
for each row execute function public.set_updated_at();

drop trigger if exists rooms_set_updated_at on public.rooms;
create trigger rooms_set_updated_at
before update on public.rooms
for each row execute function public.set_updated_at();

drop trigger if exists problems_set_updated_at on public.problems;
create trigger problems_set_updated_at
before update on public.problems
for each row execute function public.set_updated_at();

drop trigger if exists users_set_updated_at on public.users;
create trigger users_set_updated_at
before update on public.users
for each row execute function public.set_updated_at();

drop trigger if exists team_members_set_updated_at on public.team_members;
create trigger team_members_set_updated_at
before update on public.team_members
for each row execute function public.set_updated_at();

drop trigger if exists submissions_set_updated_at on public.submissions;
create trigger submissions_set_updated_at
before update on public.submissions
for each row execute function public.set_updated_at();

alter table public.teams enable row level security;
alter table public.rooms enable row level security;
alter table public.problems enable row level security;
alter table public.announcements enable row level security;
alter table public.users enable row level security;
alter table public.team_members enable row level security;
alter table public.submissions enable row level security;

drop policy if exists "authenticated_teams" on public.teams;
create policy "authenticated_teams" on public.teams for all to authenticated using (auth.uid() is not null) with check (auth.uid() is not null);

drop policy if exists "authenticated_rooms" on public.rooms;
create policy "authenticated_rooms" on public.rooms for all to authenticated using (auth.uid() is not null) with check (auth.uid() is not null);

drop policy if exists "authenticated_problems" on public.problems;
create policy "authenticated_problems" on public.problems for all to authenticated using (auth.uid() is not null) with check (auth.uid() is not null);

drop policy if exists "authenticated_announcements" on public.announcements;
create policy "authenticated_announcements" on public.announcements for all to authenticated using (auth.uid() is not null) with check (auth.uid() is not null);

drop policy if exists "authenticated_users" on public.users;
create policy "authenticated_users" on public.users for all to authenticated using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "authenticated_team_members" on public.team_members;
create policy "authenticated_team_members" on public.team_members for all to authenticated using (auth.uid() is not null) with check (auth.uid() is not null);

drop policy if exists "authenticated_submissions" on public.submissions;
create policy "authenticated_submissions" on public.submissions for all to authenticated using (auth.uid() is not null) with check (auth.uid() is not null);
