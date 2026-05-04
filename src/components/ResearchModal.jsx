import { X, CheckCircle2, Circle, Star, Heart } from 'lucide-react';
import './ResearchModal.css';

export default function ResearchModal({ pokemon, researchProgress, isBuddy, onSetBuddy, onClose }) {
  // Mocking some research tasks for the specific pokemon
  // In a real app, these would be mapped to specific chores
  const tasks = [
    { id: 1, label: 'Catch species', required: 1, current: 1 },
    { id: 2, label: 'Complete 10 Buddy Quests', required: 10, current: Math.min(10, Math.floor((pokemon.xp || 0) / 10)) },
    { id: 3, label: 'Reach Level 20', required: 20, current: 5 + Math.floor((pokemon.xp || 0) / 100) },
    { id: 4, label: 'Achieve Perfect Bond', required: 1, current: pokemon.xp > 1000 ? 1 : 0 },
  ];

  const totalPoints = tasks.filter(t => t.current >= t.required).length;
  const rank = totalPoints === tasks.length ? 'Perfect' : `Rank ${totalPoints}`;

  return (
    <div className="research-overlay" onClick={onClose}>
      <div className="research-modal glass-panel animate-pop-in" onClick={e => e.stopPropagation()}>
        <div className="research-header">
          <div className="poke-id"># {pokemon.id.toString().padStart(3, '0')}</div>
          <button className="close-btn" onClick={onClose}><X /></button>
        </div>

        <div className="research-body">
          <div className="poke-display">
            <img src={pokemon.sprites.other['official-artwork'].front_default} alt={pokemon.name} />
            <h2 className="retro-text capitalize">{pokemon.name}</h2>
            <div className={`rank-badge ${rank === 'Perfect' ? 'perfect' : ''}`}>
              <Star size={12} fill={rank === 'Perfect' ? 'currentColor' : 'none'} />
              {rank}
            </div>
          </div>

          <div className="research-tasks">
            <h3 className="section-title">Research Tasks</h3>
            {tasks.map(task => (
              <div key={task.id} className={`research-task-item ${task.current >= task.required ? 'done' : ''}`}>
                {task.current >= task.required ? <CheckCircle2 className="text-green-400" size={18} /> : <Circle className="text-gray-600" size={18} />}
                <div className="task-info">
                  <span className="task-label">{task.label}</span>
                  <div className="task-progress-bar">
                    <div className="progress-fill" style={{ width: `${Math.min(100, (task.current / task.required) * 100)}%` }}></div>
                  </div>
                </div>
                <span className="task-count">{task.current} / {task.required}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="research-footer">
          {isBuddy ? (
            <div className="buddy-indicator-large">
              <Heart className="text-red-500 fill-red-500" size={16} />
              <span>Current Buddy</span>
            </div>
          ) : (
            <button 
              className="set-buddy-btn"
              onClick={() => {
                onSetBuddy(pokemon.id);
                onClose();
              }}
            >
              <Heart size={18} />
              Set as Buddy
            </button>
          )}
          <p className="hint">Complete all tasks to achieve Perfect status!</p>
        </div>
      </div>
    </div>
  );
}
