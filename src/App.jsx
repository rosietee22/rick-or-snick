import { useState } from 'react';
import { Home, Plus, BarChart2, Trophy, Footprints, Dumbbell } from 'lucide-react';
import { useAuth } from './hooks/useAuth';
import { useCompetition } from './hooks/useCompetition';
import { useWorkouts } from './hooks/useWorkouts';
import { localDateKey } from './utils/scoring';
import LoginScreen from './components/LoginScreen';
import OnboardingScreen from './components/OnboardingScreen';
import Scoreboard from './components/Scoreboard';
import LogWorkout from './components/LogWorkout';
import Steps from './components/Steps';
import Charts from './components/Charts';
import WeeklyHistory from './components/WeeklyHistory';
import PrivacyPolicy from './components/PrivacyPolicy';
import './index.css';

if (window.location.pathname === '/privacy') {
  document.title = 'Privacy Policy — Heated Rivalry';
}

const TABS = [
  { id: 'home',    Icon: Home,      label: 'Home'    },
  { id: 'log',     Icon: Plus,      label: 'Log'     },
  { id: 'stats',   Icon: BarChart2, label: 'Stats'   },
  { id: 'history', Icon: Trophy,    label: 'History' },
];

export default function App() {
  const { user, loading: authLoading } = useAuth();
  const { competition, persons, inviteToken, loading: compLoading, refresh: refreshComp } = useCompetition(user?.id);
  const { workouts, addWorkout, upsertSteps, deleteWorkout, loading: workoutsLoading, error } = useWorkouts(competition?.id);
  const [tab, setTab] = useState('home');
  const [logPerson, setLogPerson] = useState(null);
  const [logMode, setLogMode] = useState('workout'); // 'workout' | 'steps'

  const openLog = (personId) => {
    setLogPerson(personId);
    setLogMode('workout');
    setTab('log');
  };

  const handleLogged = async (workout) => {
    await addWorkout(workout);
    setTab('home');
    setLogPerson(null);
  };

  // Badge: show dot on Log if current user hasn't logged yesterday's steps
  // (steps should be logged at end of day, not during)
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = localDateKey(yesterday);
  const stepsMissingToday = !!(user && persons.length > 0 &&
    !workouts.some(w => w.person === user.id && w.type === 'steps' && w.date.slice(0, 10) === yesterdayKey));

  if (window.location.pathname === '/privacy') return <PrivacyPolicy />;

  if (authLoading) return null;
  if (!user) return <LoginScreen />;
  if (compLoading) return null;
  if (!competition) return <OnboardingScreen user={user} onJoined={refreshComp} />;

  const waitingForRival = !competition.player2_id;
  const inviteLink = inviteToken ? `${window.location.origin}?invite=${inviteToken}` : null;
  const loading = workoutsLoading;

  return (
    <div className="app">
      <header className="app-header" onClick={() => setTab('home')} style={{ cursor: 'pointer' }}>
        <h1 className="app-title">HEATED RIVALRY</h1>
      </header>

      <main className="app-main">
        {error && (
          <div className="db-error">
            Database not connected. Check your <code>.env.local</code> Supabase keys.
          </div>
        )}

        {waitingForRival && inviteLink && (
          <div className="waiting-banner">
            <span>Waiting for your rival to join.</span>
            <CopyableLink link={inviteLink} />
          </div>
        )}

        {tab === 'home' && (
          <Scoreboard workouts={workouts} persons={persons} onLog={openLog} loading={loading} userId={user.id} />
        )}
        {tab === 'log' && (
          <div className="log-screen">
            <div className="log-mode-bar">
              <button
                className={`log-mode-btn${logMode === 'workout' ? ' active' : ''}`}
                onClick={() => setLogMode('workout')}
              >
                <Dumbbell size={14} strokeWidth={2} />
                Workout
              </button>
              <button
                className={`log-mode-btn${logMode === 'steps' ? ' active' : ''}`}
                onClick={() => setLogMode('steps')}
              >
                <Footprints size={14} strokeWidth={2} />
                Steps
              </button>
            </div>
            {logMode === 'workout' ? (
              <LogWorkout
                personId={user.id}
                onAdd={handleLogged}
                onCancel={() => { setTab('home'); setLogPerson(null); }}
              />
            ) : (
              <Steps workouts={workouts} persons={persons} onUpsertSteps={upsertSteps} userId={user.id} />
            )}
          </div>
        )}
        {tab === 'stats' && <Charts workouts={workouts} persons={persons} />}
        {tab === 'history' && <WeeklyHistory workouts={workouts} persons={persons} onDelete={deleteWorkout} userId={user?.id} />}
      </main>

      <nav className="bottom-nav">
        {TABS.map(({ id, Icon, label }) => {
          const showBadge = id === 'log' && stepsMissingToday && tab !== 'log';
          return (
            <button
              key={id}
              className={`nav-btn${tab === id ? ' active' : ''}${id === 'log' && tab === 'home' ? ' nav-btn--cta' : ''}`}
              onClick={() => {
                if (id !== 'log') setLogPerson(null);
                setTab(id);
              }}
            >
              <div className="nav-icon-wrap">
                <Icon size={20} strokeWidth={2} />
                {showBadge && <span className="nav-badge" />}
              </div>
              <span className="nav-label">{label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

function CopyableLink({ link }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button className="copy-btn copy-btn--inline" onClick={copy}>
      {copied ? 'Copied!' : 'Copy invite link'}
    </button>
  );
}
