import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useAuth() {
  // undefined = still loading, null = signed out, object = signed in
  const [session, setSession] = useState(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return {
    session,
    user: session?.user ?? null,
    loading: session === undefined,
  };
}
