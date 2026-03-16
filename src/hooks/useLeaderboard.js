import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useLeaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.rpc('get_global_leaderboard').then(({ data, error }) => {
      if (!error && data) setLeaderboard(data);
      setLoading(false);
    });
  }, []);

  return { leaderboard, loading };
}
