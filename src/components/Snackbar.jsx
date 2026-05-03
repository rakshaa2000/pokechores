import React, { useEffect } from 'react';
import './Snackbar.css';
import { Bell } from 'lucide-react';

export default function Snackbar({ message, onClose, duration = 4000 }) {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [message, duration, onClose]);

  if (!message) return null;

  return (
    <div className="snackbar-container animate-slide-up">
      <div className="snackbar-content">
        <Bell className="snackbar-icon" size={20} />
        <span className="snackbar-text">{message}</span>
      </div>
      <button className="snackbar-close" onClick={onClose}>&times;</button>
    </div>
  );
}
