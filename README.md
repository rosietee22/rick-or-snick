# FitRace 💪

A minimal, mobile-first web app for two partners to track and compete on workout consistency. No login, no backend — just open the URL and start logging.

## ✏️ Customise the names

Open [`src/App.jsx`](src/App.jsx) and edit the `PERSONS` array near the top:

```js
export const PERSONS = [
  { id: 'person1', name: 'Alex', emoji: '🏋️', color: '#FF6B6B' },
  { id: 'person2', name: 'Sam', emoji: '🏊', color: '#4ECDC4' },
];
```

Change `name`, `emoji`, and `color` to whatever you like. The two `color` values are the accent colours used throughout the app — pick any hex values.

---

## 🚀 Local development

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📦 Building

```bash
npm run build
```

This outputs a `dist/` folder that is ready to deploy.

---

## 🌐 Deploy to Netlify (recommended — free)

### Option A: Drag-and-drop (easiest, no account setup needed)

1. Run `npm run build`
2. Go to [app.netlify.com](https://app.netlify.com) and sign up or log in (free)
3. On the dashboard, look for the **"Deploy manually"** section — drag your `dist/` folder into the drop zone
4. Netlify will give you a URL like `https://sparkly-fox-123abc.netlify.app`
5. Share it with your partner! 🎉

### Option B: GitHub + continuous deployment

1. Push this project to a GitHub repo
2. In Netlify: **New site → Import an existing project → GitHub**
3. Select your repo and set:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
4. Click Deploy — every push to `main` redeploys automatically

---

## 🌐 Deploy to Vercel (alternative — also free)

### Option A: CLI

```bash
npm install -g vercel
vercel
```

Follow the prompts. Vercel auto-detects Vite and sets up everything for you.

### Option B: Web UI

1. Push to GitHub
2. Go to [vercel.com](https://vercel.com) → **New Project → Import from GitHub**
3. Vercel auto-detects Vite — just click **Deploy**
4. You'll get a URL to share instantly

---

## 📱 Saving to home screen (make it feel like an app)

Once deployed, both of you should save the URL to your home screens:

- **iOS (Safari):** Tap the Share button → "Add to Home Screen"
- **Android (Chrome):** Tap ⋮ → "Add to Home Screen" or "Install app"

This makes it launch full-screen like a native app, with no browser chrome.

---

## 🔧 How data works

All workout data is stored in **each device's `localStorage`** — there is no shared database. This means:

- Each person's phone stores their own data independently
- The scoreboard shows **the data logged on that device**
- For a shared experience, log all workouts on **one shared device**, or nominate one person to track both

> **Want true cross-device sync?** A future upgrade could use a free [Supabase](https://supabase.com) or [Firebase](https://firebase.google.com) database to share data in real time — but that's out of scope for this version.

---

## 🏗️ Project structure

```
fitness-tracker/
├── src/
│   ├── App.jsx                  # Root component + PERSONS config
│   ├── index.css                # All styles (mobile-first)
│   ├── main.jsx                 # Entry point
│   ├── components/
│   │   ├── Scoreboard.jsx       # Weekly/all-time scores + log buttons
│   │   ├── LogWorkout.jsx       # Workout logging form
│   │   ├── Charts.jsx           # Weekly bar chart + stats
│   │   └── WeeklyHistory.jsx    # Past week winners
│   ├── hooks/
│   │   └── useWorkouts.js       # localStorage persistence
│   └── utils/
│       └── scoring.js           # Points logic + week calculations
├── index.html
├── vite.config.js
└── package.json
```

## Scoring

| Activity | Points |
|----------|--------|
| Gym | 1 pt |
| Swim | 1 pt |
| Other | 1 pt |
| Steps | 1 pt per 10,000 steps (e.g. 25,000 steps = 2 pts) |

Weekly winners are calculated at the end of each Monday–Sunday week.
