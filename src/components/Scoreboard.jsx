import { Crown, Dumbbell, Footprints } from 'lucide-react';
import { getPointBreakdown, getWeekKey } from '../utils/scoring';

export default function Scoreboard({ workouts, persons, onLog, loading }) {
  const currentWeek = getWeekKey(new Date().toISOString());

  const weekWorkouts = workouts.filter((w) => getWeekKey(w.date) === currentWeek);

  const weekBreakdown = persons.map((p) => ({
    person: p,
    ...getPointBreakdown(weekWorkouts, p.id),
  }));

  const allTimeBreakdown = persons.map((p) => ({
    person: p,
    ...getPointBreakdown(workouts, p.id),
    totalSteps: workouts
      .filter((w) => w.person === p.id && w.type === 'steps')
      .reduce((sum, w) => sum + (w.steps || 0), 0),
  }));

  const weekLeader = weekBreakdown.length < 2 ? weekBreakdown[0]?.person ?? null
    : weekBreakdown[0].total > weekBreakdown[1].total ? weekBreakdown[0].person
    : weekBreakdown[1].total > weekBreakdown[0].total ? weekBreakdown[1].person
    : null;

  const allTimeLeader = allTimeBreakdown.length < 2 ? allTimeBreakdown[0]?.person ?? null
    : allTimeBreakdown[0].total > allTimeBreakdown[1].total ? allTimeBreakdown[0].person
    : allTimeBreakdown[1].total > allTimeBreakdown[0].total ? allTimeBreakdown[1].person
    : null;

  return (
    <div className="scoreboard">
      {/* Weekly scores */}
      <section>
        <h2 className="section-title">This Week</h2>
        {loading ? (
          <div className="loading-pulse">Loading…</div>
        ) : (
          <>
            <div className="score-grid">
              {weekBreakdown.map(({ person: p, workoutPts, stepPts, total }) => {
                const winning = weekLeader?.id === p.id;
                return (
                  <div key={p.id} className="score-card">
                    <div className="score-card-top">
                      <span className="score-name">{p.name}</span>
                      {winning && <Crown size={14} strokeWidth={2.5} className="score-crown" />}
                    </div>
                    <div className={`score-num${winning ? ' winning' : ''}`}>{total}</div>
                    <div className="score-breakdown">
                      <Dumbbell size={12} strokeWidth={2} />
                      <span>{workoutPts}</span>
                      <span className="breakdown-sep">·</span>
                      <Footprints size={12} strokeWidth={2} />
                      <span>{stepPts}</span>
                    </div>
                    <div className="score-sub">pts this week</div>
                  </div>
                );
              })}
            </div>
            <p className={`lead-msg${weekLeader ? ' has-leader' : ''}`}>
              {weekLeader ? `${weekLeader.name} is winning` : 'Tied — all to play for'}
            </p>
          </>
        )}
      </section>

      {/* Log buttons */}
      <section>
        <h2 className="section-title">Log a Workout</h2>
        <div className="log-grid">
          {persons.map((p) => (
            <button key={p.id} className="log-btn" onClick={() => onLog(p.id)}>
              <span className="log-name">{p.name}</span>
              <span className="log-sub">Tap to log</span>
            </button>
          ))}
        </div>
      </section>

      {/* All-time */}
      <section>
        <h2 className="section-title">All Time</h2>
        <div className="alltime-list">
          {allTimeBreakdown.map(({ person: p, workoutPts, stepPts, total, totalSteps }) => {
            const leading = allTimeLeader?.id === p.id;
            return (
              <div key={p.id} className="alltime-row">
                <div className="alltime-top">
                  <span className="alltime-name">{p.name}</span>
                  <span className={`alltime-total${leading ? ' leading' : ''}`}>{total} pts</span>
                </div>
                <div className="alltime-detail">
                  <span className="alltime-detail-item">
                    <Dumbbell size={11} strokeWidth={2} /> {workoutPts} workout pts
                  </span>
                  <span className="alltime-detail-item">
                    <Footprints size={11} strokeWidth={2} /> {stepPts} step pts
                  </span>
                  {totalSteps > 0 && (
                    <span>{totalSteps.toLocaleString()} steps total</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
}
