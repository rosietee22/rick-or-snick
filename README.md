# Heated Rivalry

A mobile-first web app for two people to track and compete on workout consistency. Sign in with Google, create a competition, invite your rival, and both of you see live synced data from any device.

Live at: [heated-rivalry.vercel.app](https://heated-rivalry.vercel.app) *(update with your URL)*

---

## How it works

- Sign in with Google — no passwords
- One person creates a competition and shares an invite link
- The other person opens the link, signs in, and joins instantly
- Log workouts (Gym, Swim, Run, Pilates, Other) — each counts as 1 point
- Track daily steps with a weekly calendar grid
- See who's winning this week and all-time
- History shows recent workouts with colour-coded cards per person
- Stats page shows weekly bar chart and totals

---

## Scoring

| Activity | Points |
|----------|--------|
| Gym, Swim, Run, Pilates, Other | 1 pt each |
| Steps | 1 pt per 10,000 steps |

Weekly winners are calculated Monday–Sunday.

---

## Setup

### 1. Supabase — enable Google OAuth

1. Go to **Supabase dashboard → Authentication → Providers → Google**
2. Toggle Google on
3. Create OAuth credentials in [Google Cloud Console](https://console.cloud.google.com/):
   - Create a project → APIs & Services → Credentials → OAuth 2.0 Client ID
   - Application type: **Web application**
   - Authorised redirect URI: `https://<your-supabase-project>.supabase.co/auth/v1/callback`
4. Paste the Client ID and Client Secret back into Supabase
5. In Supabase → **Authentication → URL Configuration**, add your app URL to **Redirect URLs** (e.g. `https://your-app.vercel.app`)

### 2. Apply the schema

Run [`scripts/schema.sql`](scripts/schema.sql) in the **Supabase SQL editor** (once). This creates:
- `profiles` — auto-populated on first sign-in via a trigger
- `competitions` — one row per pair of players
- `invites` — invite tokens for the join flow
- `steps` — daily step counts (split out from the workouts table)
- Adds `user_id` and `competition_id` columns to `workouts`
- Row-level security policies on all tables
- `accept_invite` RPC function

### 3. Environment variables

`.env.local` (local dev):
```
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

Add the same two vars in **Vercel → Settings → Environment Variables** for production.

---

## Data migration (Phoebe & Rosie's existing data)

If you're migrating from v1 (hardcoded `person1`/`person2` data):

1. Both Phoebe and Rosie sign in with Google at least once (this creates their `profiles` rows)
2. Find each user's UUID in **Supabase → Authentication → Users**
3. Open [`scripts/migration.sql`](scripts/migration.sql) and replace the two placeholder UUIDs at the top
4. Run the script in the Supabase SQL editor

The script:
- Creates a competition row linking both users
- Remaps all `person1`/`person2` workout rows to the real user IDs
- Migrates step entries from the `workouts` table to the new `steps` table
- Is safe to run more than once

---

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

For Google sign-in to work locally, add `http://localhost:5173` to **Redirect URLs** in Supabase → Authentication → URL Configuration.

---

## Deploy

Connected to Vercel via GitHub — every push to `main` redeploys automatically.

---

## Project structure

```
src/
├── App.jsx                  # Root — auth + competition context
├── index.css                # All styles
├── components/
│   ├── LoginScreen.jsx      # Google sign-in screen
│   ├── OnboardingScreen.jsx # Create/join competition flow
│   ├── Scoreboard.jsx       # Weekly + all-time scores
│   ├── LogWorkout.jsx       # Workout logging form
│   ├── Steps.jsx            # Weekly steps calendar
│   ├── Charts.jsx           # Bar chart + stats
│   └── WeeklyHistory.jsx    # Recent workouts + weekly winners
├── hooks/
│   ├── useAuth.js           # Supabase auth session
│   ├── useCompetition.js    # Competition + player profiles
│   └── useWorkouts.js       # Workout + steps data + realtime
├── lib/
│   └── supabase.js          # Supabase client
└── utils/
    └── scoring.js           # Points + week logic
scripts/
├── schema.sql               # Run once in Supabase SQL editor
└── migration.sql            # One-time v1 → v2 data migration
```

---

## Install as app

Once deployed, add to home screen for a native-app feel:

- **iOS (Safari):** Share → Add to Home Screen
- **Android (Chrome):** ⋮ → Add to Home Screen / Install app
