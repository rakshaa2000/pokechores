import React from 'react';
import './ActivePokemon.css';

export default function ActivePokemon({ pokemonData, level, xpPercent, loading, evolving }) {
  if (loading || !pokemonData) {
    return (
      <div className="glass-panel active-pokemon-container loading-state">
        <div className="pulse-loader">
          <div className="loader-circle"></div>
          <div className="loader-bar"></div>
        </div>
      </div>
    );
  }

  // Get primary type to set theme colors
  const primaryType = pokemonData.types[0].type.name;
  const typeColorVar = `var(--type-${primaryType}, var(--type-normal))`;
  
  // Use animated sprite if available, otherwise fallback to official artwork or default sprite
  const spriteUrl = pokemonData.sprites.versions['generation-v']['black-white'].animated.front_default 
                 || pokemonData.sprites.front_default;

  return (
    <div 
      className="glass-panel active-pokemon-container"
      style={{
        boxShadow: `0 8px 32px 0 ${typeColorVar}33`,
        borderColor: `${typeColorVar}66`
      }}
    >
      {/* Background glow based on type */}
      <div 
        className="type-glow"
        style={{ background: typeColorVar }}
      ></div>

      <div className="pokemon-header">
        <div className="pokemon-info">
          <h2 className="retro-text pokemon-name" style={{ color: typeColorVar }}>
            {pokemonData.name}
          </h2>
          <span className="pokemon-level">Lv. {level}</span>
        </div>
        <div className="pokemon-types">
          {pokemonData.types.map((t) => (
            <span key={t.type.name} className="type-badge">
              {t.type.name}
            </span>
          ))}
        </div>
      </div>

      <div className="sprite-container">
        {evolving && (
          <div className="evolution-overlay">
            <p className="retro-text evo-text">What? {pokemonData.name} is evolving!</p>
          </div>
        )}
        <img 
          src={spriteUrl} 
          alt={pokemonData.name} 
          className={`pokemon-sprite ${evolving ? 'evolving' : 'floating'}`}
        />
      </div>

      <div className="xp-section">
        <div className="xp-labels">
          <span>XP</span>
          <span>{Math.round(xpPercent)}%</span>
        </div>
        <div className="xp-bar-container">
          <div 
            className="xp-bar-fill" 
            style={{ width: `${xpPercent}%` }}
          >
            <div className="xp-bar-shine"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
