import React, { useState } from 'react';
import { useExpense } from '../context/ExpenseContext';
import { useTheme } from '../context/ThemeContext';
import { useNotification } from '../context/NotificationContext';
import CSVManager from '../components/CSVManager';
import FileStoragePanel from '../components/FileStoragePanel';
import { 
  Settings as SettingsIcon, 
  Plus, 
  Trash2, 
  Upload, 
  Download,
  AlertTriangle,
  Info,
  Shield,
  Database,
  Tag,
  HelpCircle,
  Sun,
  Moon,
  Palette
} from 'lucide-react';

const Settings = () => {
  const { 
    categories, 
    addCategory, 
    removeCategory, 
    expenses,
    importData,
    clearAllData,
    exportToCSV,
    exportToTXT 
  } = useExpense();
  
  const { theme, toggleTheme } = useTheme();
  const { success } = useNotification();
  
  const [newCategory, setNewCategory] = useState('');
  const [showDangerZone, setShowDangerZone] = useState(false);
  const [confirmClear, setConfirmClear] = useState('');
  const [showImportHelp, setShowImportHelp] = useState(false);

  const handleThemeToggle = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    toggleTheme();
    success(
      `Switched to ${newTheme} theme!`,
      `The interface now uses ${newTheme} mode. Your preference has been saved.`
    );
  };

  const handleAddCategory = (e) => {
    e.preventDefault();
    if (newCategory.trim()) {
      addCategory(newCategory.trim());
      setNewCategory('');
    }
  };

  const handleRemoveCategory = (category) => {
    if (window.confirm(`Are you sure you want to remove "${category}"?`)) {
      removeCategory(category);
    }
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const text = event.target.result;
          
          if (file.name.endsWith('.csv')) {
            // Parse CSV
            const lines = text.split('\n');
            const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
            
            const expectedHeaders = ['Date', 'Amount', 'Category', 'Description'];
            const hasValidHeaders = expectedHeaders.every(h => headers.includes(h));
            
            if (!hasValidHeaders) {
              alert('Invalid CSV format. Please ensure headers are: Date, Amount, Category, Description');
              return;
            }
            
            const importedExpenses = [];
            for (let i = 1; i < lines.length; i++) {
              const line = lines[i].trim();
              if (line) {
                const values = line.split(',').map(v => v.replace(/"/g, '').trim());
                importedExpenses.push({
                  id: Date.now() + i,
                  date: values[0],
                  amount: parseFloat(values[1]),
                  category: values[2],
                  description: values[3],
                  timestamp: new Date().toISOString()
                });
              }
            }
            
            importData({ expenses: importedExpenses });
            alert(`Successfully imported ${importedExpenses.length} expenses!`);
          } else if (file.name.endsWith('.json')) {
            // Parse JSON
            const data = JSON.parse(text);
            if (data.expenses) {
              importData(data);
              alert(`Successfully imported ${data.expenses.length} expenses!`);
            } else {
              alert('Invalid JSON format. Please ensure it contains an "expenses" array.');
            }
          } else {
            alert('Please upload a CSV or JSON file.');
          }
        } catch (error) {
          alert('Error importing file: ' + error.message);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleClearAllData = () => {
    if (confirmClear === 'CLEAR ALL DATA') {
      clearAllData();
      setConfirmClear('');
      setShowDangerZone(false);
      alert('All data has been cleared.');
    } else {
      alert('Please type "CLEAR ALL DATA" to confirm.');
    }
  };

  const appInfo = {
    version: '1.0.0',
    buildDate: new Date().toLocaleDateString(),
    totalExpenses: expenses.length,
    totalCategories: categories.length,
    storageUsed: JSON.stringify(expenses).length
  };

  return (
    <div className="settings">
      {/* Header Section */}
      <div className="page-header">
        <h1>⚙️ Settings</h1>
        <p>Customize your expense tracking experience</p>
      </div>

      {/* Quick Stats Overview */}
      <div className="metrics-grid mb-8">
        <div className="metric-card">
          <div className="metric-icon">📊</div>
          <div className="metric-value">{appInfo.totalExpenses}</div>
          <div className="metric-label">Total Expenses</div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">🏷️</div>
          <div className="metric-value">{appInfo.totalCategories}</div>
          <div className="metric-label">Categories</div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">💾</div>
          <div className="metric-value">{(appInfo.storageUsed / 1024).toFixed(1)} KB</div>
          <div className="metric-label">Storage Used</div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">🌙</div>
          <div className="metric-value">{theme === 'dark' ? 'Dark' : 'Light'}</div>
          <div className="metric-label">Theme Mode</div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="settings-grid">
        {/* Left Column - Primary Settings */}
        <div className="settings-primary">
          {/* Theme Settings - Moved to top for better visibility */}
          <div className="glass-card setting-section">
            <div className="setting-header">
              <h3 className="flex items-center gap-3">
                <div className="setting-icon">
                  <Palette size={24} />
                </div>
                <div>
                  <div className="setting-title">Appearance</div>
                  <div className="setting-subtitle">Customize your visual experience</div>
                </div>
              </h3>
            </div>
            
            <div className="setting-content">
              <div className="theme-toggle-section">
                <div className="theme-option">
                  <div className="theme-info">
                    <h4 className="font-semibold">Theme Mode</h4>
                    <p className="text-sm text-gray-400">
                      {theme === 'dark' 
                        ? 'Dark theme reduces eye strain in low-light conditions' 
                        : 'Light theme provides a clean, bright interface'}
                    </p>
                  </div>
                  <button
                    onClick={handleThemeToggle}
                    className="theme-toggle-btn-modern"
                  >
                    <div className={`theme-toggle-slider ${theme === 'dark' ? 'active' : ''}`}>
                      <div className="theme-toggle-icon">
                        {theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Category Management */}
          <div className="glass-card setting-section">
            <div className="setting-header">
              <h3 className="flex items-center gap-3">
                <div className="setting-icon">
                  <Tag size={24} />
                </div>
                <div>
                  <div className="setting-title">Categories</div>
                  <div className="setting-subtitle">Organize your expenses with custom categories</div>
                </div>
              </h3>
            </div>
            
            <div className="setting-content">
              {/* Add Category Form */}
              <form onSubmit={handleAddCategory} className="add-category-form">
                <div className="form-group">
                  <label className="form-label">Add New Category</label>
                  <div className="input-group">
                    <input
                      type="text"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      placeholder="e.g., 🎮 Gaming, 🍕 Food, 🚗 Transport"
                      className="form-input"
                    />
                    <button type="submit" className="btn-primary">
                      <Plus size={16} />
                      Add
                    </button>
                  </div>
                </div>
              </form>

              {/* Category List */}
              <div className="category-list">
                <div className="category-list-header">
                  <h4 className="font-medium">Your Categories ({categories.length})</h4>
                </div>
                <div className="category-items">
                  {categories.map((category, index) => (
                    <div key={category} className="category-item">
                      <div className="category-info">
                        <span className="category-name">{category}</span>
                        <span className="category-index">#{index + 1}</span>
                      </div>
                      <button
                        onClick={() => handleRemoveCategory(category)}
                        className="btn-danger-sm"
                        title={`Remove ${category}`}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Data Management */}
          <div className="glass-card setting-section">
            <div className="setting-header">
              <h3 className="flex items-center gap-3">
                <div className="setting-icon">
                  <Database size={24} />
                </div>
                <div>
                  <div className="setting-title">Data Management</div>
                  <div className="setting-subtitle">Import, export, and backup your data</div>
                </div>
              </h3>
            </div>
            
            <div className="setting-content">
              {/* Import/Export Actions */}
              <div className="data-actions">
                <div className="action-group">
                  <h4 className="action-title">Import Data</h4>
                  <div className="action-buttons">
                    <input
                      type="file"
                      accept=".csv,.json"
                      onChange={handleImport}
                      className="hidden"
                      id="import-file"
                    />
                    <label
                      htmlFor="import-file"
                      className="btn-primary action-btn"
                    >
                      <Upload size={16} />
                      Import CSV/JSON
                    </label>
                    <button
                      onClick={() => setShowImportHelp(!showImportHelp)}
                      className="btn-secondary action-btn"
                    >
                      <HelpCircle size={16} />
                      Format Info
                    </button>
                  </div>
                </div>

                <div className="action-group">
                  <h4 className="action-title">Export Data</h4>
                  <div className="action-buttons">
                    <button
                      onClick={exportToCSV}
                      className="btn-success action-btn"
                    >
                      <Download size={16} />
                      Export CSV
                    </button>
                    <button
                      onClick={exportToTXT}
                      className="btn-primary action-btn"
                    >
                      <Download size={16} />
                      Export TXT
                    </button>
                  </div>
                </div>
              </div>

              {showImportHelp && (
                <div className="import-help">
                  <h5 className="font-medium mb-2">📋 Import Format Requirements</h5>
                  <ul className="help-list">
                    <li><strong>CSV:</strong> Headers must be "Date,Amount,Category,Description"</li>
                    <li><strong>JSON:</strong> Must contain an "expenses" array</li>
                    <li><strong>Date:</strong> Format should be YYYY-MM-DD</li>
                    <li><strong>Amount:</strong> Numeric values only (no currency symbols)</li>
                  </ul>
                </div>
              )}

              {/* Backup Status */}
              <div className="backup-status">
                <div className="status-indicator">
                  <Shield size={16} className="text-green-400" />
                  <div>
                    <h5 className="font-medium text-green-400">Auto-Save Active</h5>
                    <p className="text-sm text-gray-400">
                      Data automatically saved to browser storage
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Secondary Settings & Info */}
        <div className="settings-secondary">
          {/* Quick Actions */}
          <div className="glass-card setting-section">
            <div className="setting-header">
              <h3 className="flex items-center gap-3">
                <div className="setting-icon">
                  <SettingsIcon size={24} />
                </div>
                <div>
                  <div className="setting-title">Quick Actions</div>
                  <div className="setting-subtitle">Navigate to key features</div>
                </div>
              </h3>
            </div>
            
            <div className="setting-content">
              <div className="quick-actions">
                <button
                  onClick={() => window.location.href = '/'}
                  className="quick-action-btn"
                >
                  <div className="quick-action-icon">🏠</div>
                  <div className="quick-action-text">Dashboard</div>
                </button>
                <button
                  onClick={() => window.location.href = '/add-expense'}
                  className="quick-action-btn"
                >
                  <div className="quick-action-icon">➕</div>
                  <div className="quick-action-text">Add Expense</div>
                </button>
                <button
                  onClick={() => window.location.href = '/analytics'}
                  className="quick-action-btn"
                >
                  <div className="quick-action-icon">📊</div>
                  <div className="quick-action-text">Analytics</div>
                </button>
              </div>
            </div>
          </div>

          {/* App Information */}
          <div className="glass-card setting-section">
            <div className="setting-header">
              <h3 className="flex items-center gap-3">
                <div className="setting-icon">
                  <Info size={24} />
                </div>
                <div>
                  <div className="setting-title">App Information</div>
                  <div className="setting-subtitle">Version and system details</div>
                </div>
              </h3>
            </div>
            
            <div className="setting-content">
              <div className="app-info">
                <div className="info-item">
                  <span className="info-label">Version</span>
                  <span className="info-value">{appInfo.version}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Build Date</span>
                  <span className="info-value">{appInfo.buildDate}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Data Entries</span>
                  <span className="info-value">{appInfo.totalExpenses}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Storage Size</span>
                  <span className="info-value">{(appInfo.storageUsed / 1024).toFixed(2)} KB</span>
                </div>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="glass-card setting-section danger-zone">
            <div className="setting-header">
              <h3 className="flex items-center gap-3">
                <div className="setting-icon danger">
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <div className="setting-title danger">Danger Zone</div>
                  <div className="setting-subtitle">Irreversible actions</div>
                </div>
              </h3>
            </div>
            
            <div className="setting-content">
              {!showDangerZone ? (
                <button
                  onClick={() => setShowDangerZone(true)}
                  className="btn-danger-outline w-full"
                >
                  <AlertTriangle size={16} />
                  Show Danger Zone
                </button>
              ) : (
                <div className="danger-content">
                  <div className="danger-warning">
                    <h4 className="font-medium text-red-400 mb-2">⚠️ Clear All Data</h4>
                    <p className="text-sm text-gray-300 mb-4">
                      This will permanently delete all your expenses and reset categories to default. 
                      This action cannot be undone.
                    </p>
                    
                    <div className="confirm-section">
                      <input
                        type="text"
                        value={confirmClear}
                        onChange={(e) => setConfirmClear(e.target.value)}
                        placeholder="Type 'CLEAR ALL DATA' to confirm"
                        className="form-input mb-3"
                      />
                      
                      <div className="confirm-actions">
                        <button
                          onClick={handleClearAllData}
                          className="btn-danger"
                          disabled={confirmClear !== 'CLEAR ALL DATA'}
                        >
                          Clear All Data
                        </button>
                        <button
                          onClick={() => {
                            setShowDangerZone(false);
                            setConfirmClear('');
                          }}
                          className="btn-secondary"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Components */}
      <div className="advanced-components">
        <div className="glass-card">
          <div className="setting-header">
            <h3 className="flex items-center gap-3">
              <div className="setting-icon">
                <Database size={24} />
              </div>
              <div>
                <div className="setting-title">Advanced Data Management</div>
                <div className="setting-subtitle">Enhanced CSV management and file storage options</div>
              </div>
            </h3>
          </div>
          
          <div className="setting-content">
            <div className="advanced-components-grid">
              <div className="component-section">
                <h4 className="component-title">CSV Manager</h4>
                <CSVManager />
              </div>
              
              <div className="component-section">
                <h4 className="component-title">File Storage</h4>
                <FileStoragePanel />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="settings-footer">
        <div className="glass-card">
          <div className="footer-content">
            <div className="footer-brand">
              <h3 className="footer-title">💰 Expense Tracker Pro</h3>
              <p className="footer-description">
                Modern expense tracking with beautiful design and powerful features
              </p>
            </div>
            <div className="footer-features">
              <div className="feature-badge">🎨 Glass Design</div>
              <div className="feature-badge">📱 Mobile Ready</div>
              <div className="feature-badge">🔒 Secure Storage</div>
              <div className="feature-badge">📊 Rich Analytics</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
