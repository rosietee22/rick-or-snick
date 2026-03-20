import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { getWeekKey, formatWeekLabel, getPoints } from '../utils/scoring';

export default function Charts({ workouts, persons }) {
  // Build data for the last 8 weeks (including current)
  const buildWeekData = () => {
    const weeks = {};
    for (let i = 7; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i * 7);
      const key = getWeekKey(d.toISOString());
      if (!weeks[key]) {
        weeks[key] = { week: formatWeekLabel(key), _key: key };
        persons.forEach((p) => { weeks[key][p.id] = 0; });
      }
    }
    workouts.forEach((w) => {
      const key = getWeekKey(w.date);
      if (weeks[key]) {
        weeks[key][w.person] = (weeks[key][w.person] || 0) + getPoints(w);
      }
    });
    return Object.values(weeks);
  };

  const data = buildWeekData();

  // Per-person totals
  const personStats = persons.map((p) => ({
    person: p,
    totalWorkouts: workouts.filter((w) => w.person === p.id).length,
    totalPoints: workouts
      .filter((w) => w.person === p.id)
      .reduce((sum, w) => sum + getPoints(w), 0),
    totalSteps: workouts
      .filter((w) => w.person === p.id && w.type === 'steps')
      .reduce((sum, w) => sum + (w.steps || 0), 0),
    longestStreak: getLongestStreak(workouts.filter((w) => w.person === p.id)),
  }));

  return (
    <div className="charts">
      <section>
        <h2 className="section-title">Points Per Week</h2>
        <div className="chart-wrap">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eeeeee" vertical={false} />
              <XAxis dataKey="week" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: '1px solid #e5e5e5', fontSize: 13, fontFamily: 'DM Sans, sans-serif' }}
              />
              <Legend wrapperStyle={{ fontSize: 13 }} />
              {persons.map((p) => (
                <Bar
                  key={p.id}
                  dataKey={p.id}
                  name={p.name}
                  fill={p.chartColor}
                  radius={[4, 4, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>


<section>
        <h2 className="section-title">Fun Stats</h2>
        <div className="stat-grid">
          {personStats.map(({ person: p, totalWorkouts, totalPoints, totalSteps, longestStreak }) => (
            <div key={p.id} className="stat-card">
              <div className="stat-name">
                {p.name}
              </div>
              <div className="stat-rows">
                <StatRow label="Total workouts" value={totalWorkouts} />
                <StatRow label="Total points" value={totalPoints} />
                {totalSteps > 0 && (
                  <StatRow label="Total steps" value={totalSteps.toLocaleString()} />
                )}
                {totalSteps > 0 && (
                  <StatRow
                    label="≈ Distance"
                    value={`${(totalSteps * 0.000762).toFixed(1)} km`}
                  />
                )}
                {longestStreak > 0 && (
                  <StatRow label="Longest streak" value={`${longestStreak} days`} />
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function StatRow({ label, value }) {
  return (
    <div className="stat-row">
      <span className="stat-label">{label}</span>
      <span className="stat-value">{value}</span>
    </div>
  );
}

// Returns the longest consecutive-day streak for a set of workouts
function getLongestStreak(workouts) {
  if (!workouts.length) return 0;
  const days = [
    ...new Set(workouts.map((w) => w.date.split('T')[0])),
  ].sort();
  let max = 1;
  let cur = 1;
  for (let i = 1; i < days.length; i++) {
    const prev = new Date(days[i - 1]);
    const curr = new Date(days[i]);
    const diff = (curr - prev) / 86400000;
    if (diff === 1) {
      cur++;
      max = Math.max(max, cur);
    } else {
      cur = 1;
    }
  }
  return max;
}
