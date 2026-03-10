import { Trophy } from 'lucide-react';
import { getPastWeekWinners } from '../utils/scoring';

export default function WeeklyHistory({ workouts, persons }) {
  const history = getPastWeekWinners(workouts, persons);

  if (!history.length) {
    return (
      <div className="history">
        <h2 className="section-title">Weekly Winners</h2>
        <div className="empty-state">
          <Trophy size={36} strokeWidth={1.5} />
          <p>No completed weeks yet.</p>
          <p>Keep logging — past week results will appear here!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="history">
      <h2 className="section-title">Weekly Winners</h2>
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
    </div>
  );
}
