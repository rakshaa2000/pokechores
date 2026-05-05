import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';

const EVOLUTION_CHAINS = {
  1: { next: 2, level: 16 }, // Bulbasaur -> Ivysaur
  2: { next: 3, level: 32 }, // Ivysaur -> Venusaur
  4: { next: 5, level: 16 }, // Charmander -> Charmeleon
  5: { next: 6, level: 36 }, // Charmeleon -> Charizard
  7: { next: 8, level: 16 }, // Squirtle -> Wartortle
  8: { next: 9, level: 36 }, // Wartortle -> Blastoise
};

const XP_PER_LEVEL = 100;

const STARTER_IDS = [1, 4, 7, 152, 155, 158];

export function usePokemon() {
  const [pokemonId, setPokemonId] = useState(() => {
    const saved = localStorage.getItem('poke_id');
    if (saved) return parseInt(saved, 10);
    // Default to Bulbasaur; onboarding will override with the user's chosen starter
    return 1;
  });
  
  const [totalTrainerXp, setTotalTrainerXp] = useState(() => {
    const saved = localStorage.getItem('poke_trainer_xp');
    return saved ? parseInt(saved, 10) : 0;
  });

  const [collection, setCollection] = useState(() => {
    const saved = localStorage.getItem('poke_collection');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.length > 0 && typeof parsed[0] === 'number') {
        return parsed.map(id => ({ id, xp: 0 }));
      }
      return parsed;
    }
    return [{ id: pokemonId, xp: 0 }];
  });

  const [pokemonData, setPokemonData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [evolving, setEvolving] = useState(false);

  // Boss Battle State
  const [tasksUntilBoss, setTasksUntilBoss] = useState(() => {
    const saved = localStorage.getItem('poke_tasks_until_boss');
    return saved ? parseInt(saved, 10) : 5;
  });
  const [activeBoss, setActiveBoss] = useState(() => {
    const saved = localStorage.getItem('poke_active_boss');
    return saved ? JSON.parse(saved) : null;
  });

  const activePokemonInCollection = collection.find(p => p.id === pokemonId) || collection[0];
  const pokemonXp = activePokemonInCollection?.xp || 0;
  const level = 5 + Math.floor(pokemonXp / XP_PER_LEVEL);
  const currentXp = pokemonXp % XP_PER_LEVEL;

  useEffect(() => {
    localStorage.setItem('poke_id', pokemonId);
    localStorage.setItem('poke_collection', JSON.stringify(collection));
    localStorage.setItem('poke_tasks_until_boss', tasksUntilBoss);
    localStorage.setItem('poke_active_boss', JSON.stringify(activeBoss));
    localStorage.setItem('poke_trainer_xp', totalTrainerXp);
  }, [pokemonId, collection, tasksUntilBoss, activeBoss, totalTrainerXp]);

  useEffect(() => {
    async function fetchPokemon() {
      setLoading(true);
      try {
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`);
        const data = await res.json();
        setPokemonData(data);
      } catch (error) {
        console.error("Failed to fetch pokemon", error);
      } finally {
        setLoading(false);
      }
    }
    fetchPokemon();
  }, [pokemonId]);

  const triggerBossEncounter = async () => {
    const randomId = Math.floor(Math.random() * 151) + 1;
    try {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${randomId}`);
      const data = await res.json();
      setActiveBoss({
        data,
        maxHp: 3,
        currentHp: 3,
        level: Math.floor(Math.random() * 20) + 15
      });
    } catch (err) {
      console.error("Failed to fetch boss", err);
    }
  };

  const dealDamage = () => {
    if (activeBoss) {
      setActiveBoss(prev => {
        if (!prev) return prev;
        return { ...prev, currentHp: prev.currentHp - 1 };
      });
      return true;
    }
    return false;
  };

  useEffect(() => {
    if (activeBoss && activeBoss.currentHp <= 0) {
      // Boss Defeated!
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#4ade80', '#60a5fa', '#f472b6'],
        zIndex: 9999
      });
      
      const bossInitialXp = (activeBoss.level - 5) * XP_PER_LEVEL;

      setCollection(curr => {
        if (!curr.some(p => p.id === activeBoss.data.id)) {
          return [...curr, { 
            id: activeBoss.data.id, 
            xp: bossInitialXp,
            types: activeBoss.data.types.map(t => t.type.name)
          }];
        }
        return curr;
      });
      setTasksUntilBoss(5);
      setActiveBoss(null);
    }
  }, [activeBoss]);

  useEffect(() => {
    if (pokemonData && collection.length > 0) {
      setCollection(curr => curr.map(p => {
        if (p.id === pokemonId && !p.types) {
          return { ...p, types: pokemonData.types.map(t => t.type.name) };
        }
        return p;
      }));
    }
  }, [pokemonData]);

  const completeTask = (amount) => {
    if (activeBoss) {
      dealDamage();
    } else {
      setTasksUntilBoss(prev => {
        const next = prev - 1;
        if (next <= 0) {
          triggerBossEncounter();
          return 0;
        }
        return next;
      });
    }
    
    // Grant XP to the trainer
    setTotalTrainerXp(prev => prev + amount);
    
    // Always grant XP to the active buddy
    setCollection(prev => {
      return prev.map(p => {
        if (p.id === pokemonId) {
          const newXp = p.xp + amount;
          const oldLevel = 5 + Math.floor(p.xp / XP_PER_LEVEL);
          const newLevel = 5 + Math.floor(newXp / XP_PER_LEVEL);
          
          if (newLevel > oldLevel) {
            const evolution = EVOLUTION_CHAINS[p.id];
            if (evolution && newLevel >= evolution.level) {
              setEvolving(true);
              setTimeout(() => {
                setPokemonId(evolution.next);
                setCollection(curr => {
                  return curr.map(item => {
                    if (item.id === p.id) {
                      return { ...item, id: evolution.next };
                    }
                    return item;
                  });
                });
                setEvolving(false);
              }, 3000);
            }
          }
          return { ...p, xp: newXp };
        }
        return p;
      });
    });
  };

  const changeBuddy = (id) => {
    setPokemonId(id);
    // If the user just onboarded (collection only has the default placeholder),
    // replace the placeholder entry with their chosen starter
    setCollection(prev => {
      if (prev.length === 1 && !localStorage.getItem('poke_onboarded_buddy_set')) {
        localStorage.setItem('poke_onboarded_buddy_set', 'true');
        return [{ id, xp: 0 }];
      }
      // If the new buddy isn't in the collection yet, add it
      if (!prev.some(p => p.id === id)) {
        return [...prev, { id, xp: 0 }];
      }
      return prev;
    });
  };

  return {
    pokemonId,
    pokemonData,
    level,
    xp: pokemonXp,
    trainerXp: totalTrainerXp,
    currentXp,
    loading,
    evolving,
    completeTask,
    collection,
    changeBuddy,
    xpPercent: (currentXp / XP_PER_LEVEL) * 100,
    activeBoss,
    tasksUntilBoss
  };
}

