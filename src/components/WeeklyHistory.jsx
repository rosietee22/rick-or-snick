import { Trophy, Trash2 } from 'lucide-react';
import { getPastWeekWinners } from '../utils/scoring';
import { PERSONS } from '../App';

export default function WeeklyHistory({ workouts, persons, onDelete }) {
  const history = getPastWeekWinners(workouts, persons);

  const recentWorkouts = workouts
    .filter((w) => w.type !== 'steps')
    .slice(0, 20);

  const getName = (personId) => persons.find((p) => p.id === personId)?.name ?? personId;

  const formatDate = (iso) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this workout?')) onDelete(id);
  };

  return (
    <div className="history">
      {/* Recent workouts */}
      <section>
        <h2 className="section-title">Recent Workouts</h2>
        {recentWorkouts.length === 0 ? (
          <p className="empty-hint">No workouts logged yet.</p>
        ) : (
          <div className="recent-list">
            {recentWorkouts.map((w) => (
              <div key={w.id} className="recent-row">
                <div className="recent-info">
                  <span className="recent-name">{getName(w.person)}</span>
                  <span className="recent-meta">{w.activity ?? w.type} · {formatDate(w.date)}</span>
                </div>
                <button className="delete-btn" onClick={() => handleDelete(w.id)} aria-label="Delete">
                  <Trash2 size={15} strokeWidth={2} />
                </button>
              </div>
            ))}
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
          <div className="history-list">
            {history.map(({ weekKey, label, winner, scores, tied }) => (
              <div key={weekKey} className="history-row">
                <div className="history-week">{label}</div>
                <div className="history-result">
                  {tied ? (
                    <span className="badge badge-tie">Tied</span>
                  ) : (
                    <span className="badge badge-win">{winner.name} won</span>
                  )}
                </div>
                <div className="history-scores">
                  {scores.map(({ person: p, points }) => (
                    <span key={p.id}>{p.name}: {points}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
