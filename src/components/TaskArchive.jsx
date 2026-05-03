import React from 'react';
import { Tag, CheckCircle2, Zap, Trophy, Calendar, Clock, History, Layout, Star, ShieldCheck } from 'lucide-react';
import './TaskArchive.css';

export default function TaskArchive({ archive }) {
  if (!archive || archive.length === 0) {
    return (
      <div className="glass-panel empty-archive animate-pop-in">
        <div className="empty-icon-wrapper">
          <History size={48} className="text-gray-600 mb-4" />
        </div>
        <h3 className="retro-text text-xl mb-2">History is Empty</h3>
        <p className="text-gray-400">Complete your first task to start your journey!</p>
        <div className="mt-6 flex gap-2">
          <div className="skeleton-line w-24 h-2 bg-white/5 rounded"></div>
          <div className="skeleton-line w-32 h-2 bg-white/5 rounded"></div>
        </div>
      </div>
    );
  }

  // Calculate stats
  const totalXP = archive.reduce((sum, t) => sum + (t.xp || 0), 0);
  const totalTasks = archive.length;
  const uniqueLabels = new Set(archive.filter(t => t.label).map(t => t.label)).size;

  // Group by date with "Today" and "Yesterday" logic
  const grouped = archive.reduce((acc, task) => {
    const d = new Date(task.completedAt);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    let dateStr;
    if (d.toDateString() === today.toDateString()) {
      dateStr = 'Today';
    } else if (d.toDateString() === yesterday.toDateString()) {
      dateStr = 'Yesterday';
    } else {
      dateStr = d.toLocaleDateString([], { 
        month: 'short', day: 'numeric', year: 'numeric' 
      });
    }

    if (!acc[dateStr]) acc[dateStr] = [];
    acc[dateStr].push(task);
    return acc;
  }, {});

  const getTypeIcon = (type) => {
    switch (type) {
      case 'daily': return <Star size={14} className="text-blue-400" />;
      case 'weekly': return <ShieldCheck size={14} className="text-purple-400" />;
      case 'monthly': return <Trophy size={14} className="text-yellow-400" />;
      default: return <Layout size={14} />;
    }
  };

  return (
    <div className="archive-wrapper animate-fade-in">
      <div className="archive-stats-header glass-panel">
        <div className="stat-card">
          <div className="stat-icon-bg bg-blue-500/20">
            <CheckCircle2 size={18} className="text-blue-400" />
          </div>
          <div className="stat-info">
            <span className="stat-val">{totalTasks}</span>
            <span className="stat-lab">Completed</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-bg bg-yellow-500/20">
            <Zap size={18} className="text-yellow-400" />
          </div>
          <div className="stat-info">
            <span className="stat-val">{totalXP}</span>
            <span className="stat-lab">Total XP</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-bg bg-purple-500/20">
            <Tag size={18} className="text-purple-400" />
          </div>
          <div className="stat-info">
            <span className="stat-val">{uniqueLabels}</span>
            <span className="stat-lab">Tags Used</span>
          </div>
        </div>
      </div>

      <div className="glass-panel archive-container">
        <div className="archive-scroll-area">
          {Object.entries(grouped).map(([date, tasks]) => (
            <div key={date} className="archive-date-group">
              <div className="archive-date-sticky">
                <Calendar size={12} />
                <h4 className="archive-date-header">{date}</h4>
              </div>
              
              <div className="archive-tasks">
                {tasks.map(task => (
                  <div key={task.id + task.completedAt} className="archive-task-item group">
                    <div className="archive-task-main">
                      <div className="archive-task-indicator">
                        {getTypeIcon(task.type)}
                      </div>
                      <div className="archive-task-content">
                        <div className="archive-task-text">{task.text}</div>
                        <div className="archive-task-time">
                          <Clock size={10} />
                          {new Date(task.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                    
                    <div className="archive-task-meta">
                      {task.label && (
                        <span className="metadata-badge label-badge">
                          {task.label}
                        </span>
                      )}
                      <span className="xp-badge-small">
                        +{task.xp} XP
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
