import { useState } from 'react';
import { Trophy, Trash2, Footprints } from 'lucide-react';
import { getPastWeekWinners } from '../utils/scoring';

export default function WeeklyHistory({ workouts, persons, onDelete, userId }) {
  const [personFilter, setPersonFilter] = useState(null);

  const history = getPastWeekWinners(workouts, persons);
  const lastWeek = history[0] ?? null;
  const iWonLastWeek = lastWeek && !lastWeek.tied && lastWeek.winner?.id === userId;

  const activityItems = workouts
    .filter((w) => w.type !== 'steps' || (w.steps ?? 0) >= 10000)
    .filter((w) => !personFilter || w.person === personFilter)
    .slice(0, 30);

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
      {/* Activity log */}
      <section>
        <div className="history-section-header">
          <h2 className="section-title" style={{ marginBottom: 0 }}>Activity Log</h2>
          <div className="history-filter">
            <button
              className={`history-filter-btn${!personFilter ? ' active' : ''}`}
              onClick={() => setPersonFilter(null)}
            >
              All
            </button>
            {persons.map((p) => (
              <button
                key={p.id}
                className={`history-filter-btn${personFilter === p.id ? ' active' : ''}`}
                onClick={() => setPersonFilter(p.id)}
              >
                {firstName(p.name)}
              </button>
            ))}
          </div>
        </div>
        {activityItems.length === 0 ? (
          <p className="empty-hint">No activity logged yet.</p>
        ) : (
          <div className="recent-list">
            {activityItems.map((w) => {
              const person = getPerson(w.person);
              const isSteps = w.type === 'steps';
              const stepPts = isSteps ? Math.floor((w.steps ?? 0) / 10000) : null;
              return (
                <div key={w.id} className="recent-row" style={{ backgroundColor: tint(person?.chartColor ?? '#111111') }}>
                  <div className="recent-date">
                    <span className="recent-day">{formatDay(w.date)}</span>
                    <span className="recent-month">{formatMonthYear(w.date)}</span>
                  </div>
                  <div className="recent-info">
                    {isSteps ? (
                      <>
                        <span className="recent-activity" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Footprints size={13} strokeWidth={2} />
                          {w.steps?.toLocaleString()} steps
                        </span>
                        <span className="recent-notes">+{stepPts} {stepPts === 1 ? 'pt' : 'pts'}</span>
                      </>
                    ) : (
                      <>
                        <span className="recent-activity">{w.activity ?? w.type}</span>
                        {w.note && <span className="recent-notes">{w.note}</span>}
                      </>
                    )}
                    <span className="recent-name">{person?.name}</span>
                  </div>
                  {isOwn(w.person) && !isSteps && (
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
