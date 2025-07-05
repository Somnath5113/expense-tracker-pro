import React, { useState, useEffect } from 'react';
import { useExpense } from '../context/ExpenseContext';
import { useNotification } from '../context/NotificationContext';
import { 
  Save, 
  Upload, 
  Download, 
  HardDrive,
  RefreshCw,
  Play,
  Pause,
  FileText,
  AlertCircle,
  CheckCircle,
  Info
} from 'lucide-react';

const FileStoragePanel = () => {
  const { 
    expenses, 
    categories, 
    fileStorageSupported,
    saveToFile,
    loadFromFile,
    startAutoSave,
    stopAutoSave,
    isAutoSaveActive,
    quickSave,
    saveBackupCSV
  } = useExpense();
  
  const { success, error, info } = useNotification();
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState(null);

  useEffect(() => {
    setIsAutoSaving(isAutoSaveActive());
  }, []);

  const handleSaveToFile = async () => {
    try {
      const result = await saveToFile();
      if (result.success) {
        success('Data Saved Successfully! 💾', 'Your expense data has been saved to a JSON file.');
        setLastSaveTime(new Date());
      } else {
        error('Save Failed', result.error || 'Failed to save data to file');
      }
    } catch (err) {
      error('Save Error', err.message || 'An error occurred while saving');
    }
  };

  const handleLoadFromFile = async () => {
    try {
      const result = await loadFromFile();
      if (result.success) {
        success('Data Loaded Successfully! 📂', 'Your expense data has been loaded from the file.');
      } else {
        error('Load Failed', result.error || 'Failed to load data from file');
      }
    } catch (err) {
      error('Load Error', err.message || 'An error occurred while loading');
    }
  };

  const handleStartAutoSave = async () => {
    try {
      const result = await startAutoSave();
      if (result.success) {
        setIsAutoSaving(true);
        success('Auto-Save Started! 🔄', 'Your data will be automatically saved every 30 seconds.');
      } else {
        error('Auto-Save Failed', result.error || 'Failed to start auto-save');
      }
    } catch (err) {
      error('Auto-Save Error', err.message || 'An error occurred while starting auto-save');
    }
  };

  const handleStopAutoSave = () => {
    stopAutoSave();
    setIsAutoSaving(false);
    info('Auto-Save Stopped', 'Automatic saving has been disabled.');
  };

  const handleQuickSave = async () => {
    try {
      const result = await quickSave();
      if (result.success) {
        success('Quick Save Complete! ⚡', 'Your data has been saved to the existing file.');
        setLastSaveTime(new Date());
      } else {
        error('Quick Save Failed', result.error || 'Failed to quick save');
      }
    } catch (err) {
      error('Quick Save Error', err.message || 'An error occurred during quick save');
    }
  };

  const handleSaveBackupCSV = async () => {
    try {
      const result = await saveBackupCSV();
      if (result.success) {
        success('CSV Backup Saved! 📄', 'Your expense data has been saved as a CSV file.');
      } else {
        error('CSV Backup Failed', result.error || 'Failed to save CSV backup');
      }
    } catch (err) {
      error('CSV Backup Error', err.message || 'An error occurred while saving CSV backup');
    }
  };

  if (!fileStorageSupported) {
    return (
      <div className="glass-card">
        <div className="flex items-center gap-3 mb-4">
          <HardDrive className="w-6 h-6 text-orange-500" />
          <h3 className="text-xl font-semibold">File Storage</h3>
        </div>
        
        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-5 h-5 text-orange-500" />
            <h4 className="font-medium text-orange-800 dark:text-orange-200">
              File System Access Not Supported
            </h4>
          </div>
          <p className="text-sm text-orange-700 dark:text-orange-300">
            Your browser doesn't support the File System Access API. You can still export/import data using the download/upload features below.
          </p>
          
          <div className="mt-4 flex gap-2">
            <button
              onClick={handleSaveBackupCSV}
              className="btn-secondary flex items-center gap-2"
            >
              <Download size={16} />
              Download CSV Backup
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card">
      <div className="flex items-center gap-3 mb-4">
        <HardDrive className="w-6 h-6 text-blue-500" />
        <h3 className="text-xl font-semibold">File Storage</h3>
      </div>
      
      <div className="space-y-4">
        {/* File Storage Info */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Info className="w-5 h-5 text-blue-500" />
            <h4 className="font-medium text-blue-800 dark:text-blue-200">
              Persistent File Storage
            </h4>
          </div>
          <p className="text-sm text-blue-700 dark:text-blue-300">
            Save your expense data to actual files on your computer. This ensures your data is never lost, even if browser data is cleared.
          </p>
        </div>

        {/* Current Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <h4 className="font-medium mb-2">Current Data</h4>
            <div className="space-y-1 text-sm">
              <div>📊 Expenses: {expenses.length}</div>
              <div>📋 Categories: {categories.length}</div>
              <div>💰 Total: ₹{expenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0).toLocaleString()}</div>
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <h4 className="font-medium mb-2">Auto-Save Status</h4>
            <div className="space-y-1 text-sm">
              <div className="flex items-center gap-2">
                {isAutoSaving ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-green-600">Active</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600">Inactive</span>
                  </>
                )}
              </div>
              {lastSaveTime && (
                <div className="text-xs text-gray-500">
                  Last saved: {lastSaveTime.toLocaleTimeString()}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <h4 className="font-medium">Save Operations</h4>
            
            <button
              onClick={handleSaveToFile}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              <Save size={16} />
              Save to File
            </button>
            
            {isAutoSaving ? (
              <button
                onClick={handleQuickSave}
                className="btn-secondary w-full flex items-center justify-center gap-2"
              >
                <RefreshCw size={16} />
                Quick Save
              </button>
            ) : null}
            
            <button
              onClick={handleSaveBackupCSV}
              className="btn-secondary w-full flex items-center justify-center gap-2"
            >
              <FileText size={16} />
              Save CSV Backup
            </button>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-medium">Load & Auto-Save</h4>
            
            <button
              onClick={handleLoadFromFile}
              className="btn-secondary w-full flex items-center justify-center gap-2"
            >
              <Upload size={16} />
              Load from File
            </button>
            
            {isAutoSaving ? (
              <button
                onClick={handleStopAutoSave}
                className="btn-danger w-full flex items-center justify-center gap-2"
              >
                <Pause size={16} />
                Stop Auto-Save
              </button>
            ) : (
              <button
                onClick={handleStartAutoSave}
                className="btn-success w-full flex items-center justify-center gap-2"
              >
                <Play size={16} />
                Start Auto-Save
              </button>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <h4 className="font-medium mb-2">How to Use</h4>
          <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
            <li>• <strong>Save to File:</strong> Choose a location to save your data permanently</li>
            <li>• <strong>Load from File:</strong> Import previously saved data</li>
            <li>• <strong>Auto-Save:</strong> Automatically save changes every 30 seconds</li>
            <li>• <strong>Quick Save:</strong> Save to the previously selected file</li>
            <li>• <strong>CSV Backup:</strong> Export data in CSV format for external use</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default FileStoragePanel;
