import { useRef } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Scoreboard from './Scoreboard';

const DEMO_PERSONS = [
  { id: 'demo-1', name: 'Alex',   chartColor: '#0057ff' },
  { id: 'demo-2', name: 'Jordan', chartColor: '#ff3b30' },
];

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

const DEMO_WORKOUTS = [
  { id: 'd1',  person: 'demo-1', type: 'gym',     date: daysAgo(0) },
  { id: 'd2',  person: 'demo-1', type: 'run',     date: daysAgo(1) },
  { id: 'd3',  person: 'demo-2', type: 'pilates', date: daysAgo(1) },
  { id: 'd4',  person: 'demo-2', type: 'swim',    date: daysAgo(2) },
  { id: 'd5',  person: 'demo-1', type: 'gym',     date: daysAgo(2) },
  { id: 'd6',  person: 'demo-2', type: 'gym',     date: daysAgo(3) },
  { id: 'd7',  person: 'demo-1', type: 'steps',   date: daysAgo(3), steps: 11200 },
  { id: 'd8',  person: 'demo-2', type: 'run',     date: daysAgo(4) },
  { id: 'd9',  person: 'demo-1', type: 'pilates', date: daysAgo(5) },
  { id: 'd10', person: 'demo-2', type: 'steps',   date: daysAgo(5), steps: 13400 },
  // past weeks
  { id: 'd11', person: 'demo-1', type: 'gym',     date: daysAgo(8) },
  { id: 'd12', person: 'demo-1', type: 'run',     date: daysAgo(9) },
  { id: 'd13', person: 'demo-2', type: 'gym',     date: daysAgo(10) },
  { id: 'd14', person: 'demo-1', type: 'swim',    date: daysAgo(11) },
  { id: 'd15', person: 'demo-2', type: 'pilates', date: daysAgo(12) },
  { id: 'd16', person: 'demo-2', type: 'steps',   date: daysAgo(13), steps: 10800 },
];

export default function LoginScreen() {
  const loginRef = useRef(null);
  const previewRef = useRef(null);

  const handleSignIn = () => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('invite');
    if (token) {
      localStorage.setItem('pendingInviteToken', token);
    }
    supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
  };

  const scrollTo = (ref) => ref.current?.scrollIntoView({ behavior: 'smooth' });

  return (
    <div className="login-scroll-container">
      {/* Panel 1 — login */}
      <div className="login-panel login-panel--main" ref={loginRef}>
        <div className="login-screen">
          <div className="login-inner">
            <h1 className="app-title login-title">HEATED RIVALRY</h1>
            <p className="login-sub">Track your fitness. Beat your rival.</p>
            <button className="google-btn" onClick={handleSignIn}>
              <GoogleIcon />
              Sign in with Google
            </button>
          </div>
        </div>
        <button className="login-scroll-btn" onClick={() => scrollTo(previewRef)} aria-label="See preview">
          <span className="login-scroll-label">See a preview</span>
          <ChevronDown size={20} strokeWidth={2.5} />
        </button>
      </div>

      {/* Panel 2 — preview */}
      <div className="login-panel login-panel--preview" ref={previewRef}>
        <button className="preview-back-btn" onClick={() => scrollTo(loginRef)}>
          <ChevronUp size={16} strokeWidth={2.5} /> Back to sign in
        </button>
        <div className="phone-frame-wrapper">
          <div className="preview-label">Example</div>
          <div className="phone-mockup">
            <div className="phone-notch" />
            <div className="phone-screen">
              <Scoreboard
                workouts={DEMO_WORKOUTS}
                persons={DEMO_PERSONS}
                onLog={() => {}}
                loading={false}
                userId="demo-1"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.25-.164-1.84H9v3.48h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908C16.658 14.013 17.64 11.71 17.64 9.2z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" />
      <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" />
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" />
    </svg>
  );
}
