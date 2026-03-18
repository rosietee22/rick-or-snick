import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

// Convert a row from the `steps` table into the workout-shaped object
// that all existing components expect.
function stepsToWorkout(s) {
  return {
    id: `steps-${s.user_id}-${s.date}`,
    person: s.user_id,
    type: 'steps',
    steps: s.steps,
    date: typeof s.date === 'string' && s.date.length === 10
      ? `${s.date}T12:00:00.000Z`
      : s.date,
    competition_id: s.competition_id,
  };
}

export function useWorkouts(competitionId) {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!competitionId) return;

    setLoading(true);

    const fetchAll = async () => {
      const [
        { data: wData, error: wErr },
        { data: sData, error: sErr },
      ] = await Promise.all([
        supabase
          .from('workouts')
          .select('*')
          .eq('competition_id', competitionId)
          .order('date', { ascending: false }),
        supabase
          .from('steps')
          .select('*')
          .eq('competition_id', competitionId),
      ]);

      if (wErr || sErr) {
        setError((wErr || sErr).message);
        setLoading(false);
        return;
      }

      const stepsAsWorkouts = (sData ?? []).map(stepsToWorkout);
      const merged = [...(wData ?? []), ...stepsAsWorkouts]
        .sort((a, b) => new Date(b.date) - new Date(a.date));

      setWorkouts(merged);
      setLoading(false);
    };

    fetchAll();

    const channel = supabase
      .channel(`workouts-${competitionId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'workouts', filter: `competition_id=eq.${competitionId}` },
        (payload) => {
          setWorkouts((prev) => {
            if (prev.some((w) => w.id === payload.new.id)) return prev;
            return [payload.new, ...prev];
          });
        },
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'workouts', filter: `competition_id=eq.${competitionId}` },
        (payload) => {
          setWorkouts((prev) =>
            prev.map((w) => w.id === payload.new.id ? { ...w, ...payload.new } : w),
          );
        },
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'steps', filter: `competition_id=eq.${competitionId}` },
        (payload) => {
          const sw = stepsToWorkout(payload.new);
          setWorkouts((prev) => {
            if (prev.some((w) => w.id === sw.id)) return prev;
            return [sw, ...prev];
          });
        },
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'steps', filter: `competition_id=eq.${competitionId}` },
        (payload) => {
          const sw = stepsToWorkout(payload.new);
          setWorkouts((prev) => prev.map((w) => w.id === sw.id ? sw : w));
        },
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [competitionId]);

  const addWorkout = async (workout) => {
    const entry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      ...workout,
      competition_id: competitionId,
      date: workout.date || new Date().toISOString(),
    };
    const { error: err } = await supabase.from('workouts').insert(entry);
    if (err) throw err;
    return entry;
  };

  const upsertSteps = async (personId, dateKey, stepCount) => {
    const { error: err } = await supabase.from('steps').upsert(
      { user_id: personId, competition_id: competitionId, date: dateKey, steps: stepCount },
      { onConflict: 'user_id,date' },
    );
    if (err) throw err;

    // Optimistic local update
    const sw = stepsToWorkout({ user_id: personId, competition_id: competitionId, date: dateKey, steps: stepCount });
    setWorkouts((prev) => {
      if (prev.some((w) => w.id === sw.id)) return prev.map((w) => w.id === sw.id ? sw : w);
      return [sw, ...prev];
    });
  };

  const deleteWorkout = async (id) => {
    const { error: err } = await supabase.from('workouts').delete().eq('id', id);
    if (err) throw err;
    setWorkouts((prev) => prev.filter((w) => w.id !== id));
  };

  return { workouts, addWorkout, upsertSteps, deleteWorkout, loading, error };
}
