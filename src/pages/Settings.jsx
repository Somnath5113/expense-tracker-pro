import React, { useState } from 'react';
import { useExpense } from '../context/ExpenseContext';
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
  HelpCircle
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
  
  const [newCategory, setNewCategory] = useState('');
  const [showDangerZone, setShowDangerZone] = useState(false);
  const [confirmClear, setConfirmClear] = useState('');
  const [showImportHelp, setShowImportHelp] = useState(false);

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
      <div className="page-header">
        <h1>⚙️ Settings</h1>
        <p>Manage your categories, data, and app preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Management */}
        <div className="lg:col-span-2">
          <div className="glass-card">
            <h3 className="flex items-center gap-2 mb-4">
              <Tag size={20} />
              Category Management
            </h3>
            
            {/* Add Category Form */}
            <form onSubmit={handleAddCategory} className="mb-6">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="Enter new category (e.g., 🎮 Gaming)"
                  className="form-input flex-1"
                />
                <button type="submit" className="btn-primary flex items-center gap-2">
                  <Plus size={16} />
                  Add
                </button>
              </div>
            </form>

            {/* Category List */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {categories.map((category) => (
                <div key={category} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <span className="font-medium">{category}</span>
                  <button
                    onClick={() => handleRemoveCategory(category)}
                    className="btn-danger p-2 flex items-center gap-1"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Data Management */}
          <div className="glass-card mt-6">
            <h3 className="flex items-center gap-2 mb-4">
              <Database size={20} />
              Data Management
            </h3>
            
            {/* Import Section */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium">Import Data</h4>
                <button
                  onClick={() => setShowImportHelp(!showImportHelp)}
                  className="btn-primary p-2"
                >
                  <HelpCircle size={16} />
                </button>
              </div>
              
              {showImportHelp && (
                <div className="mb-4 p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg">
                  <h5 className="font-medium mb-2">Import Format Requirements:</h5>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• CSV: Headers must be "Date,Amount,Category,Description"</li>
                    <li>• JSON: Must contain an "expenses" array</li>
                    <li>• Date format: YYYY-MM-DD</li>
                    <li>• Amount: Numeric values only</li>
                  </ul>
                </div>
              )}
              
              <input
                type="file"
                accept=".csv,.json"
                onChange={handleImport}
                className="hidden"
                id="import-file"
              />
              <label
                htmlFor="import-file"
                className="btn-primary cursor-pointer flex items-center justify-center gap-2 w-full"
              >
                <Upload size={16} />
                Import CSV/JSON
              </label>
            </div>

            {/* Export Section */}
            <div className="mb-6">
              <h4 className="font-medium mb-3">Export Data</h4>
              <div className="flex gap-2">
                <button
                  onClick={exportToCSV}
                  className="btn-success flex items-center gap-2 flex-1"
                >
                  <Download size={16} />
                  Export CSV
                </button>
                <button
                  onClick={exportToTXT}
                  className="btn-primary flex items-center gap-2 flex-1"
                >
                  <Download size={16} />
                  Export TXT
                </button>
              </div>
            </div>

            {/* Backup Info */}
            <div className="p-3 bg-green-500/20 border border-green-500/30 rounded-lg">
              <div className="flex items-start gap-2">
                <Shield size={16} className="mt-1 text-green-400" />
                <div>
                  <h5 className="font-medium text-green-400">Auto-Save Active</h5>
                  <p className="text-sm text-gray-300">
                    Your data is automatically saved to browser storage. 
                    Export regularly for backup.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced CSV Data Management */}
          <div className="mt-6">
            <CSVManager />
          </div>

          {/* File Storage Panel */}
          <div className="mt-6">
            <FileStoragePanel />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* App Information */}
          <div className="glass-card">
            <h3 className="flex items-center gap-2 mb-4">
              <Info size={20} />
              App Information
            </h3>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-300">Version:</span>
                <span className="font-medium">{appInfo.version}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Build Date:</span>
                <span className="font-medium">{appInfo.buildDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Total Expenses:</span>
                <span className="font-medium">{appInfo.totalExpenses}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Categories:</span>
                <span className="font-medium">{appInfo.totalCategories}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Storage Used:</span>
                <span className="font-medium">{(appInfo.storageUsed / 1024).toFixed(2)} KB</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="glass-card">
            <h3 className="flex items-center gap-2 mb-4">
              <SettingsIcon size={20} />
              Quick Actions
            </h3>
            
            <div className="space-y-2">
              <button
                onClick={() => window.location.href = '/'}
                className="w-full btn-primary"
              >
                Go to Dashboard
              </button>
              <button
                onClick={() => window.location.href = '/add-expense'}
                className="w-full btn-success"
              >
                Add New Expense
              </button>
              <button
                onClick={() => window.location.href = '/analytics'}
                className="w-full btn-primary"
              >
                View Analytics
              </button>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="glass-card border-red-500/30">
            <h3 className="flex items-center gap-2 mb-4 text-red-400">
              <AlertTriangle size={20} />
              Danger Zone
            </h3>
            
            {!showDangerZone ? (
              <button
                onClick={() => setShowDangerZone(true)}
                className="w-full btn-danger"
              >
                Show Danger Zone
              </button>
            ) : (
              <div className="space-y-4">
                <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                  <h4 className="font-medium text-red-400 mb-2">⚠️ Clear All Data</h4>
                  <p className="text-sm text-gray-300 mb-3">
                    This will permanently delete all your expenses and reset categories to default. 
                    This action cannot be undone.
                  </p>
                  
                  <input
                    type="text"
                    value={confirmClear}
                    onChange={(e) => setConfirmClear(e.target.value)}
                    placeholder="Type 'CLEAR ALL DATA' to confirm"
                    className="form-input mb-3"
                  />
                  
                  <div className="flex gap-2">
                    <button
                      onClick={handleClearAllData}
                      className="btn-danger flex-1"
                      disabled={confirmClear !== 'CLEAR ALL DATA'}
                    >
                      Clear All Data
                    </button>
                    <button
                      onClick={() => {
                        setShowDangerZone(false);
                        setConfirmClear('');
                      }}
                      className="btn-primary flex-1"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="glass-card mt-8">
        <div className="text-center">
          <h3 className="mb-2">💰 Expense Tracker Pro</h3>
          <p className="text-gray-300 text-sm">
            A modern, responsive expense tracking application built with React.js
          </p>
          <div className="mt-4 flex justify-center gap-4 text-sm text-gray-400">
            <span>🎨 Glass-morphism Design</span>
            <span>📱 Mobile Responsive</span>
            <span>🔒 Secure Local Storage</span>
            <span>📊 Advanced Analytics</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
