import React, { useState, useEffect } from 'react';
import { usePokemon } from './hooks/usePokemon';
import ActivePokemon from './components/ActivePokemon';
import ChoreList from './components/ChoreList';
import PokemonCollection from './components/PokemonCollection';
import BossBattle from './components/BossBattle';
import Snackbar from './components/Snackbar';
import CheckInCalendar from './components/CheckInCalendar';
import TaskArchive from './components/TaskArchive';
import WildEncounterSplash from './components/WildEncounterSplash';
import ProgressBanner from './components/ProgressBanner';
import { Sparkles, Trophy } from 'lucide-react';
import './App.css';

const QUIRKY_TASKS = [
  { text: "Hydrate or diedrate (Drink water)", xp: 15, label: "Self Care" },
  { text: "Stretch like a sleepy Meowth", xp: 10, label: "Zen Mode" },
  { text: "Eat a vegetable (fries don't count)", xp: 20, label: "Brain Fuel" },
  { text: "Step outside and touch some grass", xp: 15, label: "Zen Mode" },
  { text: "5 minutes of deep breathing", xp: 10, label: "Zen Mode" },
  { text: "Wipe down a surface that looks sad", xp: 20, label: "Adulting" },
  { text: "Unclench your jaw & drop shoulders", xp: 5, label: "Self Care" },
  { text: "Do a silly little dance", xp: 10, label: "Brain Fuel" }
];

const getRandomTasks = (count) => {
  const shuffled = [...QUIRKY_TASKS].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count).map(t => ({
    ...t,
    id: Date.now() + Math.random(),
    completed: false
  }));
};

const simulateTaskApi = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        daily: getRandomTasks(1)[0],
        weekly: getRandomTasks(1)[0],
        monthly: getRandomTasks(1)[0]
      });
    }, 500); // 500ms delay to simulate network
  });
};

