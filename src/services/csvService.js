/**
 * CSV Storage Service
 * Handles CSV file operations for expense data persistence
 */

// CSV file name
const CSV_FILE_NAME = 'expense_tracker_data.csv';

/**
 * Convert expense data to CSV format
 * @param {Array} expenses - Array of expense objects
 * @param {Array} categories - Array of category strings
 * @returns {string} CSV formatted string
 */
export const expensesToCSV = (expenses, categories) => {
  // CSV Headers
  const headers = [
    'ID',
    'Description',
    'Amount',
    'Category',
    'Date',
    'Timestamp',
    'Notes'
  ];

  // Convert expenses to CSV rows
  const expenseRows = expenses.map(expense => [
    expense.id || '',
    `"${(expense.description || '').replace(/"/g, '""')}"`, // Escape quotes
    expense.amount || 0,
    `"${(expense.category || '').replace(/"/g, '""')}"`,
    expense.date || '',
    expense.timestamp || '',
    `"${(expense.notes || '').replace(/"/g, '""')}"`
  ]);

  // Add metadata section
  const metadataRows = [
    ['# EXPENSE TRACKER PRO DATA'],
    ['# Generated on:', new Date().toISOString()],
    ['# Categories:', categories.join(';')],
    ['# Total Expenses:', expenses.length.toString()],
    ['# Total Amount:', expenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0).toFixed(2)],
    [''],
    ['# EXPENSE DATA'],
    headers,
    ...expenseRows
  ];

  return metadataRows.map(row => row.join(',')).join('\n');
};

/**
 * Parse CSV data to expense objects
 * @param {string} csvData - CSV formatted string
 * @returns {Object} Parsed data with expenses and categories
 */
export const csvToExpenses = (csvData) => {
  const lines = csvData.split('\n');
  const expenses = [];
  let categories = [];
  
  // Find the header row
  let headerIndex = -1;
  let dataStartIndex = -1;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Extract categories from metadata
    if (line.startsWith('# Categories:')) {
      const categoryData = line.substring('# Categories:'.length).trim();
      if (categoryData) {
        categories = categoryData.split(';').map(cat => cat.trim()).filter(cat => cat);
      }
    }
    
    // Find the header row
    if (line.includes('ID,Description,Amount,Category,Date')) {
      headerIndex = i;
      dataStartIndex = i + 1;
      break;
    }
  }
  
  if (headerIndex === -1) {
    throw new Error('Invalid CSV format: Headers not found');
  }
  
  // Parse expense data
  for (let i = dataStartIndex; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.startsWith('#')) continue;
    
    try {
      const values = parseCSVLine(line);
      
      if (values.length >= 6) {
        const expense = {
          id: values[0] || Date.now().toString(),
          description: values[1] || '',
          amount: parseFloat(values[2]) || 0,
          category: values[3] || '',
          date: values[4] || '',
          timestamp: values[5] || new Date().toISOString(),
          notes: values[6] || ''
        };
        
        expenses.push(expense);
      }
    } catch (error) {
      console.warn('Skipping invalid CSV line:', line, error);
    }
  }
  
  return { expenses, categories };
};

/**
 * Parse a single CSV line with proper quote handling
 * @param {string} line - CSV line
 * @returns {Array} Array of values
 */
const parseCSVLine = (line) => {
  const values = [];
  let current = '';
  let inQuotes = false;
  let i = 0;
  
  while (i < line.length) {
    const char = line[i];
    
    if (char === '"' && !inQuotes) {
      inQuotes = true;
    } else if (char === '"' && inQuotes) {
      if (line[i + 1] === '"') {
        // Escaped quote
        current += '"';
        i++;
      } else {
        inQuotes = false;
      }
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
    
    i++;
  }
  
  values.push(current.trim());
  return values;
};

/**
 * Download CSV file
 * @param {Array} expenses - Array of expense objects
 * @param {Array} categories - Array of category strings
 * @param {string} filename - Optional filename
 */
export const downloadCSV = (expenses, categories, filename = CSV_FILE_NAME) => {
  const csvData = expensesToCSV(expenses, categories);
  const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};

/**
 * Upload and parse CSV file
 * @param {File} file - CSV file object
 * @returns {Promise} Promise resolving to parsed data
 */
export const uploadCSV = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('No file provided'));
      return;
    }
    
    if (!file.name.toLowerCase().endsWith('.csv')) {
      reject(new Error('Please select a CSV file'));
      return;
    }
    
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const csvData = event.target.result;
        const parsedData = csvToExpenses(csvData);
        resolve(parsedData);
      } catch (error) {
        reject(new Error(`Failed to parse CSV: ${error.message}`));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsText(file);
  });
};

/**
 * Auto-save to CSV in browser storage
 * @param {Array} expenses - Array of expense objects
 * @param {Array} categories - Array of category strings
 */
export const autoSaveCSV = (expenses, categories) => {
  try {
    console.log('💾 Auto-saving CSV data:', expenses.length, 'expenses');
    const csvData = expensesToCSV(expenses, categories);
    localStorage.setItem('expense-tracker-csv-backup', csvData);
    localStorage.setItem('expense-tracker-csv-timestamp', new Date().toISOString());
    console.log('✅ CSV auto-save completed');
  } catch (error) {
    console.error('💥 Auto-save CSV failed:', error);
  }
};

/**
 * Load auto-saved CSV data
 * @returns {Object|null} Parsed data or null if no backup exists
 */
export const loadAutoSavedCSV = () => {
  try {
    console.log('🔍 Loading auto-saved CSV data...');
    const csvData = localStorage.getItem('expense-tracker-csv-backup');
    if (!csvData) {
      console.log('❌ No CSV backup found in localStorage');
      return null;
    }
    
    console.log('📄 Found CSV backup, parsing...');
    const timestamp = localStorage.getItem('expense-tracker-csv-timestamp');
    const parsedData = csvToExpenses(csvData);
    
    console.log('✅ CSV loaded successfully:', parsedData.expenses.length, 'expenses');
    
    return {
      ...parsedData,
      backupTimestamp: timestamp
    };
  } catch (error) {
    console.error('💥 Failed to load auto-saved CSV:', error);
    return null;
  }
};

/**
 * Clear auto-saved CSV data
 */
export const clearAutoSavedCSV = () => {
  localStorage.removeItem('expense-tracker-csv-backup');
  localStorage.removeItem('expense-tracker-csv-timestamp');
};

/**
 * Get CSV backup info
 * @returns {Object|null} Backup information or null
 */
export const getCSVBackupInfo = () => {
  const timestamp = localStorage.getItem('expense-tracker-csv-timestamp');
  const csvData = localStorage.getItem('expense-tracker-csv-backup');
  
  if (!timestamp || !csvData) return null;
  
  try {
    const lines = csvData.split('\n');
    const expenseCount = lines.filter(line => 
      line.trim() && 
      !line.startsWith('#') && 
      !line.includes('ID,Description,Amount')
    ).length;
    
    return {
      timestamp,
      expenseCount,
      size: csvData.length
    };
  } catch (error) {
    return { timestamp, expenseCount: 0, size: 0 };
  }
};
