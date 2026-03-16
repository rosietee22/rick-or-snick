import { useState } from 'react';
import { Home, Plus, Footprints, BarChart2, Trophy } from 'lucide-react';
import { useAuth } from './hooks/useAuth';
import { useCompetition } from './hooks/useCompetition';
import { useWorkouts } from './hooks/useWorkouts';
import LoginScreen from './components/LoginScreen';
import OnboardingScreen from './components/OnboardingScreen';
import Scoreboard from './components/Scoreboard';
import LogWorkout from './components/LogWorkout';
import Steps from './components/Steps';
import Charts from './components/Charts';
import WeeklyHistory from './components/WeeklyHistory';
import './index.css';

const TABS = [
  { id: 'home',    Icon: Home,       label: 'Home'    },
  { id: 'log',     Icon: Plus,       label: 'Log'     },
  { id: 'steps',   Icon: Footprints, label: 'Steps'   },
  { id: 'stats',   Icon: BarChart2,  label: 'Stats'   },
  { id: 'history', Icon: Trophy,     label: 'History' },
];

export default function App() {
  const { user, loading: authLoading } = useAuth();
  const { competition, persons, inviteToken, loading: compLoading, refresh: refreshComp } = useCompetition(user?.id);
  const { workouts, addWorkout, upsertSteps, deleteWorkout, loading: workoutsLoading, error } = useWorkouts(competition?.id);
  const [tab, setTab] = useState('home');
  const [logPerson, setLogPerson] = useState(null);

  const openLog = (personId) => {
    setLogPerson(personId);
    setTab('log');
  };

  const handleLogged = async (workout) => {
    await addWorkout(workout);
    setTab('home');
    setLogPerson(null);
  };

  // Still determining auth state
  if (authLoading) return null;

  // Not signed in
  if (!user) return <LoginScreen />;

  // Determining competition state
  if (compLoading) return null;

  // No competition yet — show create/join flow
  if (!competition) {
    return <OnboardingScreen user={user} onJoined={refreshComp} />;
  }

  const waitingForRival = !competition.player2_id;
  const inviteLink = inviteToken ? `${window.location.origin}?invite=${inviteToken}` : null;
  const loading = workoutsLoading;

  return (
    <div className="app">
      <header className="app-header">
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
          <Scoreboard workouts={workouts} persons={persons} onLog={openLog} loading={loading} />
        )}
        {tab === 'log' && (
          <LogWorkout
            persons={persons}
            initialPerson={logPerson}
            onAdd={handleLogged}
            onCancel={() => { setTab('home'); setLogPerson(null); }}
          />
        )}
        {tab === 'steps' && <Steps workouts={workouts} persons={persons} onUpsertSteps={upsertSteps} />}
        {tab === 'stats' && <Charts workouts={workouts} persons={persons} />}
        {tab === 'history' && <WeeklyHistory workouts={workouts} persons={persons} onDelete={deleteWorkout} />}
      </main>

      <nav className="bottom-nav">
        {TABS.map(({ id, Icon, label }) => (
          <button
            key={id}
            className={`nav-btn${tab === id ? ' active' : ''}`}
            onClick={() => {
              if (id !== 'log') setLogPerson(null);
              setTab(id);
            }}
          >
            <Icon size={20} strokeWidth={2} />
            <span className="nav-label">{label}</span>
          </button>
        ))}
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
