import { Trophy, Trash2 } from 'lucide-react';
import { getPastWeekWinners } from '../utils/scoring';

export default function WeeklyHistory({ workouts, persons, onDelete, userId }) {
  const history = getPastWeekWinners(workouts, persons);
  const lastWeek = history[0] ?? null;
  const iWonLastWeek = lastWeek && !lastWeek.tied && lastWeek.winner?.id === userId;

  const recentWorkouts = workouts
    .filter((w) => w.type !== 'steps')
    .slice(0, 20);

  const getPerson = (personId) => persons.find((p) => p.id === personId);

  const formatDay = (iso) => new Date(iso).toLocaleDateString('en-GB', { day: 'numeric' });
  const formatMonthYear = (iso) => new Date(iso).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });

  const tint = (hex) => hex + '14'; // ~8% opacity
  const firstName = (name) => name?.split(' ')[0] ?? name;

  const handleDelete = (id) => {
    if (window.confirm('Delete this workout?')) onDelete(id);
  };

  const isOwn = (personId) => !userId || personId === userId;

  return (
    <div className="history">
      {/* Recent workouts */}
      <section>
        <h2 className="section-title">Recent Workouts</h2>
        {recentWorkouts.length === 0 ? (
          <p className="empty-hint">No workouts logged yet.</p>
        ) : (
          <div className="recent-list">
            {recentWorkouts.map((w) => {
              const person = getPerson(w.person);
              return (
                <div key={w.id} className="recent-row" style={{ backgroundColor: tint(person?.chartColor ?? '#111111') }}>
                  <div className="recent-date">
                    <span className="recent-day">{formatDay(w.date)}</span>
                    <span className="recent-month">{formatMonthYear(w.date)}</span>
                  </div>
                  <div className="recent-info">
                    <span className="recent-activity">{w.activity ?? w.type}</span>
                    {w.note && <span className="recent-notes">{w.note}</span>}
                    <span className="recent-name">{person?.name}</span>
                  </div>
                  {isOwn(w.person) && (
                    <button className="delete-btn" onClick={() => handleDelete(w.id)} aria-label="Delete">
                      <Trash2 size={15} strokeWidth={2} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Weekly winners */}
      <section>
        <h2 className="section-title">Weekly Winners</h2>
        {history.length === 0 ? (
          <div className="empty-state">
            <Trophy size={36} strokeWidth={1.5} />
            <p>No completed weeks yet.</p>
            <p>Keep logging — past week results will appear here!</p>
          </div>
        ) : (
          <>
            {/* Last week highlight */}
            {lastWeek && (
              <div className={`last-week-card${iWonLastWeek ? ' last-week-win' : ''}`}>
                <div className="last-week-top">
                  <Trophy size={18} strokeWidth={2} className="last-week-trophy" />
                  <span className="last-week-result">
                    {lastWeek.tied
                      ? 'It was a draw'
                      : iWonLastWeek
                        ? 'You won!'
                        : `${firstName(lastWeek.winner.name)} won`}
                  </span>
                </div>
                <div className="last-week-scores">
                  {lastWeek.scores.map(({ person: p, points }, i) => (
                    <span key={p.id} className="last-week-score-item">
                      {i > 0 && <span className="last-week-sep">·</span>}
                      <span className="last-week-score-name">{firstName(p.name)}</span>
                      <span className="last-week-score-pts">{points}</span>
                    </span>
                  ))}
                </div>
                <div className="last-week-label">{lastWeek.label}</div>
              </div>
            )}
            {/* Full history */}
            {history.length > 1 && (
              <div className="history-list">
                {history.slice(1).map(({ weekKey, label, winner, scores, tied }) => (
                  <div key={weekKey} className="history-row">
                    <div className="history-week-header">
                      <div className="history-week">{label}</div>
                      {tied ? (
                        <span className="badge badge-tie">Tied</span>
                      ) : (
                        <span className="badge badge-win">{firstName(winner.name)} won</span>
                      )}
                    </div>
                    <div className="history-scores">
                      {scores.map(({ person: p, points }, i) => (
                        <span key={p.id} className="history-score-item">
                          {i > 0 && <span className="history-score-sep">·</span>}
                          <span className="history-score-name">{firstName(p.name)}</span>
                          <span className="history-score-pts">{points}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
