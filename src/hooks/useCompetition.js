import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

// player1 always gets blue, player2 always gets black — same as the original PERSONS colours
const CHART_COLORS = ['#0057FF', '#111111'];

export function useCompetition(userId) {
  // undefined = loading, null = no competition yet
  const [competition, setCompetition] = useState(undefined);
  const [persons, setPersons] = useState([]);
  const [inviteToken, setInviteToken] = useState(null);

  const fetchCompetition = useCallback(async () => {
    if (!userId) return;

    const { data, error } = await supabase
      .from('competitions')
      .select(`
        *,
        player1:profiles!player1_id(id, display_name, avatar_url),
        player2:profiles!player2_id(id, display_name, avatar_url)
      `)
      .or(`player1_id.eq.${userId},player2_id.eq.${userId}`)
      .maybeSingle();

    if (error) {
      console.error('useCompetition error:', error);
      setCompetition(null);
      return;
    }

    if (!data) {
      setCompetition(null);
      setPersons([]);
      return;
    }

    setCompetition(data);

    // Build the persons array (same shape as the old PERSONS constant)
    const ps = [];
    if (data.player1) {
      ps.push({ id: data.player1_id, name: data.player1.display_name?.split(' ')[0] ?? data.player1.display_name, chartColor: CHART_COLORS[0] });
    }
    if (data.player2) {
      ps.push({ id: data.player2_id, name: data.player2.display_name?.split(' ')[0] ?? data.player2.display_name, chartColor: CHART_COLORS[1] });
    }
    setPersons(ps);

    // If waiting for rival, fetch the pending invite token so we can show the link
    if (!data.player2_id) {
      const { data: invite } = await supabase
        .from('invites')
        .select('token')
        .eq('competition_id', data.id)
        .eq('status', 'pending')
        .maybeSingle();
      setInviteToken(invite?.token ?? null);
    } else {
      setInviteToken(null);
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    fetchCompetition();
  }, [fetchCompetition, userId]);

  // Auto-refresh when rival joins (realtime on competitions table)
  useEffect(() => {
    if (!competition?.id) return;

    const channel = supabase
      .channel(`competition-meta-${competition.id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'competitions', filter: `id=eq.${competition.id}` },
        () => fetchCompetition(),
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [competition?.id, fetchCompetition]);

  return {
    competition,
    persons,
    inviteToken,
    loading: competition === undefined,
    refresh: fetchCompetition,
  };
}
