import React from 'react';
import { Target, Skull } from 'lucide-react';
import './ProgressBanner.css';

export default function ProgressBanner({ activeBoss, tasksUntilBoss }) {
  const isBossActive = !!activeBoss;

  return (
    <div className={`progress-banner-container ${isBossActive ? 'boss-active' : ''}`}>
      <div className="progress-banner-content glass-panel">
        {isBossActive ? (
          <>
            <div className="banner-label">
              <Skull size={14} className="skull-icon" />
              <span className="retro-text small capitalize">{activeBoss.data.name} HP:</span>
            </div>
            <div className="banner-hp-bar">
              {Array.from({ length: activeBoss.maxHp }).map((_, i) => (
                <div 
                  key={i} 
                  className={`hp-pip ${i < activeBoss.currentHp ? 'filled' : 'empty'}`}
                />
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="banner-label">
              <Target size={14} className="target-icon" />
              <span className="retro-text small">Next Encounter:</span>
            </div>
            <div className="banner-count">
              <span className="count-val">{tasksUntilBoss}</span>
              <span className="count-unit">{tasksUntilBoss === 1 ? 'task' : 'tasks'}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
