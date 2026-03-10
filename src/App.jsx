import { useState } from 'react';
import { Home, Plus, Footprints, BarChart2, Trophy } from 'lucide-react';
import { useWorkouts } from './hooks/useWorkouts';
import Scoreboard from './components/Scoreboard';
import LogWorkout from './components/LogWorkout';
import Steps from './components/Steps';
import Charts from './components/Charts';
import WeeklyHistory from './components/WeeklyHistory';
import './index.css';

export const PERSONS = [
  { id: 'person1', name: 'Phoebe', chartColor: '#0057FF' },
  { id: 'person2', name: 'Rosie',  chartColor: '#111111' },
];

const TABS = [
  { id: 'home',    Icon: Home,       label: 'Home'    },
  { id: 'log',     Icon: Plus,       label: 'Log'     },
  { id: 'steps',   Icon: Footprints, label: 'Steps'   },
  { id: 'stats',   Icon: BarChart2,  label: 'Stats'   },
  { id: 'history', Icon: Trophy,     label: 'History' },
];

export default function App() {
  const { workouts, addWorkout, upsertSteps, loading, error } = useWorkouts();
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

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">Rick or Snick</h1>
        <p className="app-sub">Who&rsquo;s winning this week?</p>
      </header>

      <main className="app-main">
        {error && (
          <div className="db-error">
            Database not connected. Check your <code>.env.local</code> Supabase keys.
          </div>
        )}
        {tab === 'home' && (
          <Scoreboard workouts={workouts} persons={PERSONS} onLog={openLog} loading={loading} />
        )}
        {tab === 'log' && (
          <LogWorkout
            persons={PERSONS}
            initialPerson={logPerson}
            onAdd={handleLogged}
            onCancel={() => { setTab('home'); setLogPerson(null); }}
          />
        )}
        {tab === 'steps' && <Steps workouts={workouts} persons={PERSONS} onUpsertSteps={upsertSteps} />}
        {tab === 'stats' && <Charts workouts={workouts} persons={PERSONS} />}
        {tab === 'history' && <WeeklyHistory workouts={workouts} persons={PERSONS} />}
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
