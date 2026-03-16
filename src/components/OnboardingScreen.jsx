import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function OnboardingScreen({ user, onJoined }) {
  const [view, setView] = useState('choice');   // 'choice' | 'create' | 'joining'
  const [compName, setCompName] = useState('');
  const [inviteLink, setInviteLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  // On mount, check for a pending invite token (from URL or localStorage after OAuth redirect)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('invite') || localStorage.getItem('pendingInviteToken');
    if (token) {
      localStorage.removeItem('pendingInviteToken');
      // Strip the token from the URL cleanly
      window.history.replaceState({}, '', window.location.pathname);
      joinWithToken(token);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const joinWithToken = async (token) => {
    setView('joining');
    const { data, error: rpcErr } = await supabase.rpc('accept_invite', { p_token: token });

    if (rpcErr || data?.error) {
      setError(rpcErr?.message ?? data.error);
      setView('choice');
      return;
    }

    onJoined();
  };

  const handleCreate = async () => {
    if (!compName.trim()) return;
    setBusy(true);
    setError('');

    // Create the competition
    const { data: comp, error: compErr } = await supabase
      .from('competitions')
      .insert({ name: compName.trim(), created_by: user.id, player1_id: user.id })
      .select()
      .single();

    if (compErr) {
      setError('Failed to create competition. Please try again.');
      setBusy(false);
      return;
    }

    // Generate an invite token
    const token = crypto.randomUUID();
    const { error: invErr } = await supabase.from('invites').insert({
      competition_id: comp.id,
      token,
      status: 'pending',
    });

    if (invErr) {
      setError('Failed to generate invite link. Please try again.');
      setBusy(false);
      return;
    }

    setInviteLink(`${window.location.origin}?invite=${token}`);
    setBusy(false);
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (view === 'joining') {
    return (
      <div className="onboarding-screen">
        <div className="onboarding-inner">
          <p className="onboarding-hint">Joining competition…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="onboarding-screen">
      <div className="onboarding-inner">
        <h1 className="app-title onboarding-title">HEATED RIVALRY</h1>

        {error && <p className="onboarding-error">{error}</p>}

        {view === 'choice' && (
          <>
            <p className="onboarding-hint">Set up your 1-on-1 competition.</p>
            <button className="submit-btn" onClick={() => setView('create')}>
              Create a competition
            </button>
            <p className="onboarding-or">— or —</p>
            <p className="onboarding-hint">
              Got an invite link? Open it in your browser to join.
            </p>
          </>
        )}

        {view === 'create' && !inviteLink && (
          <>
            <button className="back-btn" onClick={() => { setView('choice'); setError(''); }}>
              ← Back
            </button>
            <div className="field" style={{ marginTop: 24 }}>
              <label className="field-label">Competition name</label>
              <input
                className="text-input"
                type="text"
                placeholder="e.g. Office Fitness Battle"
                value={compName}
                onChange={(e) => setCompName(e.target.value)}
                maxLength={60}
                autoFocus
              />
            </div>
            <button
              className="submit-btn"
              onClick={handleCreate}
              disabled={!compName.trim() || busy}
              style={{ marginTop: 16 }}
            >
              {busy ? 'Creating…' : 'Create & get invite link'}
            </button>
          </>
        )}

        {inviteLink && (
          <>
            <p className="onboarding-hint" style={{ marginBottom: 8 }}>
              Share this link with your rival:
            </p>
            <div className="invite-link-box">
              <span className="invite-link-text">{inviteLink}</span>
              <button className="copy-btn" onClick={copyLink}>
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <p className="onboarding-hint onboarding-hint--small">
              Once they sign in, you'll both see the same competition automatically.
            </p>
            <button className="submit-btn" onClick={onJoined} style={{ marginTop: 8 }}>
              Open app
            </button>
          </>
        )}
      </div>
    </div>
  );
}
