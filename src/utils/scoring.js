export const localDateKey = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export const getPoints = (workout) => {
  if (workout.type === 'steps') {
    return Math.floor((workout.steps || 0) / 10000);
  }
  return 1;
};

// Returns { workoutPts, stepPts, total } for a person
export const getPointBreakdown = (workouts, personId) => {
  const mine = workouts.filter((w) => w.person === personId);
  const stepPts = mine
    .filter((w) => w.type === 'steps')
    .reduce((sum, w) => sum + Math.floor((w.steps || 0) / 10000), 0);
  const workoutPts = mine
    .filter((w) => w.type !== 'steps')
    .length;
  return { workoutPts, stepPts, total: workoutPts + stepPts };
};

// Returns the Monday of the week for a given date string
export const getWeekStart = (dateStr) => {
  const d = new Date(dateStr.length === 10 ? dateStr + 'T12:00:00' : dateStr);
  const day = d.getDay(); // 0=Sun, 1=Mon...
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(d);
  monday.setDate(d.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
};

// Returns "YYYY-MM-DD" for the Monday of the week
export const getWeekKey = (dateStr) => {
  return localDateKey(getWeekStart(dateStr));
};

// Returns "Mar 3" style label from a week key
export const formatWeekLabel = (weekKey) => {
  const date = new Date(weekKey + 'T12:00:00');
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// Build a map of { weekKey -> { personId -> { workouts, points } } }
export const getWeeklyStats = (workouts, persons) => {
  const weeks = {};
  workouts.forEach((w) => {
    const key = getWeekKey(w.date);
    if (!weeks[key]) {
      weeks[key] = {};
      persons.forEach((p) => {
        weeks[key][p.id] = { workouts: 0, points: 0 };
      });
    }
    // Ensure person slot exists even if person was added after first week init
    if (!weeks[key][w.person]) {
      weeks[key][w.person] = { workouts: 0, points: 0 };
    }
    weeks[key][w.person].workouts += 1;
    weeks[key][w.person].points += getPoints(w);
  });
  return weeks;
};

// Returns an array of past week results (excludes current week), newest first
export const getPastWeekWinners = (workouts, persons) => {
  const currentWeek = getWeekKey(localDateKey(new Date()));
  const weeks = getWeeklyStats(workouts, persons);

  return Object.entries(weeks)
    .filter(([key]) => key < currentWeek)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([key, stats]) => {
      const scores = persons.map((p) => ({
        person: p,
        points: stats[p.id]?.points ?? 0,
      }));
      const sorted = [...scores].sort((a, b) => b.points - a.points);
      const tied = sorted[0].points === sorted[1].points;
      return {
        weekKey: key,
        label: `Week of ${formatWeekLabel(key)}`,
        winner: tied ? null : sorted[0].person,
        scores,
        tied,
      };
    });
};
