import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useWorkouts() {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Initial load
    supabase
      .from('workouts')
      .select('*')
      .order('date', { ascending: false })
      .then(({ data, error: err }) => {
        if (err) {
          setError(err.message);
        } else {
          setWorkouts(data ?? []);
        }
        setLoading(false);
      });

    const channel = supabase
      .channel('workouts-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'workouts' }, (payload) => {
        setWorkouts((prev) => {
          if (prev.some((w) => w.id === payload.new.id)) return prev;
          return [payload.new, ...prev];
        });
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'workouts' }, (payload) => {
        setWorkouts((prev) => prev.map((w) => w.id === payload.new.id ? { ...w, ...payload.new } : w));
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  const addWorkout = async (workout) => {
    const entry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      ...workout,
      date: new Date().toISOString(),
    };

    const { error: err } = await supabase.from('workouts').insert(entry);
    if (err) throw err;
    return entry;
  };

  const upsertSteps = async (personId, dateKey, stepCount) => {
    const existing = workouts.find(
      (w) => w.person === personId && w.type === 'steps' && w.date.slice(0, 10) === dateKey,
    );

    if (existing) {
      const { error: err } = await supabase
        .from('workouts')
        .update({ steps: stepCount })
        .eq('id', existing.id);
      if (err) throw err;
      setWorkouts((prev) => prev.map((w) => w.id === existing.id ? { ...w, steps: stepCount } : w));
    } else {
      const entry = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        person: personId,
        type: 'steps',
        steps: stepCount,
        date: `${dateKey}T12:00:00.000Z`,
      };
      const { error: err } = await supabase.from('workouts').insert(entry);
      if (err) throw err;
      setWorkouts((prev) => [entry, ...prev]);
    }
  };

  return { workouts, addWorkout, upsertSteps, loading, error };
}
