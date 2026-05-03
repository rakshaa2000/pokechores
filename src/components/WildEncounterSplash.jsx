import React from 'react';
import './WildEncounterSplash.css';

export default function WildEncounterSplash({ bossData }) {
  if (!bossData) return null;

  return (
    <div className="encounter-splash-overlay">
      <div className="splash-content">
        <div className="vs-lines"></div>
        <div className="boss-reveal">
          <img 
            src={bossData.sprites.other['official-artwork'].front_default} 
            alt="Wild Pokemon" 
            className="splash-boss-img"
          />
        </div>
        <div className="splash-text-container">
          <h2 className="retro-text splash-title">A Wild</h2>
          <h1 className="retro-text boss-name-splash">{bossData.name}</h1>
          <h2 className="retro-text splash-title">Appeared!</h2>
        </div>
      </div>
    </div>
  );
}