function App() {
  const { 
    pokemonId, 
    pokemonData, 
    level, 
    xp, 
    trainerXp,
    loading, 
    evolving, 
    completeTask, 
    xpPercent,
    collection,
    changeBuddy,
    activeBoss,
    tasksUntilBoss
  } = usePokemon(); 
  
  const [chores, setChores] = useState(() => {
    const saved = localStorage.getItem('poke_chores');
    if (saved) return JSON.parse(saved);
    
    return {
      daily: [],
      weekly: [],
      monthly: []
    };
  });

  const [archive, setArchive] = useState(() => {
    const saved = localStorage.getItem('poke_archive');
    return saved ? JSON.parse(saved) : [];
  });

  const [checkIns, setCheckIns] = useState(() => {
    const saved = localStorage.getItem('poke_checkins');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeTab, setActiveTab] = useState('buddy');
  const [snackbarMsg, setSnackbarMsg] = useState(null);
  const [showEncounterSplash, setShowEncounterSplash] = useState(false);
  const prevBossRef = React.useRef(null);

  // Encounter & Catch Logic
  useEffect(() => {
    if (activeBoss && !prevBossRef.current) {
      setShowEncounterSplash(true);
      setTimeout(() => setShowEncounterSplash(false), 3500);
    }
    
    if (!activeBoss && prevBossRef.current && prevBossRef.current.currentHp <= 0) {
      setSnackbarMsg(`Gotcha! ${prevBossRef.current.data.name} was caught!`);
    }
    
    prevBossRef.current = activeBoss;
  }, [activeBoss]);

  // Check-in, Fetch API tasks, and Recurrence Logic on app load
  useEffect(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const savedCheckins = JSON.parse(localStorage.getItem('poke_checkins') || '[]');

    let shouldFetch = false;

    if (!savedCheckins.includes(todayStr)) {
      const newCheckins = [...savedCheckins, todayStr];
      setCheckIns(newCheckins);
      shouldFetch = true;
    } else {
      setCheckIns(savedCheckins);
    }

    // Handle Recurrence from Archive
    const now = Date.now();
    const msPerDay = 24 * 60 * 60 * 1000;
    let respawnedTasks = { daily: [], weekly: [], monthly: [] };
    let tasksToKeepInArchive = [];

    archive.forEach(task => {
      if (task.deadline && new Date(task.deadline).getTime() < now) {
        tasksToKeepInArchive.push(task);
        return;
      }

      const timeSinceCompletion = now - task.completedAt;
      let shouldRespawn = false;

      if (task.type === 'daily' && timeSinceCompletion > msPerDay * 0.5) {
        const completedDateStr = new Date(task.completedAt).toISOString().split('T')[0];
        if (completedDateStr !== todayStr) shouldRespawn = true;
      } else if (task.type === 'weekly' && timeSinceCompletion > msPerDay * 7) {
        shouldRespawn = true;
      } else if (task.type === 'monthly' && timeSinceCompletion > msPerDay * 30) {
        shouldRespawn = true;
      }

      if (shouldRespawn) {
        respawnedTasks[task.type].push({
          ...task,
          id: Date.now() + Math.random(),
          completed: false,
          completedAt: null
        });
      } else {
        tasksToKeepInArchive.push(task);
      }
    });

    if (shouldFetch || respawnedTasks.daily.length > 0 || respawnedTasks.weekly.length > 0 || respawnedTasks.monthly.length > 0) {
      if (shouldFetch) {
        simulateTaskApi().then(newTasks => {
          setChores(prev => {
            const addUnique = (existing, incoming) => {
              const res = [...incoming];
              existing.forEach(e => { if (!res.some(r => r.text === e.text)) res.push(e); });
              return res;
            };
            return {
              daily: addUnique(prev.daily, [newTasks.daily, ...respawnedTasks.daily]),
              weekly: addUnique(prev.weekly, [newTasks.weekly, ...respawnedTasks.weekly]),
              monthly: addUnique(prev.monthly, [newTasks.monthly, ...respawnedTasks.monthly])
            };
          });
          setArchive(tasksToKeepInArchive);
          setSnackbarMsg("A wild task appeared!");
        });
      } else {
        setChores(prev => {
          const addUnique = (existing, incoming) => {
            const res = [...incoming];
            existing.forEach(e => { if (!res.some(r => r.text === e.text)) res.push(e); });
            return res;
          };
          return {
            daily: addUnique(prev.daily, respawnedTasks.daily),
            weekly: addUnique(prev.weekly, respawnedTasks.weekly),
            monthly: addUnique(prev.monthly, respawnedTasks.monthly)
          };
        });
        setArchive(tasksToKeepInArchive);
      }
    }

  }, []);

  useEffect(() => {
    localStorage.setItem('poke_chores', JSON.stringify(chores));
    localStorage.setItem('poke_checkins', JSON.stringify(checkIns));
    localStorage.setItem('poke_archive', JSON.stringify(archive));
    
    const now = new Date();
    let foundReminder = false;
    
    Object.values(chores).flat().forEach(chore => {
      if (chore.deadline && !chore.completed && chore.reminder && !foundReminder) {
        const deadlineDate = new Date(chore.deadline);
        const timeDiff = deadlineDate - now;
        
        if (timeDiff > 0 && timeDiff < 4 * 60 * 60 * 1000) {
          setSnackbarMsg(`Reminder: "${chore.text}" is due soon!`);
          foundReminder = true;
        } else if (timeDiff < 0 && timeDiff > -24 * 60 * 60 * 1000) {
          setSnackbarMsg(`Overdue: "${chore.text}" needs your attention!`);
          foundReminder = true;
        }
      }
    });
  }, [chores, checkIns, archive]);

  const handleAddChore = (type, choreData) => {
    const xpReward = type === 'daily' ? 10 : type === 'weekly' ? 30 : 50;
    const newChore = {
      id: Date.now(),
      text: choreData.text,
      label: choreData.label || '',
      deadline: choreData.deadline || null,
      reminder: choreData.reminder || false,
      completed: false,
      xp: xpReward,
      type: type
    };
    
    setChores(prev => ({
      ...prev,
      [type]: [...prev[type], newChore]
    }));
  };

  const handleToggleChore = (type, id) => {
    const targetChore = chores[type].find(c => c.id === id);
    if (!targetChore || targetChore.completed) return;

    completeTask(targetChore.xp);
    
    setChores(prev => {
      const typeChores = prev[type];
      const choreIndex = typeChores.findIndex(c => c.id === id);
      
      if (choreIndex === -1 || typeChores[choreIndex].completed) return prev;

      const newChores = [...typeChores];
      newChores[choreIndex] = { ...typeChores[choreIndex], completed: true };
      return { ...prev, [type]: newChores };
    });

    setTimeout(() => {
      setArchive(prev => [{ ...targetChore, completedAt: Date.now(), type }, ...prev]);
      handleDeleteChore(type, id);
    }, 500);
  };

  const handleDeleteChore = (type, id) => {
    setChores(prev => ({
      ...prev,
      [type]: prev[type].filter(c => c.id !== id)
    }));
  };

  return (
    <div className={`app-container main-tab-${activeTab === 'daily' || activeTab === 'weekly' || activeTab === 'monthly' ? 'quests' : activeTab}`}>
      {showEncounterSplash && activeBoss && (
        <WildEncounterSplash bossData={activeBoss.data} />
      )}
      
      <header className="app-header">
        <div className="logo-container">
          <div className="icon-wrapper">
            <Trophy className="icon gold" />
          </div>
          <h1 className="retro-text title-gradient">PokeCare</h1>
        </div>
        
        <div className="xp-container">
          <Sparkles className="icon small gold" />
          <span className="xp-text">Total XP: {trainerXp}</span>
        </div>
      </header>

      <ProgressBanner 
        activeBoss={activeBoss} 
        tasksUntilBoss={tasksUntilBoss} 
      />

      <nav className="mobile-nav">
        <button 
          className={activeTab === 'buddy' ? 'active' : ''} 
          onClick={() => setActiveTab('buddy')}
        >
          <div className="nav-icon-wrapper">
            <img 
              src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/back/25.gif" 
              alt="Buddy" 
              className="nav-buddy-img"
            />
          </div>
          <span>Buddy</span>
        </button>
        <button 
          className={['daily', 'weekly', 'monthly'].includes(activeTab) ? 'active' : ''} 
          onClick={() => setActiveTab('daily')}
        >
          <Sparkles size={20} />
          <span>Quests</span>
        </button>
        <button 
          className={activeTab === 'collection' ? 'active' : ''} 
          onClick={() => setActiveTab('collection')}
        >
          <Trophy size={20} />
          <span>Collection</span>
        </button>
        <button 
          className={activeTab === 'archive' ? 'active' : ''} 
          onClick={() => setActiveTab('archive')}
        >
          <Trophy size={20} className="icon-rotate" />
          <span>Archive</span>
        </button>
      </nav>

      <main className="main-grid">
        <div className="left-column section-buddy">
          <ActivePokemon 
            pokemonData={pokemonData} 
            level={level} 
            xpPercent={xpPercent} 
            loading={loading}
            evolving={evolving}
          />
          
          <div className="glass-panel stats-panel">
            <div className="stats-header-with-avatar flex items-center gap-4 mb-4">
              <div className="trainer-avatar-wrapper bg-black/30 p-2 rounded-full border border-white/10">
                <img 
                  src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/back/25.gif" 
                  alt="Trainer Buddy" 
                  className="w-12 h-12 object-contain"
                />
              </div>
              <h3 className="retro-text stats-title m-0">Trainer Stats</h3>
            </div>
            <div className="stats-list">
              <div className="stat-row">
                <span className="stat-label">Current Buddy</span>
                <span className="stat-value capitalize">
                  {pokemonData?.name || '???'}
                </span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Buddy XP</span>
                <span className="stat-value">{xp}</span>
              </div>
            </div>
          </div>
          
          <CheckInCalendar checkIns={checkIns} />
        </div>

        <div className="right-column">
          <div className="section-quests">
            <BossBattle activeBoss={activeBoss} />
            
            <div className="tabs-container">
              {['daily', 'weekly', 'monthly'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`tab-button ${activeTab === tab ? 'active' : ''}`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="chore-list-wrapper animate-pop-in">
              {['daily', 'weekly', 'monthly'].includes(activeTab) ? (
                <ChoreList 
                  type={activeTab}
                  chores={chores[activeTab]}
                  onAdd={handleAddChore}
                  onToggle={handleToggleChore}
                  onDelete={handleDeleteChore}
                />
              ) : (
                <ChoreList 
                  type="daily"
                  chores={chores.daily}
                  onAdd={handleAddChore}
                  onToggle={handleToggleChore}
                  onDelete={handleDeleteChore}
                />
              )}
            </div>
          </div>

          <div className="section-collection">
            <PokemonCollection 
              collection={collection} 
              currentBuddyId={pokemonId} 
              onChangeBuddy={changeBuddy} 
            />
          </div>

          <div className="section-archive">
            <TaskArchive archive={archive} />
          </div>
        </div>
      </main>

      <Snackbar 
        message={snackbarMsg} 
        onClose={() => setSnackbarMsg(null)} 
      />
    </div>
  );
}

export default App;
