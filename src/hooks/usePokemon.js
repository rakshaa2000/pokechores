import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';

const EVOLUTION_CHAINS = {
  // Gen 1
  1: { next: 2, level: 16 },     // Bulbasaur -> Ivysaur
  2: { next: 3, level: 32 },     // Ivysaur -> Venusaur
  4: { next: 5, level: 16 },     // Charmander -> Charmeleon
  5: { next: 6, level: 36 },     // Charmeleon -> Charizard
  7: { next: 8, level: 16 },     // Squirtle -> Wartortle
  8: { next: 9, level: 36 },     // Wartortle -> Blastoise
  // Gen 2
  152: { next: 153, level: 16 }, // Chikorita -> Bayleef
  153: { next: 154, level: 32 }, // Bayleef -> Meganium
  155: { next: 156, level: 14 }, // Cyndaquil -> Quilava
  156: { next: 157, level: 36 }, // Quilava -> Typhlosion
  158: { next: 159, level: 18 }, // Totodile -> Croconaw
  159: { next: 160, level: 30 }, // Croconaw -> Feraligatr
  // Gen 3
  252: { next: 253, level: 16 }, // Treecko -> Grovyle
  253: { next: 254, level: 36 }, // Grovyle -> Sceptile
  255: { next: 256, level: 16 }, // Torchic -> Combusken
  256: { next: 257, level: 36 }, // Combusken -> Blaziken
  258: { next: 259, level: 16 }, // Mudkip -> Marshtomp
  259: { next: 260, level: 36 }, // Marshtomp -> Swampert
  // Gen 4
  387: { next: 388, level: 18 }, // Turtwig -> Grotle
  388: { next: 389, level: 32 }, // Grotle -> Torterra
  390: { next: 391, level: 14 }, // Chimchar -> Monferno
  391: { next: 392, level: 36 }, // Monferno -> Infernape
  393: { next: 394, level: 16 }, // Piplup -> Prinplup
  394: { next: 395, level: 36 }, // Prinplup -> Empoleon
  // Gen 5
  495: { next: 496, level: 17 }, // Snivy -> Servine
  496: { next: 497, level: 36 }, // Servine -> Serperior
  498: { next: 499, level: 17 }, // Tepig -> Pignite
  499: { next: 500, level: 36 }, // Pignite -> Emboar
  501: { next: 502, level: 17 }, // Oshawott -> Dewott
  502: { next: 503, level: 36 }, // Dewott -> Samurott
  // Gen 6
  650: { next: 651, level: 16 }, // Chespin -> Quilladin
  651: { next: 652, level: 36 }, // Quilladin -> Chesnaught
  653: { next: 654, level: 16 }, // Fennekin -> Braixen
  654: { next: 655, level: 36 }, // Braixen -> Delphox
  656: { next: 657, level: 16 }, // Froakie -> Frogadier
  657: { next: 658, level: 36 }, // Frogadier -> Greninja
  // Gen 7
  722: { next: 723, level: 17 }, // Rowlet -> Dartrix
  723: { next: 724, level: 34 }, // Dartrix -> Decidueye
  725: { next: 726, level: 17 }, // Litten -> Torracat
  726: { next: 727, level: 34 }, // Torracat -> Incineroar
  728: { next: 729, level: 17 }, // Popplio -> Brionne
  729: { next: 730, level: 34 }, // Brionne -> Primarina
  // Gen 8
  810: { next: 811, level: 16 }, // Grookey -> Thwackey
  811: { next: 812, level: 35 }, // Thwackey -> Rillaboom
  813: { next: 814, level: 16 }, // Scorbunny -> Raboot
  814: { next: 815, level: 35 }, // Raboot -> Cinderace
  816: { next: 817, level: 16 }, // Sobble -> Drizzile
  817: { next: 818, level: 35 }, // Drizzile -> Inteleon
  // Gen 9
  906: { next: 907, level: 16 }, // Sprigatito -> Floragato
  907: { next: 908, level: 36 }, // Floragato -> Meowscarada
  909: { next: 910, level: 16 }, // Fuecoco -> Crocalor
  910: { next: 911, level: 36 }, // Crocalor -> Skeledirge
  912: { next: 913, level: 16 }, // Quaxly -> Quaquaval
  913: { next: 914, level: 36 }, // Quaquaval -> Quaquaval
};

const XP_PER_LEVEL = 100;

const STARTER_IDS = [
  1, 4, 7,       // Gen 1: Bulbasaur, Charmander, Squirtle
  152, 155, 158,  // Gen 2: Chikorita, Cyndaquil, Totodile
  252, 255, 258,  // Gen 3: Treecko, Torchic, Mudkip
  387, 390, 393,  // Gen 4: Turtwig, Chimchar, Piplup
  495, 498, 501,  // Gen 5: Snivy, Tepig, Oshawott
  650, 653, 656,  // Gen 6: Chespin, Fennekin, Froakie
  722, 725, 728,  // Gen 7: Rowlet, Litten, Popplio
  810, 813, 816,  // Gen 8: Grookey, Scorbunny, Sobble
  906, 909, 912,  // Gen 9: Sprigatito, Fuecoco, Quaxly
];

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

