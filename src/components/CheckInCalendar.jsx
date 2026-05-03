import React from 'react';
import './CheckInCalendar.css';
import { Calendar as CalendarIcon, Check } from 'lucide-react';

export default function CheckInCalendar({ checkIns = [] }) {
  const today = new Date();
  
  return (
    <div className="glass-panel checkin-calendar">
      <h3 className="retro-text stats-title flex-title">
        <CalendarIcon size={16} /> Check-Ins
      </h3>
      <div className="calendar-grid">
        {Array.from({ length: 14 }).map((_, i) => {
          const d = new Date(today);
          d.setDate(today.getDate() - (13 - i));
          
          const isToday = i === 13;
          const dateString = d.toISOString().split('T')[0];
          const isCheckedIn = checkIns.includes(dateString);
          
          return (
            <div 
              key={i} 
              className={`calendar-day ${isCheckedIn ? 'checked-in' : ''} ${isToday ? 'today' : ''}`}
              title={d.toDateString()}
            >
              {isCheckedIn && <Check size={12} className="check-icon" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
