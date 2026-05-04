import React, { useState, useEffect, useRef } from 'react';
import { Plus, X, Command } from 'lucide-react';
import './QuickAdd.css';

export default function QuickAdd({ onAdd, onClose }) {
  const [text, setText] = useState('');
  const [type, setType] = useState('one-time');
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim()) {
      onAdd(type, { text: text.trim() });
      onClose();
    }
  };

  return (
    <div className="quick-add-overlay" onClick={onClose}>
      <div className="quick-add-modal glass-panel animate-pop-in" onClick={e => e.stopPropagation()}>
        <div className="quick-add-header">
          <div className="flex items-center gap-3">
            <Command size={20} className="text-blue-400" />
            <span className="retro-text text-lg text-blue-400">Quick Summon</span>
          </div>
          <button onClick={onClose} className="close-btn-mini"><X size={20} /></button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <input 
            ref={inputRef}
            type="text" 
            placeholder="What quest shall we embark on?" 
            value={text}
            onChange={e => setText(e.target.value)}
            className="quick-add-input"
          />
          
          <div className="quick-add-footer">
            <div className="type-selector">
              {['one-time', 'daily', 'weekly'].map(t => (
                <button 
                  key={t}
                  type="button"
                  className={`type-btn ${type === t ? 'active' : ''}`}
                  onClick={() => setType(t)}
                >
                  {t}
                </button>
              ))}
            </div>
            <button type="submit" disabled={!text.trim()} className="summon-btn">
              <Plus size={16} /> Summon
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
