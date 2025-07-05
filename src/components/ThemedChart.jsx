import React from 'react';
import { useTheme } from '../context/ThemeContext';

/**
 * Theme-aware chart wrapper component
 * Provides consistent styling for all charts based on current theme
 */
const ThemedChart = ({ children, className = '' }) => {
  const { theme } = useTheme();
  
  const chartTheme = {
    light: {
      text: '#1f2937',
      grid: '#e5e7eb',
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        color: '#1f2937'
      }
    },
    dark: {
      text: '#f9fafb',
      grid: '#374151',
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        color: '#f9fafb'
      }
    }
  };

  const currentTheme = chartTheme[theme];
  
  return (
    <div className={`themed-chart ${className}`}>
      <style jsx>{`
        .themed-chart {
          --chart-text-color: ${currentTheme.text};
          --chart-grid-color: ${currentTheme.grid};
          --chart-tooltip-bg: ${currentTheme.tooltip.backgroundColor};
          --chart-tooltip-border: ${currentTheme.tooltip.border};
          --chart-tooltip-color: ${currentTheme.tooltip.color};
        }
        
        .themed-chart .recharts-text {
          fill: var(--chart-text-color);
        }
        
        .themed-chart .recharts-cartesian-grid-horizontal line,
        .themed-chart .recharts-cartesian-grid-vertical line {
          stroke: var(--chart-grid-color);
        }
        
        .themed-chart .recharts-default-tooltip {
          background: var(--chart-tooltip-bg) !important;
          border: var(--chart-tooltip-border) !important;
          color: var(--chart-tooltip-color) !important;
          backdrop-filter: blur(10px);
          border-radius: 8px;
        }
        
        .themed-chart .recharts-tooltip-label {
          color: var(--chart-tooltip-color) !important;
        }
        
        .themed-chart .recharts-tooltip-item {
          color: var(--chart-tooltip-color) !important;
        }
      `}</style>
      {children}
    </div>
  );
};

export default ThemedChart;
