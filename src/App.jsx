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
import Onboarding from './components/Onboarding';
import WispsHunt from './components/WispsHunt';
import QuickAdd from './components/QuickAdd';
import { Sparkles, Trophy, Brush, X } from 'lucide-react';
import './App.css';

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
    const base = { daily: [], weekly: [], monthly: [], 'one-time': [] };
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { ...base, ...parsed };
      } catch (e) {
        return base;
      }
    }
    return base;
  });

  const [archive, setArchive] = useState(() => {
    const saved = localStorage.getItem('poke_archive');
    return saved ? JSON.parse(saved) : [];
  });

  const [checkIns, setCheckIns] = useState(() => {
    const saved = localStorage.getItem('poke_checkins');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeTab, setActiveTab] = useState('daily');
  const [snackbarMsg, setSnackbarMsg] = useState(null);
  const [showEncounterSplash, setShowEncounterSplash] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const prevBossRef = React.useRef(null);

  const [hasOnboarded, setHasOnboarded] = useState(() => {
    return localStorage.getItem('poke_onboarded') === 'true';
  });
  
  const [wispsCompleted, setWispsCompleted] = useState(() => {
    const saved = localStorage.getItem('poke_wisps_date');
    const today = new Date().toISOString().split('T')[0];
    return saved === today;
  });

  const [alphaInfo, setAlphaInfo] = useState(() => {
    const saved = localStorage.getItem('poke_alpha');
    return saved ? JSON.parse(saved) : { date: null, choreId: null };
  });

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

  // Check-in and Recurrence Logic on app load
  useEffect(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const savedCheckins = JSON.parse(localStorage.getItem('poke_checkins') || '[]');

    if (!savedCheckins.includes(todayStr)) {
      const newCheckins = [...savedCheckins, todayStr];
      setCheckIns(newCheckins);
    } else {
      setCheckIns(savedCheckins);
    }

    // Handle Recurrence from Archive
    const now = Date.now();
    const msPerDay = 24 * 60 * 60 * 1000;
    let respawnedTasks = { daily: [], weekly: [], monthly: [], 'one-time': [] };
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

    if (respawnedTasks.daily.length > 0 || respawnedTasks.weekly.length > 0 || respawnedTasks.monthly.length > 0) {
      setChores(prev => {
        const addUnique = (existing, incoming) => {
          const res = [...incoming];
          existing.forEach(e => { if (!res.some(r => r.text === e.text)) res.push(e); });
          return res;
        };
        const newChores = {
          daily: addUnique(prev.daily, respawnedTasks.daily),
          weekly: addUnique(prev.weekly, respawnedTasks.weekly),
          monthly: addUnique(prev.monthly, respawnedTasks.monthly),
          'one-time': prev['one-time'] || []
        };
        
        // Alpha Chore Logic
        const savedAlpha = JSON.parse(localStorage.getItem('poke_alpha') || '{"date":null,"choreId":null}');
        if (savedAlpha.date !== todayStr) {
          const pendingDaily = newChores.daily.filter(c => !c.completed);
          if (pendingDaily.length > 0) {
             const randomChore = pendingDaily[Math.floor(Math.random() * pendingDaily.length)];
             const newAlphaInfo = { date: todayStr, choreId: randomChore.id };
             setAlphaInfo(newAlphaInfo);
             localStorage.setItem('poke_alpha', JSON.stringify(newAlphaInfo));
          }
        }

        return newChores;
      });
      setArchive(tasksToKeepInArchive);
    } else {
      // Alpha Chore Logic (when no respawns)
      setChores(prev => {
        const savedAlpha = JSON.parse(localStorage.getItem('poke_alpha') || '{"date":null,"choreId":null}');
        if (savedAlpha.date !== todayStr) {
          const pendingDaily = prev.daily.filter(c => !c.completed);
          if (pendingDaily.length > 0) {
             const randomChore = pendingDaily[Math.floor(Math.random() * pendingDaily.length)];
             const newAlphaInfo = { date: todayStr, choreId: randomChore.id };
             setAlphaInfo(newAlphaInfo);
             localStorage.setItem('poke_alpha', JSON.stringify(newAlphaInfo));
          }
        }
        return prev;
      });
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
    setActiveTab(type);
  };

  const handleToggleChore = (type, id, dynamicXp) => {
    const targetChore = chores[type].find(c => c.id === id);
    if (!targetChore || targetChore.completed) return;

    const xpToAward = dynamicXp || targetChore.xp;
    completeTask(xpToAward);
    
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

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.code === 'Space') {
        e.preventDefault();
        setShowQuickAdd(true);
      }
      if (e.key === 'Escape') {
        setShowQuickAdd(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const userRank = Math.min(10, Math.floor(trainerXp / 500) + 1);
  const todayStr = new Date().toISOString().split('T')[0];

  const handleOnboardingComplete = (answers) => {
    setHasOnboarded(true);
    localStorage.setItem('poke_onboarded', 'true');
    
    changeBuddy(answers.starterId);

    const newChores = { daily: [], weekly: [], monthly: [] };
    
    if (answers.struggle === 'Procrastination') {
      newChores.daily.push({ id: Date.now()+1, text: 'Do 1 small task for 5 mins', completed: false, xp: 20, type: 'daily' });
    } else if (answers.struggle === 'Forgetting') {
      newChores.daily.push({ id: Date.now()+2, text: "Review tomorrow's schedule", completed: false, xp: 20, type: 'daily' });
    } else if (answers.struggle === 'Overworking') {
      newChores.daily.push({ id: Date.now()+3, text: 'Take a 15 min mindful break', completed: false, xp: 20, type: 'daily' });
    }

    if (answers.habit === 'Morning') {
      newChores.daily.push({ id: Date.now()+4, text: 'Morning stretch', completed: false, xp: 10, type: 'daily' });
    } else if (answers.habit === 'Night') {
      newChores.daily.push({ id: Date.now()+5, text: 'Prepare for bed', completed: false, xp: 10, type: 'daily' });
    }

    setChores(prev => ({
      ...prev,
      daily: [...prev.daily, ...newChores.daily]
    }));
  };

  const handleWispsComplete = () => {
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem('poke_wisps_date', today);
    setWispsCompleted(true);
    setSnackbarMsg('You collected all the Wisps! A rare ghost approaches...');
  };

  return (
    <div className={`app-container main-tab-${activeTab === 'daily' || activeTab === 'weekly' || activeTab === 'monthly' || activeTab === 'one-time' ? 'quests' : activeTab}`}>
      {!hasOnboarded && <Onboarding onComplete={handleOnboardingComplete} />}
      {!wispsCompleted && hasOnboarded && <WispsHunt onComplete={handleWispsComplete} />}
      {showQuickAdd && <QuickAdd onAdd={handleAddChore} onClose={() => setShowQuickAdd(false)} />}
      
      {showStats && (
        <div className="quick-add-overlay" onClick={() => setShowStats(false)}>
          <div className="glass-panel stats-modal animate-pop-in" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="retro-text">Trainer Profile</h3>
              <button onClick={() => setShowStats(false)} className="close-btn-mini"><X size={20} /></button>
            </div>
            <div className="stats-list" style={{ padding: '1.5rem 0' }}>
              <div className="stat-row">
                <span className="stat-label">Current Buddy</span>
                <span className="stat-value capitalize">{pokemonData?.name || '???'}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Trainer Rank</span>
                <span className="stat-value">{userRank}-Star</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Total XP</span>
                <span className="stat-value">{trainerXp}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Buddy XP</span>
                <span className="stat-value">{xp}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Badges Earned</span>
                <span className="stat-value">{Math.floor(trainerXp / 1000)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {showEncounterSplash && activeBoss && (
        <WildEncounterSplash bossData={activeBoss.data} />
      )}
      
      <header className="app-header">
        <div className="logo-container">
          <span className="app-logo-emoji">🧹</span>
          <h1 className="retro-text title-gradient">PokeChore</h1>
        </div>
        
        <div className="xp-container pointer" onClick={() => setShowStats(true)}>
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
          className={['daily', 'weekly', 'monthly', 'one-time'].includes(activeTab) ? 'active' : ''} 
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
        {/* Column 1: HQ (Stats & Buddy) */}
        <div className="column section-hq">
          <ActivePokemon 
            pokemonData={pokemonData} 
            level={level} 
            xpPercent={xpPercent} 
            loading={loading}
            evolving={evolving}
          />
          
          <CheckInCalendar checkIns={checkIns} />
        </div>

        {/* Column 2: Active Quests */}
        <div className="column section-quests">
          <BossBattle activeBoss={activeBoss} />
          
          <div className="tabs-container">
            {['daily', 'weekly', 'monthly', 'one-time'].map(tab => (
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
            {['daily', 'weekly', 'monthly', 'one-time'].includes(activeTab) ? (
              <ChoreList 
                type={activeTab}
                chores={chores[activeTab] || []}
                onAdd={handleAddChore}
                onToggle={handleToggleChore}
                onDelete={handleDeleteChore}
                alphaChoreId={alphaInfo.date === todayStr ? alphaInfo.choreId : null}
              />
            ) : (
              <ChoreList 
                type="daily"
                chores={chores.daily}
                onAdd={handleAddChore}
                onToggle={handleToggleChore}
                onDelete={handleDeleteChore}
                alphaChoreId={alphaInfo.date === todayStr ? alphaInfo.choreId : null}
              />
            )}
          </div>
        </div>

        {/* Column 3: Progress (Collection & History) */}
        <div className="column section-progress">
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
