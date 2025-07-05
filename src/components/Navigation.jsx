import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Home,
  Plus,
  Calculator,
  BarChart3,
  FileText,
  Settings as SettingsIcon
} from 'lucide-react';

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Navigation items
  const navigationItems = [
    { path: '/', icon: Home, label: 'Dashboard', description: 'Overview & insights' },
    { path: '/add-expense', icon: Plus, label: 'Add Expense', description: 'Record new expense' },
    { path: '/calculator', icon: Calculator, label: 'Calculator', description: 'Apple-style calc' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics', description: 'Charts & trends' },
    { path: '/reports', icon: FileText, label: 'Reports', description: 'Export & summary' },
    { path: '/settings', icon: SettingsIcon, label: 'Settings', description: 'Preferences & data' }
  ];

  return (
    <div className="navigation-bar">
      <div className="nav-brand">
        <div className="nav-logo">💰</div>
        <div className="nav-title">
          <h2>Expense Pro</h2>
          <p>Track • Analyze • Save</p>
        </div>
      </div>
      <div className="nav-buttons">
        {navigationItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`nav-button ${location.pathname === item.path ? 'active' : ''}`}
            title={item.description}
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Navigation;
