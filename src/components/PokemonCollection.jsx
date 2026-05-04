import React, { useEffect, useState } from 'react';
import ResearchModal from './ResearchModal';
import './PokemonCollection.css';

export default function PokemonCollection({ 
  collection, 
  currentBuddyId, 
  onChangeBuddy, 
  researchProgress,
  inspectPokemonId,
  setInspectPokemonId
}) {
  const [pokemonDetails, setPokemonDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPokemon, setSelectedPokemon] = useState(null);

  useEffect(() => {
    async function fetchCollection() {
      setLoading(true);
      try {
        const promises = collection.map(p => 
          fetch(`https://pokeapi.co/api/v2/pokemon/${p.id}`).then(res => res.json())
        );
        const results = await Promise.all(promises);
        
        // Combine API data with our XP data
        const combined = results.map(data => {
          const ourData = collection.find(p => p.id === data.id);
          return {
            ...data,
            xp: ourData?.xp || 0
          };
        });
        
        setPokemonDetails(combined);
      } catch (err) {
        console.error("Failed to fetch collection", err);
      } finally {
        setLoading(false);
      }
    }
    
    if (collection && collection.length > 0) {
      fetchCollection();
    }
  }, [collection]);

  useEffect(() => {
    if (inspectPokemonId) {
      const pokemon = pokemonDetails.find(p => p.id === inspectPokemonId);
      if (pokemon) {
        setSelectedPokemon(pokemon);
      }
    }
  }, [inspectPokemonId, pokemonDetails]);

  if (loading) {
    return (
      <div className="collection-loading">
        <div className="pulse-loader">
          <div className="loader-circle"></div>
          <div className="loader-bar"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="pokemon-collection-grid">
      {[...pokemonDetails].reverse().map(pokemon => {
        const isBuddy = pokemon.id === currentBuddyId;
        const primaryType = pokemon.types[0].type.name;
        const typeColorVar = `var(--type-${primaryType}, var(--type-normal))`;
        const level = 5 + Math.floor(pokemon.xp / 100);
        
        return (
          <div 
            key={pokemon.id} 
            className={`collection-card ${isBuddy ? 'is-buddy' : ''}`}
            onClick={() => setSelectedPokemon(pokemon)}
            style={{
              '--card-color': typeColorVar
            }}
          >
            <div className="card-bg" style={{ backgroundColor: typeColorVar }}></div>
            {isBuddy && <div className="buddy-badge-mini"></div>}
            
            <img 
              src={pokemon.sprites.front_default} 
              alt={pokemon.name} 
              className="collection-sprite"
            />
          </div>
        );
      })}

      {selectedPokemon && (
        <ResearchModal 
          pokemon={selectedPokemon} 
          researchProgress={researchProgress}
          isBuddy={selectedPokemon.id === currentBuddyId}
          onSetBuddy={onChangeBuddy}
          onClose={() => {
            setSelectedPokemon(null);
            setInspectPokemonId(null);
          }}
        />
      )}
    </div>
  );
}
