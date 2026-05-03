import React from 'react';
import './BossBattle.css';

export default function BossBattle({ activeBoss }) {
  if (!activeBoss) return null;

  const { data, maxHp, currentHp } = activeBoss;
  const hpPercent = (currentHp / maxHp) * 100;
  const primaryType = data.types[0].type.name;
  const typeColorVar = `var(--type-${primaryType}, var(--type-normal))`;

  const spriteUrl = data.sprites.versions['generation-v']['black-white'].animated.front_default 
                 || data.sprites.front_default;

  return (
    <div className="boss-battle-container animate-pop-in">
      <div className="boss-header">
        <h3 className="retro-text warning-text">WILD ENCOUNTER</h3>
      </div>
      
      <div className="boss-content">
        <div className="boss-sprite-wrapper">
          <img 
            src={spriteUrl} 
            alt={data.name} 
            className="boss-sprite"
          />
          <div className="boss-pedestal"></div>
        </div>
        
        <div className="boss-info">
          <h4 className="retro-text boss-name" style={{ color: typeColorVar }}>
            {data.name}
          </h4>
          <p className="boss-subtitle">
            Lv. {activeBoss.level} • {primaryType} type
          </p>
          
          <div className="boss-hp-section">
            <div className="hp-labels">
              <span>HP</span>
              <span>{currentHp} / {maxHp}</span>
            </div>
            <div className="hp-bar-container">
              <div 
                className={`hp-bar-fill ${hpPercent <= 33 ? 'danger' : 'safe'}`}
                style={{ width: `${hpPercent}%` }}
              >
              </div>
            </div>
            <p className="boss-instruction">
              Complete quests to deal damage!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
