import { Crown, Dumbbell, Footprints, Trophy } from 'lucide-react';
import { getPointBreakdown, getWeekKey, getPastWeekWinners, localDateKey } from '../utils/scoring';

export default function Scoreboard({ workouts, persons, onLog, loading }) {
  const currentWeek = getWeekKey(localDateKey(new Date()));
  const firstName = (name) => name?.split(' ')[0] ?? name;

  const weekWorkouts = workouts.filter((w) => getWeekKey(w.date) === currentWeek);

  const history = persons.length >= 2 ? getPastWeekWinners(workouts, persons) : [];

  const weekBreakdown = persons.map((p) => ({
    person: p,
    ...getPointBreakdown(weekWorkouts, p.id),
  }));

  const weeksWonMap = {};
  persons.forEach(p => {
    weeksWonMap[p.id] = history.filter(h => !h.tied && h.winner?.id === p.id).length;
  });

  const allTimeBreakdown = persons.map((p) => ({
    person: p,
    ...getPointBreakdown(workouts, p.id),
    totalSteps: workouts
      .filter((w) => w.person === p.id && w.type === 'steps')
      .reduce((sum, w) => sum + (w.steps || 0), 0),
    weeksWon: weeksWonMap[p.id] ?? 0,
  }));

  const weekLeader = weekBreakdown.length < 2 ? null
    : weekBreakdown[0].total > weekBreakdown[1].total ? weekBreakdown[0].person
    : weekBreakdown[1].total > weekBreakdown[0].total ? weekBreakdown[1].person
    : null;

  const allTimeLeader = allTimeBreakdown.length < 2 ? null
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

      {/* All-time */}
      <section>
        <h2 className="section-title">All Time</h2>
        <div className="alltime-list">
          {allTimeBreakdown.map(({ person: p, workoutPts, stepPts, total, totalSteps, weeksWon }) => {
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
                  {weeksWon > 0 && (
                    <span className="alltime-detail-item">
                      <Trophy size={11} strokeWidth={2} /> {weeksWon} {weeksWon === 1 ? 'week' : 'weeks'} won
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* How it works */}
      <section>
        <h2 className="section-title">How it works</h2>
        <div className="how-it-works">
          <div className="how-row">
            <Dumbbell size={14} strokeWidth={2} className="how-icon" />
            <span>Each workout logged = <strong>1 point</strong></span>
          </div>
          <div className="how-row">
            <Footprints size={14} strokeWidth={2} className="how-icon" />
            <span>10,000 steps = <strong>1 point</strong> — log daily via the Log tab</span>
          </div>
          <div className="how-row">
            <Trophy size={14} strokeWidth={2} className="how-icon" />
            <span>Most points by Sunday wins the week</span>
          </div>
        </div>
      </section>

    </div>
  );
}
