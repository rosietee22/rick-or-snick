import { useState } from 'react';
import { ChevronLeft, Dumbbell, Zap, Check } from 'lucide-react';

const ACTIVITY_TYPES = [
  { id: 'workout', Icon: Dumbbell, label: 'Workout' },
  { id: 'other',   Icon: Zap,      label: 'Other'   },
];

export default function LogWorkout({ persons, initialPerson, onAdd, onCancel }) {
  const [personId, setPersonId] = useState(initialPerson || persons[0].id);
  const [type, setType] = useState('workout');
  const [otherLabel, setOtherLabel] = useState('');
  const [note, setNote] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    onAdd({
      person: personId,
      type,
      label: type === 'other' ? otherLabel.trim() || undefined : undefined,
      note: note.trim() || undefined,
    });

    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 800);
  };

  if (submitted) {
    return (
      <div className="log-success">
        <div className="success-icon">
          <Check size={32} strokeWidth={3} />
        </div>
        <p>Logged!</p>
      </div>
    );
  }

  return (
    <div className="log-workout">
      <button className="back-btn" onClick={onCancel}>
        <ChevronLeft size={16} strokeWidth={2.5} /> Back
      </button>
      <h2 className="section-title" style={{ marginBottom: 0 }}>
        Log a Workout
      </h2>

      {/* Person picker */}
      <div className="person-picker">
        {persons.map((p) => (
          <button
            key={p.id}
            type="button"
            className={`person-pick-btn${personId === p.id ? ' active' : ''}`}
            onClick={() => setPersonId(p.id)}
          >
            {p.name}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="log-form">
        {/* Activity type */}
        <div className="field">
          <label className="field-label">Activity</label>
          <div className="activity-grid">
            {ACTIVITY_TYPES.map(({ id, Icon, label }) => (
              <button
                key={id}
                type="button"
                className={`activity-btn${type === id ? ' active' : ''}`}
                onClick={() => setType(id)}
              >
                <Icon size={22} strokeWidth={1.75} />
                <span className="act-label">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Other label */}
        {type === 'other' && (
          <div className="field">
            <label className="field-label">What activity?</label>
            <input
              type="text"
              className="text-input"
              placeholder="e.g. yoga, cycling, hiking…"
              value={otherLabel}
              onChange={(e) => setOtherLabel(e.target.value)}
              maxLength={30}
              autoFocus
            />
          </div>
        )}

        {/* Note */}
        <div className="field">
          <label className="field-label">
            Note <span className="optional">(optional)</span>
          </label>
          <input
            type="text"
            className="text-input"
            placeholder="e.g. felt strong today!"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={100}
          />
        </div>

        <button type="submit" className="submit-btn">
          Log Workout
        </button>
      </form>
    </div>
  );
}
