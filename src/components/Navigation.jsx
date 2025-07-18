import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Home,
  Plus,
  Calculator,
  BarChart3,
  FileText,
  Settings as SettingsIcon,
  Menu,
  X
} from 'lucide-react';

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Navigation items
  const navigationItems = [
    { path: '/', icon: Home, label: 'Dashboard', description: 'Overview & insights' },
    { path: '/add-expense', icon: Plus, label: 'Add Expense', description: 'Record new expense' },
    { path: '/calculator', icon: Calculator, label: 'Calculator', description: 'Apple-style calc' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics', description: 'Charts & trends' },
    { path: '/reports', icon: FileText, label: 'Reports', description: 'Export & summary' },
    { path: '/settings', icon: SettingsIcon, label: 'Settings', description: 'Preferences & data' }
  ];

  const handleNavigation = (path) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      <div className="navigation-bar">
        <div className="nav-brand">
          <div className="nav-logo">💰</div>
          <div className="nav-title">
            <h2>Expense Pro</h2>
            <p>Track • Analyze • Save</p>
          </div>
        </div>
        
        {/* Desktop Navigation */}
        <div className="nav-buttons desktop-nav">
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

        {/* Mobile Menu Button */}
        <button 
          className="mobile-menu-button"
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="mobile-menu-overlay" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="mobile-menu" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-menu-header">
              <h3>Navigation</h3>
              <button 
                className="mobile-menu-close"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="mobile-menu-items">
              {navigationItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => handleNavigation(item.path)}
                  className={`mobile-nav-item ${location.pathname === item.path ? 'active' : ''}`}
                >
                  <div className="mobile-nav-icon">
                    <item.icon size={22} />
                  </div>
                  <div className="mobile-nav-content">
                    <span className="mobile-nav-label">{item.label}</span>
                    <span className="mobile-nav-description">{item.description}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navigation;
