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
import Crafting from './components/Crafting';
import { Sparkles, Trophy, Brush, X, Hammer, LayoutGrid } from 'lucide-react';
import './App.css';

function App() {
  const {
    pokemonId,
    pokemonData,
    level,
    xp,
    currentXp,
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
  const [inventory, setInventory] = useState(() => {
    const saved = localStorage.getItem('poke_inventory');
    return saved ? JSON.parse(saved) : { apricorns: 0, iron: 0, shards: 0, pokeballs: 0, greatballs: 0 };
  });
  const [researchProgress, setResearchProgress] = useState(() => {
    const saved = localStorage.getItem('poke_research');
    return saved ? JSON.parse(saved) : {}; // { 'Wash Dishes': count }
  });
  const [progressView, setProgressView] = useState('menu'); // menu, pokedex, history, crafting
  const [mobileTab, setMobileTab] = useState('quests'); // hq, quests, management
  const [inspectPokemonId, setInspectPokemonId] = useState(null);
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

  const todayStr = new Date().toISOString().split('T')[0];
  
  // Check-in and Recurrence Logic on app load
  useEffect(() => {
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
    localStorage.setItem('poke_inventory', JSON.stringify(inventory));
    localStorage.setItem('poke_research', JSON.stringify(researchProgress));

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
      const isAlpha = id === alphaInfo.choreId && new Date().getHours() < 12;
      setArchive(prev => [{ ...targetChore, completedAt: Date.now(), type, alphaBonus: isAlpha }, ...prev]);

      // Increment Research Progress
      setResearchProgress(prev => ({
        ...prev,
        [targetChore.text]: (prev[targetChore.text] || 0) + 1
      }));

      // Drop Mechanics
      const roll = Math.random();
      let drop = null;

      if (isAlpha) {
        drop = 'masterball_shard';
        setSnackbarMsg(`EARLY BIRD ALPHA! Found a Master Shard!`);
      } else if (type === 'daily' || type === 'one-time') {
        if (roll > 0.5) drop = 'apricorns';
        else if (roll > 0.2) drop = 'iron';
      } else {
        drop = 'shards';
      }

      if (drop) {
        setInventory(prev => ({ ...prev, [drop]: (prev[drop] || 0) + 1 }));
        if (!isAlpha) setSnackbarMsg(`Found 1x ${drop}!`);
      }

      handleDeleteChore(type, id);
      if (isAlpha) completeTask(xpToAward * 2); // Double XP for Alpha completed before noon
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

  const handleOnboardingComplete = (answers) => {
    setHasOnboarded(true);
    localStorage.setItem('poke_onboarded', 'true');

    changeBuddy(answers.starterId);

    const newChores = { daily: [], weekly: [], monthly: [] };

    if (answers.struggle === 'Procrastination') {
      newChores.daily.push({ id: Date.now() + 1, text: 'Do 1 small task for 5 mins', completed: false, xp: 20, type: 'daily' });
    } else if (answers.struggle === 'Forgetting') {
      newChores.daily.push({ id: Date.now() + 2, text: "Review tomorrow's schedule", completed: false, xp: 20, type: 'daily' });
    } else if (answers.struggle === 'Overworking') {
      newChores.daily.push({ id: Date.now() + 3, text: 'Take a 15 min mindful break', completed: false, xp: 20, type: 'daily' });
    }

    if (answers.habit === 'Morning') {
      newChores.daily.push({ id: Date.now() + 4, text: 'Morning stretch', completed: false, xp: 10, type: 'daily' });
    } else if (answers.habit === 'Night') {
      newChores.daily.push({ id: Date.now() + 5, text: 'Prepare for bed', completed: false, xp: 10, type: 'daily' });
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
            </div>

            <div className="badges-section mt-6">
              <h4 className="retro-text text-[10px] text-gray-500 mb-3">Earned Badges</h4>
              <div className="badges-grid">
                {[
                  { id: 1, name: 'Boulder', xp: 500, color: '#94a3b8' },
                  { id: 2, name: 'Cascade', xp: 1500, color: '#3b82f6' },
                  { id: 3, name: 'Thunder', xp: 3000, color: '#eab308' },
                  { id: 4, name: 'Rainbow', xp: 5000, color: '#ec4899' },
                  { id: 5, name: 'Soul', xp: 7500, color: '#a855f7' },
                  { id: 6, name: 'Marsh', xp: 10000, color: '#f97316' },
                  { id: 7, name: 'Volcano', xp: 15000, color: '#ef4444' },
                  { id: 8, name: 'Earth', xp: 20000, color: '#16a34a' },
                ].map(badge => (
                  <div
                    key={badge.id}
                    className={`badge-icon-wrapper ${trainerXp >= badge.xp ? 'earned' : 'locked'}`}
                    style={{ '--badge-color': badge.color }}
                    title={trainerXp >= badge.xp ? `${badge.name} Badge` : `Unlocks at ${badge.xp} XP`}
                  >
                    <Trophy size={16} />
                    <span className="badge-name-tooltip">{badge.name}</span>
                  </div>
                ))}
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

      <div className="mobile-column-tabs">
        <button 
          className={mobileTab === 'hq' ? 'active' : ''} 
          onClick={() => setMobileTab('hq')}
        >
          <img
            src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/back/${pokemonId}.gif`}
            alt="HQ"
            className="mobile-tab-buddy"
          />
          <span>HQ</span>
        </button>
        <button 
          className={mobileTab === 'quests' ? 'active' : ''} 
          onClick={() => setMobileTab('quests')}
        >
          <Sparkles size={20} />
          <span>Quests</span>
        </button>
        <button 
          className={mobileTab === 'management' ? 'active' : ''} 
          onClick={() => setMobileTab('management')}
        >
          <LayoutGrid size={20} />
          <span>Log</span>
        </button>
      </div>

      <main className="main-grid">
        {/* Column 1: HQ (Stats & Buddy) */}
        <div className={`column section-hq ${mobileTab === 'hq' ? 'mobile-active' : 'mobile-hidden'}`}>
          <ActivePokemon
            pokemonData={pokemonData}
            level={level}
            xp={currentXp}
            nextLevelXp={100}
            activeQuestsCount={Object.values(chores).flat().filter(c => !c.completed).length}
            onClick={() => {
              setMobileTab('management');
              setProgressView('pokedex');
              setInspectPokemonId(pokemonId);
            }}
          />

          <CheckInCalendar 
            checkIns={checkIns}
            onCheckIn={(date) => {
              const newCheckIns = [...checkIns, date];
              setCheckIns(newCheckIns);
              localStorage.setItem('poke_checkins', JSON.stringify(newCheckIns));
              setXp(prev => prev + 50);
              setSnackbarMsg("Check-in complete! +50 XP");
            }}
          />
        </div>

        {/* Column 2: Active Quests */}
        <div className={`column section-quests ${mobileTab === 'quests' ? 'mobile-active' : 'mobile-hidden'}`}>
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

        {/* Column 3: Progress (Management & History) */}
        <div className={`column section-progress ${mobileTab === 'management' ? 'mobile-active' : 'mobile-hidden'}`}>
          {progressView === 'menu' ? (
            <div className="management-menu glass-panel animate-pop-in">
              <h3 className="retro-text menu-title">Adventure Log</h3>
              <div className="menu-grid">
                <button className="menu-card" onClick={() => setProgressView('pokedex')}>
                  <Trophy className="text-yellow-400" size={32} />
                  <div className="menu-card-info">
                    <span className="card-label">Pokédex</span>
                    <span className="card-desc">Research & Collection</span>
                  </div>
                </button>
                <button className="menu-card" onClick={() => setProgressView('history')}>
                  <Sparkles className="text-blue-400" size={32} />
                  <div className="menu-card-info">
                    <span className="card-label">History</span>
                    <span className="card-desc">Completed Chore Log</span>
                  </div>
                </button>
                <button className="menu-card" onClick={() => setProgressView('crafting')}>
                  <Hammer className="text-orange-400" size={32} />
                  <div className="menu-card-info">
                    <span className="card-label">Crafting</span>
                    <span className="card-desc">Forge Pokéballs</span>
                  </div>
                </button>
              </div>
            </div>
          ) : (
            <div className="progress-subview-wrapper">
              <button className="back-to-menu-btn" onClick={() => setProgressView('menu')}>
                ← Back to Menu
              </button>
              
              {progressView === 'crafting' ? (
                <Crafting
                  inventory={inventory}
                  setInventory={setInventory}
                  onCraft={(name) => setSnackbarMsg(`Forged 1x ${name}!`)}
                />
              ) : progressView === 'history' ? (
                <div className="section-archive">
                  <TaskArchive archive={archive} />
                </div>
              ) : (
                <div className="section-collection">
                  <PokemonCollection
                    collection={collection}
                    currentBuddyId={pokemonId}
                    onChangeBuddy={changeBuddy}
                    researchProgress={researchProgress}
                    inspectPokemonId={inspectPokemonId}
                    setInspectPokemonId={setInspectPokemonId}
                  />
                </div>
              )}
            </div>
          )}
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
