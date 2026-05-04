import React from 'react';
import { BookOpen, CheckCircle2, Circle, Star, Info } from 'lucide-react';
import './PokedexModal.css';

export default function PokedexModal({ pokemon, researchProgress, onClose }) {
  const researchTasks = [
    { id: 1, label: 'Initial Discovery', count: 1, xp: 50 },
    { id: 2, label: 'Habit Formation', count: 5, xp: 150 },
    { id: 3, label: 'Mastery', count: 10, xp: 300 },
    { id: 4, label: 'Perfect Status', count: 25, xp: 1000 }
  ];

  // We'll simulate that this specific Pokemon is tied to a "task" type or text
  // For demo, we'll just show the progress for the "current task" if it exists
  const currentCount = researchProgress[pokemon.name] || 0; 
  
  return (
    <div className="quick-add-overlay" onClick={onClose}>
      <div className="pokedex-modal glass-panel animate-pop-in" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="flex items-center gap-2">
            <BookOpen size={18} className="text-red-400" />
            <h3 className="retro-text">Research Report</h3>
          </div>
          <button onClick={onClose} className="close-btn-mini">&times;</button>
        </div>

        <div className="pokedex-content">
          <div className="pokedex-visuals">
            <img src={pokemon.sprites.front_default} alt={pokemon.name} className="pokedex-sprite" />
            <div className="pokedex-info-card">
              <span className="pokedex-id">#0{pokemon.id}</span>
              <h2 className="pokedex-name retro-text">{pokemon.name}</h2>
              <div className="pokedex-types">
                {pokemon.types.map(t => (
                  <span key={t.type.name} className={`type-badge ${t.type.name}`}>
                    {t.type.name}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="research-tasks-section">
            <h4 className="section-title">Field Research Tasks</h4>
            <div className="research-list">
              {researchTasks.map(task => {
                const isComplete = currentCount >= task.count;
                const percent = Math.min(100, (currentCount / task.count) * 100);
                
                return (
                  <div key={task.id} className={`research-item ${isComplete ? 'complete' : ''}`}>
                    <div className="research-main">
                      {isComplete ? <CheckCircle2 size={16} className="text-green-400" /> : <Circle size={16} className="text-gray-500" />}
                      <div className="research-text">
                        <span className="research-label">{task.label}</span>
                        <span className="research-subtext">Complete this species' task {task.count} times</span>
                      </div>
                      <span className="research-xp">+{task.xp} XP</span>
                    </div>
                    {!isComplete && (
                      <div className="research-progress-bar">
                        <div className="research-progress-fill" style={{ width: `${percent}%` }}></div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="pokedex-footer-info">
            <Info size={14} />
            <span>Research levels increase catch rate and discovery bonuses!</span>
          </div>
        </div>
      </div>
    </div>
  );
}
