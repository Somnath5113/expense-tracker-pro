import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  Plus,
  Calculator,
  BarChart3,
  FileText,
  Settings,
  TrendingUp,
  Wallet,
  Shield,
  Sparkles
} from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import './Sidebar.css';

const Sidebar = () => {
  const navigationItems = [
    { path: '/', icon: Home, label: 'Dashboard', description: 'Overview & insights' },
    { path: '/add-expense', icon: Plus, label: 'Add Expense', description: 'Record new expense' },
    { path: '/calculator', icon: Calculator, label: 'Calculator', description: 'Apple-style calc' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics', description: 'Charts & trends' },
    { path: '/reports', icon: FileText, label: 'Reports', description: 'Export & summary' },
    { path: '/settings', icon: Settings, label: 'Settings', description: 'Preferences & data' }
  ];

  const features = [
    { icon: TrendingUp, text: 'Real-time Analytics' },
    { icon: Wallet, text: 'Smart Budgeting' },
    { icon: Shield, text: 'Secure Storage' },
    { icon: Sparkles, text: 'Modern UI' }
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <div className="logo-icon">💰</div>
          <div className="logo-text">
            <h2>Expense Pro</h2>
            <p>Track • Analyze • Save</p>
          </div>
        </div>
        <ThemeToggle />
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section">
          <h3>Navigation</h3>
          <ul>
            {navigationItems.map((item) => (
              <li key={item.path}>
                <NavLink 
                  to={item.path}
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                >
                  <item.icon size={20} />
                  <div className="nav-text">
                    <span className="nav-label">{item.label}</span>
                    <span className="nav-description">{item.description}</span>
                  </div>
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

        <div className="nav-section">
          <h3>Features</h3>
          <ul className="features-list">
            {features.map((feature, index) => (
              <li key={index} className="feature-item">
                <feature.icon size={16} />
                <span>{feature.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      <div className="sidebar-footer">
        <div className="glass-card">
          <div className="app-info">
            <h4>💡 Pro Tip</h4>
            <p>Use the calculator to compute amounts, then quickly add them as expenses!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
