import React, { useState } from 'react';
import { CheckCircle2, Circle, Plus, Trash2, Calendar as CalendarIcon, Bell, Tag, Settings, Sparkles } from 'lucide-react';
import './ChoreList.css';

const PRESET_LABELS = [
  "Brain Fuel", "Zen Mode", "Adulting", "Self Care", "Hustle", "Side Quest"
];

export default function ChoreList({ type, chores, onAdd, onToggle, onDelete, alphaChoreId }) {
  const [text, setText] = useState('');
  const [label, setLabel] = useState('');
  const [deadline, setDeadline] = useState('');
  const [reminder, setReminder] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  const getDynamicXp = (chore) => {
    const isAlpha = chore.id === alphaChoreId;
    // chore.id is Date.now() when created.
    const daysOld = Math.floor((Date.now() - chore.id) / (1000 * 60 * 60 * 24));
    let xp = chore.xp;
    if (daysOld > 0 && !chore.completed) {
      xp += (daysOld * 10);
    }
    if (isAlpha && !chore.completed) {
      xp *= 5; // Alpha chore bounty
    }
    return xp;
  };

  const handleAdd = (e) => {
    e.preventDefault();
    if (text.trim()) {
      onAdd(type, { text: text.trim(), label: label.trim(), deadline, reminder });
      setText('');
      setLabel('');
      setDeadline('');
      setReminder(false);
      setShowOptions(false);
    }
  };

  const isOverdue = (deadlineStr) => {
    if (!deadlineStr) return false;
    return new Date(deadlineStr) < new Date();
  };

  return (
    <div className="glass-panel chore-list-container">
      <div className="chore-list-header">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-yellow-400" />
          <h3 className="retro-text chore-list-title">{type} Quests</h3>
        </div>
        <span className="chore-counter">
          {chores.filter(c => c.completed).length} / {chores.length}
        </span>
      </div>

      <div className="chores-scroll-area">
        {chores.length === 0 ? (
          <div className="empty-state">
            No {type} quests yet. A wild task appeared!
          </div>
        ) : (
          chores.map(chore => {
            const dynamicXp = getDynamicXp(chore);
            const isAlpha = chore.id === alphaChoreId && !chore.completed;
            
            return (
            <div 
              key={chore.id} 
              className={`chore-item ${chore.completed ? 'completed' : 'pending'} ${isAlpha ? 'alpha-chore' : ''}`}
            >
              <div className="chore-content-wrapper">
                <button 
                  onClick={() => onToggle(type, chore.id, dynamicXp)}
                  className="chore-toggle-btn"
                >
                  {chore.completed ? (
                    <CheckCircle2 className="icon-check" />
                  ) : (
                    <Circle className="icon-circle" />
                  )}
                  <div className="chore-text-group">
                    <span className={`chore-text ${chore.completed ? 'text-completed' : ''}`}>
                      {chore.text}
                    </span>
                    {(chore.label || chore.deadline) && (
                      <div className="chore-metadata">
                        {chore.label && (
                          <span className="metadata-badge label-badge">
                            <Tag size={10} /> {chore.label}
                          </span>
                        )}
                        {chore.deadline && (
                          <span className={`metadata-badge deadline-badge ${isOverdue(chore.deadline) && !chore.completed ? 'overdue' : ''}`}>
                            <CalendarIcon size={10} /> 
                            {new Date(chore.deadline).toLocaleString([], {month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit'})}
                          </span>
                        )}
                        {chore.reminder && (
                          <Bell size={12} className="reminder-icon" />
                        )}
                      </div>
                    )}
                  </div>
                </button>
              </div>
              
              <div className="chore-actions">
                {isAlpha && (
                  <span className="alpha-badge">
                    ALPHA
                  </span>
                )}
                <span className={`xp-badge ${chore.id !== alphaChoreId && dynamicXp > chore.xp ? 'bounty' : ''}`}>
                  +{dynamicXp} XP
                </span>
                <button 
                  onClick={() => onDelete(type, chore.id)}
                  className="delete-btn"
                >
                  <Trash2 className="icon-trash" />
                </button>
              </div>
            </div>
            );
          })
        )}
      </div>

      <form onSubmit={handleAdd} className="add-chore-form-complex">
        <div className="main-input-row">
          <input 
            type="text" 
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={`Add new ${type} quest...`}
            className="add-chore-input"
          />
          <button 
            type="button"
            className={`options-toggle-btn ${showOptions ? 'active' : ''}`}
            onClick={() => setShowOptions(!showOptions)}
            title="Quest Options"
          >
            <Settings size={18} />
          </button>
          <button 
            type="submit"
            disabled={!text.trim()}
            className="add-chore-btn"
          >
            <Plus className="icon-plus" />
          </button>
        </div>
        
        {showOptions && (
          <div className="options-panel animate-pop-in">
            <div className="option-group">
              <label><Tag size={14} /> Label</label>
              <input 
                list="preset-labels" 
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="e.g. Boss Fight"
                className="option-input"
              />
              <datalist id="preset-labels">
                {PRESET_LABELS.map(l => <option key={l} value={l} />)}
              </datalist>
            </div>
            
            <div className="option-group">
              <label><CalendarIcon size={14} /> Until</label>
              <input 
                type="datetime-local" 
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="option-input"
              />
            </div>
            
            <div className="option-group checkbox-group">
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  checked={reminder}
                  onChange={(e) => setReminder(e.target.checked)}
                />
                <Bell size={14} /> Remind me
              </label>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
