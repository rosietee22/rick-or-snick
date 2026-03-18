import { useState } from 'react';
import { ChevronLeft, Dumbbell, Waves, Wind, Flower2, Zap, Check } from 'lucide-react';

const ACTIVITY_TYPES = [
  { id: 'gym',     Icon: Dumbbell, label: 'Gym'     },
  { id: 'swim',    Icon: Waves,    label: 'Swim'    },
  { id: 'run',     Icon: Wind,     label: 'Run'     },
  { id: 'pilates', Icon: Flower2,  label: 'Pilates' },
  { id: 'other',   Icon: Zap,      label: 'Other'   },
];

export default function LogWorkout({ personId, onAdd, onCancel }) {
  const [type, setType] = useState('gym');
  const [otherLabel, setOtherLabel] = useState('');
  const [note, setNote] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  const handleSubmit = (e) => {
    e.preventDefault();

    const dateISO = date ? `${date}T12:00:00.000Z` : new Date().toISOString();

    onAdd({
      person: personId,
      type,
      label: type === 'other' ? otherLabel.trim() || undefined : undefined,
      note: note.trim() || undefined,
      date: dateISO,
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

      {/* Date picker */}
      <input
        type="date"
        className="text-input"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        max={new Date().toISOString().slice(0, 10)}
      />

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
