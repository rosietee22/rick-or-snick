# Heated Rivalry

A mobile-first web app for two people to track and compete on workout consistency. Backed by Supabase so both people see live, synced data from any device.

Live at: [heated-rivalry.vercel.app](https://heated-rivalry.vercel.app) *(update with your Vercel URL)*

---

## How it works

- Log workouts (Gym, Swim, Run, Pilates, Other) — each counts as 1 point
- Track daily steps with a weekly calendar grid
- See who's winning this week and all-time
- History shows recent workouts with colour-coded cards per person
- Stats page shows weekly bar chart and totals

---

## Customise the players

Open [src/App.jsx](src/App.jsx) and edit the `PERSONS` array:

```js
export const PERSONS = [
  { id: 'person1', name: 'Phoebe', chartColor: '#0057FF' },
  { id: 'person2', name: 'Rosie',  chartColor: '#111111' },
];
```

Change `name` and `chartColor` to whatever you like.

---

## Scoring

| Activity | Points |
|----------|--------|
| Gym, Swim, Run, Pilates, Other | 1 pt each |
| Steps | 1 pt per 10,000 steps |

Weekly winners are calculated Monday–Sunday.

---

## Data

All data is stored in **Supabase** (cloud Postgres). Both players see the same data in real time from any device. Workouts persist across deploys — deploying new code never affects the database.

You'll need a `.env.local` file with:

```
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

---

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

---

## Deploy

Connected to Vercel via GitHub — every push to `main` redeploys automatically. Add your Supabase env vars in Vercel → Settings → Environment Variables.

---

## Project structure

```
src/
├── App.jsx                  # Root + PERSONS config
├── index.css                # All styles
├── components/
│   ├── Scoreboard.jsx       # Weekly + all-time scores
│   ├── LogWorkout.jsx       # Workout logging form
│   ├── Steps.jsx            # Weekly steps calendar
│   ├── Charts.jsx           # Bar chart + stats
│   └── WeeklyHistory.jsx    # Recent workouts + weekly winners
├── hooks/
│   └── useWorkouts.js       # Supabase sync + realtime
└── utils/
    └── scoring.js           # Points + week logic
```

---

## Install as app

Once deployed, add to home screen for a native-app feel:

- **iOS (Safari):** Share → Add to Home Screen
- **Android (Chrome):** ⋮ → Add to Home Screen / Install app
