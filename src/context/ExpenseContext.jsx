import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import { format } from 'date-fns';
import { autoSaveCSV, loadAutoSavedCSV, downloadCSV, getCSVBackupInfo } from '../services/csvService';
import fileStorageService from '../services/fileStorageService';

// Initial state
const initialState = {
  expenses: [],
  categories: [
    "🍔 Food & Dining",
    "🚗 Transportation", 
    "🛒 Shopping",
    "🏠 Bills & Utilities",
    "🎬 Entertainment",
    "🏥 Healthcare",
    "📚 Education",
    "💼 Business",
    "👕 Clothing",
    "🎁 Gifts",
    "🏖️ Travel",
    "💳 Banking",
    "🔧 Maintenance",
    "📱 Technology",
    "🏃 Fitness",
    "🎨 Hobbies",
    "📰 Subscriptions",
    "🔄 Other"
  ],
  calculatorAmount: 0,
  isLoading: false,
  error: null
};

// Action types
const ACTIONS = {
  ADD_EXPENSE: 'ADD_EXPENSE',
  EDIT_EXPENSE: 'EDIT_EXPENSE',
  DELETE_EXPENSE: 'DELETE_EXPENSE',
  LOAD_EXPENSES: 'LOAD_EXPENSES',
  ADD_CATEGORY: 'ADD_CATEGORY',
  REMOVE_CATEGORY: 'REMOVE_CATEGORY',
  SET_CALCULATOR_AMOUNT: 'SET_CALCULATOR_AMOUNT',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  IMPORT_DATA: 'IMPORT_DATA',
  CLEAR_ALL_DATA: 'CLEAR_ALL_DATA'
};

// Reducer function
function expenseReducer(state, action) {
  switch (action.type) {
    case ACTIONS.ADD_EXPENSE:
      return {
        ...state,
        expenses: [...state.expenses, action.payload],
        error: null
      };
    
    case ACTIONS.EDIT_EXPENSE:
      return {
        ...state,
        expenses: state.expenses.map(expense =>
          expense.id === action.payload.id ? action.payload : expense
        ),
        error: null
      };
    
    case ACTIONS.DELETE_EXPENSE:
      return {
        ...state,
        expenses: state.expenses.filter(expense => expense.id !== action.payload),
        error: null
      };
    
    case ACTIONS.LOAD_EXPENSES:
      return {
        ...state,
        expenses: action.payload,
        isLoading: false,
        error: null
      };
    
    case ACTIONS.ADD_CATEGORY:
      return {
        ...state,
        categories: [...state.categories, action.payload],
        error: null
      };
    
    case ACTIONS.REMOVE_CATEGORY:
      return {
        ...state,
        categories: state.categories.filter(category => category !== action.payload),
        error: null
      };
    
    case ACTIONS.SET_CALCULATOR_AMOUNT:
      return {
        ...state,
        calculatorAmount: action.payload
      };
    
    case ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload
      };
    
    case ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false
      };
    
    case ACTIONS.IMPORT_DATA:
      return {
        ...state,
        expenses: action.payload.expenses || state.expenses,
        categories: action.payload.categories || state.categories,
        error: null
      };
    
    case ACTIONS.CLEAR_ALL_DATA:
      return {
        ...initialState
      };
    
    default:
      return state;
  }
}

// Create context
const ExpenseContext = createContext();

// Custom hook to use expense context
export const useExpense = () => {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error('useExpense must be used within an ExpenseProvider');
  }
  return context;
};

