import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useNotification } from '../context/NotificationContext';

/**
 * Theme toggle button component
 * Provides a switch between light and dark themes
 */
const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const { success } = useNotification();

  const handleToggle = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    toggleTheme();
    success(
      `Switched to ${newTheme} theme!`,
      `The interface now uses ${newTheme} mode. Your preference has been saved.`
    );
  };

  return (
    <button
      onClick={handleToggle}
      className="theme-toggle"
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
    >
      {theme === 'dark' ? (
        <Sun className="theme-icon" />
      ) : (
        <Moon className="theme-icon" />
      )}
    </button>
  );
};

export default ThemeToggle;
