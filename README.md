# bugbounty-hackathon

BugBounty Hackathon is a modern hackathon platform built with React, TypeScript, Vite, Tailwind CSS, and Supabase. It includes a polished marketing site, Supabase-backed authentication, a live dashboard, and database-driven workflow screens for teams, problems, announcements, submissions, and seat allocation.

## Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Framer Motion
- Lucide React
- React Router
- Supabase Auth + Database

## What Is Implemented

- Marketing landing experience with custom sections and responsive UI
- Real Supabase authentication for login, registration, and password reset
- Email verification flow with resend support
- Session-aware route protection
- Dashboard that reads from Supabase instead of mock data
- Team management, member management, problem selection, announcements, and submissions UI
- Supabase SQL bootstrap script for creating the database schema

## Project Structure

- `src/pages/marketing` - public landing and informational pages
- `src/pages/auth` - login, register, verification, and password reset screens
- `src/pages/dashboard` - authenticated dashboard views
- `src/pages/admin` - admin-oriented management pages
- `src/supabase` - Supabase client, auth helpers, database helpers, queries, and realtime hooks
- `src/context` - global auth state
- `src/routes` - route definitions and guards
- `supabase/schema.sql` - SQL script to create the required tables in Supabase

## Environment Setup

Create a `.env` file in the project root and add your Supabase credentials:

```bash
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Supabase Database Setup

1. Open your Supabase project.
2. Go to the SQL editor.
3. Run the file at [supabase/schema.sql](supabase/schema.sql).
4. Make sure email authentication is enabled in Supabase Auth.
5. If you want email confirmation to be required, keep it enabled in the Supabase dashboard.

## Available Scripts

```bash
npm run dev
npm run build
npm run preview
npm run format
```

## Development

```bash
npm install
npm run dev
```

## Notes

- Authentication is real and handled by Supabase, not mocked in the frontend.
- The dashboard now resolves the current team from the authenticated user profile and falls back to Supabase lookups when needed.
- Resend and reset email flows use local cooldown protection to reduce repeated requests and avoid rate-limit errors.

## Status

The application is currently in an active build-out phase, with the core marketing, auth, and dashboard foundations in place and connected to Supabase.
