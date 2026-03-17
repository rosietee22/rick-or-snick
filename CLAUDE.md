# Heated Rivalry — Claude Guide

## Project Overview
Fitness competition app where two people track workouts and steps to compete weekly. Live at heatedrivalry.app.

**v2 goal:** Any two people can compete (not hardcoded Phoebe & Rosie). Adding Google Auth, competitions table, and invite links.

---

## Tech Stack
- **Frontend:** React 18, Vite, JSX (not TSX)
- **Database/Auth:** Supabase (PostgreSQL + Google OAuth)
- **Styling:** Single `src/index.css` file, no CSS framework
- **Charts:** Recharts
- **Icons:** Lucide React
- **Hosting:** Vercel — auto-deploys on push to `main`

## Environment Variables
```
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```
Set locally in `.env.local`, and in Vercel dashboard for production.

---

## Dev Commands
```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run preview  # Preview build locally
```

---

## Directory Structure
```
src/
  components/   # Login, Onboarding, Scoreboard, LogWorkout, Steps, Charts, WeeklyHistory
  hooks/        # useAuth, useCompetition, useWorkouts, useLeaderboard
  lib/          # Supabase client
  utils/        # Scoring logic
  index.css     # All styles
scripts/
  schema.sql    # Run once in Supabase SQL editor
  migration.sql # v1→v2 data migration
```

---

## Architecture
- **No React Router** — tab-based navigation (`home | log | steps | stats | history`)
- **No global state** — React hooks only (no Redux/Zustand)
- **Realtime** — Supabase subscriptions keep data synced live
- **Mobile-first** — 480px max-width, PWA manifest
- **Invite links** — `?invite=TOKEN` URL param (no routing library needed)

---

## v2 Phase Plan (follow in order)
1. Auth (login screen + Google OAuth via `@supabase/auth-ui-react`)
2. DB schema SQL (competitions, invites, steps tables + alter workouts)
3. Onboarding + invite flow
4. Scope all queries to competition
5. Migration script (SQL, run in Supabase SQL editor)
6. README update

**Key decisions:**
- One competition per account (no leaving/rejoining)
- Steps are in a separate `steps` table
- person1 / person2 roles within a competition

---

## Constraints — Do Not Change
- Existing UI layout and visual design
- Activity types and scoring logic (`src/utils/`)
- Steps tab visuals
- No React Router — keep tab-based nav

---

## Preferences
- Keep responses short and direct — no trailing summaries
- Don't over-engineer: minimal abstractions, no speculative features
- Don't add comments, docstrings, or types to untouched code
- Prefer editing existing files over creating new ones
- DB schema changes go in SQL files run via Supabase SQL editor (not ORM migrations)
- No linting tools configured — maintain existing code style (2-space indent, camelCase)
