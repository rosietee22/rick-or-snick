import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

function getWeekDates(offset) {
  const today = new Date();
  const dow = today.getDay();
  const diffToMon = dow === 0 ? -6 : 1 - dow;
  const mon = new Date(today);
  mon.setDate(today.getDate() + diffToMon + offset * 7);
  mon.setHours(0, 0, 0, 0);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(mon);
    d.setDate(mon.getDate() + i);
    return d;
  });
}

function formatWeekLabel(dates) {
  const fmt = (d) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  return `${fmt(dates[0])} – ${fmt(dates[6])}`;
}

function formatSteps(n) {
  if (n == null) return '–';
  if (n >= 10000) return `${Math.round(n / 1000)}k`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

export default function Steps({ workouts, persons, onUpsertSteps }) {
  const [weekOffset, setWeekOffset] = useState(0);
  const [editing, setEditing] = useState(null); // { personId, dateKey }
  const [inputValue, setInputValue] = useState('');
  const [saving, setSaving] = useState(false);

  const weekDates = getWeekDates(weekOffset);
  const todayKey = new Date().toISOString().slice(0, 10);

  const getStepsForDay = (personId, dateKey) => {
    const entry = workouts.find(
      (w) => w.person === personId && w.type === 'steps' && w.date.slice(0, 10) === dateKey,
    );
    return entry?.steps ?? null;
  };

  const handleDayTap = (personId, dateKey) => {
    if (editing?.personId === personId && editing?.dateKey === dateKey) {
      setEditing(null);
      return;
    }
    const existing = getStepsForDay(personId, dateKey);
    setInputValue(existing != null ? String(existing) : '');
    setEditing({ personId, dateKey });
  };

  const handleSave = async () => {
    if (!editing) return;
    const count = parseInt(inputValue) || 0;
    setSaving(true);
    try {
      await onUpsertSteps(editing.personId, editing.dateKey, count);
      setEditing(null);
    } finally {
      setSaving(false);
    }
  };

  const handleWeekChange = (dir) => {
    setWeekOffset((o) => o + dir);
    setEditing(null);
  };

  return (
    <div className="steps-screen">
      <div className="week-nav">
        <button className="week-nav-btn" onClick={() => handleWeekChange(-1)}>
          <ChevronLeft size={18} strokeWidth={2.5} />
        </button>
        <span className="week-nav-label">{formatWeekLabel(weekDates)}</span>
        <button className="week-nav-btn" onClick={() => handleWeekChange(1)}>
          <ChevronRight size={18} strokeWidth={2.5} />
        </button>
      </div>

      {persons.map((p) => {
        const isEditingThisPerson = editing?.personId === p.id;
        const editingDate = isEditingThisPerson
          ? weekDates.find((d) => d.toISOString().slice(0, 10) === editing.dateKey)
          : null;
        const pts = isEditingThisPerson ? Math.floor((parseInt(inputValue) || 0) / 10000) : 0;

        return (
          <div key={p.id} className="steps-person">
            <h2 className="section-title">{p.name}</h2>
            <div className="steps-grid">
              {weekDates.map((date, i) => {
                const dateKey = date.toISOString().slice(0, 10);
                const steps = getStepsForDay(p.id, dateKey);
                const isToday = dateKey === todayKey;
                const isActive = editing?.personId === p.id && editing?.dateKey === dateKey;
                return (
                  <button
                    key={dateKey}
                    className={[
                      'day-cell',
                      isToday ? 'today' : '',
                      isActive ? 'active' : '',
                      steps != null ? 'has-steps' : '',
                    ].filter(Boolean).join(' ')}
                    onClick={() => handleDayTap(p.id, dateKey)}
                  >
                    <span className="day-label">{DAY_LABELS[i]}</span>
                    <span className="day-num">{date.getDate()}</span>
                    <span className="day-steps">{formatSteps(steps)}</span>
                  </button>
                );
              })}
            </div>

            {isEditingThisPerson && (
              <div className="steps-editor">
                <div className="steps-editor-label">
                  {editingDate?.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' })}
                </div>
                <div className="steps-editor-row">
                  <input
                    type="number"
                    className="text-input"
                    placeholder="e.g. 12500"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    inputMode="numeric"
                    min="0"
                    autoFocus
                  />
                  <button className="submit-btn steps-save-btn" onClick={handleSave} disabled={saving}>
                    {saving ? '…' : 'Save'}
                  </button>
                </div>
                {inputValue !== '' && (
                  <p className="steps-hint">
                    = <strong>{pts}</strong> {pts === 1 ? 'point' : 'points'}
                    {pts === 0 && parseInt(inputValue) > 0 ? ' — need 10,000 steps' : ''}
                  </p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
