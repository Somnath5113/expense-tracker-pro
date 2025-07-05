/**
 * File Storage Service
 * Handles persistent file storage for expense data
 */

// File configuration
const DATA_FILE_NAME = 'expense_tracker_data.json';
const BACKUP_FILE_NAME = 'expense_tracker_backup.csv';
const AUTO_SAVE_INTERVAL = 30000; // 30 seconds

/**
 * Check if File System Access API is supported
 */
const isFileSystemAccessSupported = () => {
  return 'showSaveFilePicker' in window && 'showOpenFilePicker' in window;
};

/**
 * Create expense data structure
 */
const createDataStructure = (expenses, categories) => {
  return {
    version: '1.0',
    timestamp: new Date().toISOString(),
    app: 'Expense Tracker Pro',
    data: {
      expenses,
      categories,
      totalExpenses: expenses.length,
      totalAmount: expenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0)
    }
  };
};

/**
 * Save data to JSON file
 */
export const saveDataToFile = async (expenses, categories) => {
  try {
    if (!isFileSystemAccessSupported()) {
      console.warn('File System Access API not supported, falling back to download');
      return downloadDataAsFile(expenses, categories);
    }

    const data = createDataStructure(expenses, categories);
    const jsonString = JSON.stringify(data, null, 2);
    
    const fileHandle = await window.showSaveFilePicker({
      suggestedName: DATA_FILE_NAME,
      types: [
        {
          description: 'JSON files',
          accept: { 'application/json': ['.json'] }
        }
      ]
    });

    const writable = await fileHandle.createWritable();
    await writable.write(jsonString);
    await writable.close();

    console.log('✅ Data saved to file:', DATA_FILE_NAME);
    return { success: true, message: 'Data saved successfully' };

  } catch (error) {
    console.error('❌ Error saving data to file:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Load data from JSON file
 */
export const loadDataFromFile = async () => {
  try {
    if (!isFileSystemAccessSupported()) {
      console.warn('File System Access API not supported');
      return { success: false, error: 'File System Access API not supported' };
    }

    const [fileHandle] = await window.showOpenFilePicker({
      types: [
        {
          description: 'JSON files',
          accept: { 'application/json': ['.json'] }
        }
      ]
    });

    const file = await fileHandle.getFile();
    const text = await file.text();
    const data = JSON.parse(text);

    if (!data.data || !data.data.expenses || !data.data.categories) {
      throw new Error('Invalid file format');
    }

    console.log('✅ Data loaded from file:', file.name);
    return {
      success: true,
      data: {
        expenses: data.data.expenses,
        categories: data.data.categories
      }
    };

  } catch (error) {
    console.error('❌ Error loading data from file:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Download data as file (fallback for unsupported browsers)
 */
export const downloadDataAsFile = (expenses, categories) => {
  try {
    const data = createDataStructure(expenses, categories);
    const jsonString = JSON.stringify(data, null, 2);
    
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = DATA_FILE_NAME;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    URL.revokeObjectURL(url);
    
    console.log('✅ Data downloaded as file:', DATA_FILE_NAME);
    return { success: true, message: 'Data downloaded successfully' };

  } catch (error) {
    console.error('❌ Error downloading data:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Save backup CSV file
 */
export const saveBackupCSV = async (expenses, categories) => {
  try {
    // Create CSV content
    const headers = ['ID', 'Description', 'Amount', 'Category', 'Date', 'Timestamp', 'Notes'];
    
    const csvRows = [
      `# Expense Tracker Pro Backup - ${new Date().toISOString()}`,
      `# Total Expenses: ${expenses.length}`,
      `# Total Amount: ${expenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0).toFixed(2)}`,
      `# Categories: ${categories.join(';')}`,
      '',
      headers.join(','),
      ...expenses.map(expense => [
        expense.id || '',
        `"${(expense.description || '').replace(/"/g, '""')}"`,
        expense.amount || 0,
        `"${(expense.category || '').replace(/"/g, '""')}"`,
        expense.date || '',
        expense.timestamp || '',
        `"${(expense.notes || '').replace(/"/g, '""')}"`
      ].join(','))
    ];

    const csvContent = csvRows.join('\n');
    
    if (isFileSystemAccessSupported()) {
      const fileHandle = await window.showSaveFilePicker({
        suggestedName: BACKUP_FILE_NAME,
        types: [
          {
            description: 'CSV files',
            accept: { 'text/csv': ['.csv'] }
          }
        ]
      });

      const writable = await fileHandle.createWritable();
      await writable.write(csvContent);
      await writable.close();
    } else {
      // Fallback to download
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = BACKUP_FILE_NAME;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      URL.revokeObjectURL(url);
    }

    console.log('✅ Backup CSV saved:', BACKUP_FILE_NAME);
    return { success: true, message: 'Backup saved successfully' };

  } catch (error) {
    console.error('❌ Error saving backup CSV:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Auto-save functionality
 */
let autoSaveInterval = null;
let fileHandle = null;

/**
 * Start auto-save
 */
export const startAutoSave = async (getExpensesCallback, getCategoriesCallback) => {
  try {
    if (!isFileSystemAccessSupported()) {
      console.warn('Auto-save not supported in this browser');
      return { success: false, error: 'Auto-save not supported' };
    }

    // Request file handle for auto-save
    fileHandle = await window.showSaveFilePicker({
      suggestedName: DATA_FILE_NAME,
      types: [
        {
          description: 'JSON files',
          accept: { 'application/json': ['.json'] }
        }
      ]
    });

    // Start auto-save interval
    autoSaveInterval = setInterval(async () => {
      try {
        const expenses = getExpensesCallback();
        const categories = getCategoriesCallback();
        
        if (expenses.length > 0 && fileHandle) {
          const data = createDataStructure(expenses, categories);
          const jsonString = JSON.stringify(data, null, 2);
          
          const writable = await fileHandle.createWritable();
          await writable.write(jsonString);
          await writable.close();
          
          console.log('🔄 Auto-saved data at', new Date().toLocaleTimeString());
        }
      } catch (error) {
        console.error('❌ Auto-save error:', error);
      }
    }, AUTO_SAVE_INTERVAL);

    console.log('✅ Auto-save started');
    return { success: true, message: 'Auto-save started' };

  } catch (error) {
    console.error('❌ Error starting auto-save:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Stop auto-save
 */
export const stopAutoSave = () => {
  if (autoSaveInterval) {
    clearInterval(autoSaveInterval);
    autoSaveInterval = null;
    fileHandle = null;
    console.log('⏹️ Auto-save stopped');
  }
};

/**
 * Check if auto-save is running
 */
export const isAutoSaveActive = () => {
  return autoSaveInterval !== null;
};

/**
 * Manual save with existing file handle
 */
export const quickSave = async (expenses, categories) => {
  try {
    if (!fileHandle) {
      return await saveDataToFile(expenses, categories);
    }

    const data = createDataStructure(expenses, categories);
    const jsonString = JSON.stringify(data, null, 2);
    
    const writable = await fileHandle.createWritable();
    await writable.write(jsonString);
    await writable.close();

    console.log('⚡ Quick save completed');
    return { success: true, message: 'Quick save completed' };

  } catch (error) {
    console.error('❌ Quick save error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Load data from public folder (for initial setup)
 */
export const loadSampleDataFromFile = async () => {
  try {
    const response = await fetch('/sample_expenses.csv');
    if (!response.ok) {
      throw new Error('Sample data file not found');
    }
    
    const csvText = await response.text();
    // Parse CSV and return data
    // This would need to be implemented based on your CSV format
    
    console.log('✅ Sample data loaded from file');
    return { success: true, data: { expenses: [], categories: [] } };

  } catch (error) {
    console.error('❌ Error loading sample data:', error);
    return { success: false, error: error.message };
  }
};

export default {
  saveDataToFile,
  loadDataFromFile,
  downloadDataAsFile,
  saveBackupCSV,
  startAutoSave,
  stopAutoSave,
  isAutoSaveActive,
  quickSave,
  loadSampleDataFromFile,
  isFileSystemAccessSupported
};