// Provider component
export const ExpenseProvider = ({ children }) => {
  // Initialize state with an empty initial state first
  const [state, dispatch] = useReducer(expenseReducer, initialState);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('🔍 Loading data on mount...');
        
        // Try to load from CSV backup first
        const csvBackup = loadAutoSavedCSV();
        if (csvBackup && csvBackup.expenses.length > 0) {
          console.log('✅ Loading from CSV backup:', csvBackup.expenses.length, 'expenses');
          dispatch({ type: ACTIONS.LOAD_EXPENSES, payload: csvBackup.expenses });
          if (csvBackup.categories.length > 0) {
            dispatch({ type: ACTIONS.IMPORT_DATA, payload: { categories: csvBackup.categories } });
          }
          setIsInitialized(true);
          return;
        }

        // Fallback to localStorage
        const savedExpenses = localStorage.getItem('expenses');
        const savedCategories = localStorage.getItem('categories');
        
        if (savedExpenses) {
          console.log('✅ Loading from localStorage');
          const expenses = JSON.parse(savedExpenses);
          dispatch({ type: ACTIONS.LOAD_EXPENSES, payload: expenses });
          console.log('📊 Loaded expenses:', expenses.length);
        }
        
        if (savedCategories) {
          const categories = JSON.parse(savedCategories);
          dispatch({ type: ACTIONS.IMPORT_DATA, payload: { categories } });
          console.log('📋 Loaded categories:', categories.length);
        }
        
        setIsInitialized(true);
      } catch (error) {
        console.error('💥 Error loading data:', error);
        dispatch({ type: ACTIONS.SET_ERROR, payload: 'Failed to load saved data' });
        setIsInitialized(true);
      }
    };

    loadData();
  }, []);

  // Save data to localStorage, CSV backup, and file whenever expenses or categories change
  useEffect(() => {
    // Don't save if we're not initialized yet
    if (!isInitialized) {
      return;
    }

    // Don't save if we're in the initial state (no expenses and default categories)
    if (state.expenses.length === 0 && JSON.stringify(state.categories) === JSON.stringify(initialState.categories)) {
      return;
    }

    try {
      console.log('💾 Saving data:', state.expenses.length, 'expenses');
      
      // Save to localStorage (for compatibility)
      localStorage.setItem('expenses', JSON.stringify(state.expenses));
      localStorage.setItem('categories', JSON.stringify(state.categories));
      
      // Auto-save to CSV backup
      autoSaveCSV(state.expenses, state.categories);
      
      // Quick save to file if auto-save is active
      if (fileStorageService.isAutoSaveActive()) {
        fileStorageService.quickSave(state.expenses, state.categories).catch(error => {
          console.warn('⚠️ Auto file save failed:', error);
        });
      }
    } catch (error) {
      console.error('💥 Error saving data:', error);
      dispatch({ type: ACTIONS.SET_ERROR, payload: 'Failed to save data' });
    }
  }, [state.expenses, state.categories, isInitialized]);

  // Action creators
  const addExpense = (expense) => {
    const newExpense = {
      id: Date.now().toString(),
      ...expense,
      timestamp: new Date().toISOString(),
      date: expense.date || format(new Date(), 'yyyy-MM-dd')
    };
    dispatch({ type: ACTIONS.ADD_EXPENSE, payload: newExpense });
  };

  const editExpense = (id, updates) => {
    const expense = state.expenses.find(e => e.id === id);
    if (expense) {
      const updatedExpense = { ...expense, ...updates };
      dispatch({ type: ACTIONS.EDIT_EXPENSE, payload: updatedExpense });
    }
  };

  const deleteExpense = (id) => {
    dispatch({ type: ACTIONS.DELETE_EXPENSE, payload: id });
  };

  const addCategory = (category) => {
    if (!state.categories.includes(category)) {
      dispatch({ type: ACTIONS.ADD_CATEGORY, payload: category });
    }
  };

  const removeCategory = (category) => {
    dispatch({ type: ACTIONS.REMOVE_CATEGORY, payload: category });
  };

  const setCalculatorAmount = (amount) => {
    dispatch({ type: ACTIONS.SET_CALCULATOR_AMOUNT, payload: amount });
  };

  const importData = (data) => {
    dispatch({ type: ACTIONS.IMPORT_DATA, payload: data });
  };

  const clearAllData = () => {
    localStorage.removeItem('expenses');
    localStorage.removeItem('categories');
    dispatch({ type: ACTIONS.CLEAR_ALL_DATA });
  };

  const exportToCSV = () => {
    if (state.expenses.length === 0) {
      return null;
    }

    try {
      downloadCSV(state.expenses, state.categories);
      return true;
    } catch (error) {
      console.error('Export failed:', error);
      dispatch({ type: ACTIONS.SET_ERROR, payload: 'Failed to export CSV' });
      return false;
    }
  };

  const exportToTXT = () => {
    if (state.expenses.length === 0) {
      return null;
    }

    const totalAmount = state.expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
    
    const content = `
EXPENSE TRACKER PRO - REPORT
Generated on: ${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}

SUMMARY:
Total Expenses: ₹${totalAmount.toLocaleString()}
Number of Transactions: ${state.expenses.length}

EXPENSE DETAILS:
${state.expenses.map(expense => 
  `${expense.date} | ₹${expense.amount} | ${expense.category} | ${expense.description}`
).join('\n')}

CATEGORY BREAKDOWN:
${Object.entries(
  state.expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + parseFloat(expense.amount);
    return acc;
  }, {})
).map(([category, amount]) => `${category}: ₹${amount.toLocaleString()}`).join('\n')}
    `.trim();

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `expenses_report_${format(new Date(), 'yyyy-MM-dd')}.txt`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getBackupInfo = () => {
    return getCSVBackupInfo();
  };

  // File storage functions
  const saveToFile = async () => {
    try {
      const result = await fileStorageService.saveDataToFile(state.expenses, state.categories);
      if (result.success) {
        dispatch({ type: ACTIONS.SET_ERROR, payload: null });
      } else {
        dispatch({ type: ACTIONS.SET_ERROR, payload: result.error });
      }
      return result;
    } catch (error) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
      return { success: false, error: error.message };
    }
  };

  const loadFromFile = async () => {
    try {
      const result = await fileStorageService.loadDataFromFile();
      if (result.success) {
        dispatch({ type: ACTIONS.LOAD_EXPENSES, payload: result.data.expenses });
        dispatch({ type: ACTIONS.IMPORT_DATA, payload: { categories: result.data.categories } });
        dispatch({ type: ACTIONS.SET_ERROR, payload: null });
      } else {
        dispatch({ type: ACTIONS.SET_ERROR, payload: result.error });
      }
      return result;
    } catch (error) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
      return { success: false, error: error.message };
    }
  };

  const startAutoSave = async () => {
    try {
      const result = await fileStorageService.startAutoSave(
        () => state.expenses,
        () => state.categories
      );
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const stopAutoSave = () => {
    fileStorageService.stopAutoSave();
  };

  const isAutoSaveActive = () => {
    return fileStorageService.isAutoSaveActive();
  };

  const quickSave = async () => {
    try {
      const result = await fileStorageService.quickSave(state.expenses, state.categories);
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const saveBackupCSV = async () => {
    try {
      const result = await fileStorageService.saveBackupCSV(state.expenses, state.categories);
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const value = {
    ...state,
    isInitialized,
    addExpense,
    editExpense,
    deleteExpense,
    addCategory,
    removeCategory,
    setCalculatorAmount,
    importData,
    clearAllData,
    exportToCSV,
    exportToTXT,
    getBackupInfo,
    saveToFile,
    loadFromFile,
    startAutoSave,
    stopAutoSave,
    isAutoSaveActive,
    quickSave,
    saveBackupCSV,
    fileStorageSupported: fileStorageService.isFileSystemAccessSupported()
  };

  return (
    <ExpenseContext.Provider value={value}>
      {children}
    </ExpenseContext.Provider>
  );
};
