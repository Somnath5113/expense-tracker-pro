import React, { useState, useEffect } from 'react';
import { useExpense } from '../context/ExpenseContext';
import { useNotification } from '../context/NotificationContext';
import { format } from 'date-fns';
import { 
  Plus, 
  Calculator, 
  Save, 
  Zap, 
  Tag, 
  Calendar,
  DollarSign,
  FileText,
  Check,
  HardDrive
} from 'lucide-react';

const AddExpense = () => {
  const { addExpense, categories, calculatorAmount } = useExpense();
  const { success, error } = useNotification();
  const [formData, setFormData] = useState({
    amount: '',
    category: categories[0] || '',
    description: '',
    date: format(new Date(), 'yyyy-MM-dd')
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Update amount if calculator amount is available
  useEffect(() => {
    if (calculatorAmount > 0) {
      setFormData(prev => ({ ...prev, amount: calculatorAmount.toString() }));
    }
  }, [calculatorAmount]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.amount || !formData.category) {
      error('Missing Information', 'Please fill in amount and category');
      return;
    }

    if (parseFloat(formData.amount) <= 0) {
      error('Invalid Amount', 'Amount must be greater than 0');
      return;
    }

    setIsSubmitting(true);
    
    try {
      addExpense({
        amount: parseFloat(formData.amount),
        category: formData.category,
        description: formData.description || 'No description',
        date: formData.date
      });
      
      success(
        'Expense Added Successfully! 💰',
        `₹${formData.amount} for ${formData.description || 'expense'} has been saved and backed up to CSV.`
      );
      
      setShowSuccess(true);
      setFormData({
        amount: '',
        category: categories[0] || '',
        description: '',
        date: format(new Date(), 'yyyy-MM-dd')
      });
      
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      console.error('Error adding expense:', err);
      error('Failed to Add Expense', 'Please try again or check your data.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const quickAmounts = [50, 100, 200, 500, 1000, 2000];
  const commonExpenses = [
    { description: 'Coffee', category: '🍔 Food & Dining', amount: 150 },
    { description: 'Lunch', category: '🍔 Food & Dining', amount: 300 },
    { description: 'Groceries', category: '🛒 Shopping', amount: 1500 },
    { description: 'Fuel', category: '🚗 Transportation', amount: 2000 },
    { description: 'Movie', category: '🎬 Entertainment', amount: 400 },
    { description: 'Electricity Bill', category: '🏠 Bills & Utilities', amount: 3000 }
  ];

  const handleQuickAmount = (amount) => {
    setFormData(prev => ({ ...prev, amount: amount.toString() }));
  };

  const handleQuickExpense = (expense) => {
    setFormData(prev => ({
      ...prev,
      amount: expense.amount.toString(),
      category: expense.category,
      description: expense.description
    }));
  };

  return (
    <div className="add-expense">
      <div className="page-header">
        <h1>➕ Add New Expense</h1>
        <p>Record your spending to track your financial habits</p>
      </div>

      {showSuccess && (
        <div className="success animate-slideIn">
          <div className="flex items-center gap-2">
            <Check size={20} />
            <span>Expense added successfully!</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="form-container">
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">
                  <DollarSign size={16} className="inline mr-1" />
                  Amount (₹)
                </label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0.01"
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Tag size={16} className="inline mr-1" />
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <FileText size={16} className="inline mr-1" />
                  Description <span className="optional-label">(Optional)</span>
                </label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="What did you spend on? (Optional)"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Calendar size={16} className="inline mr-1" />
                  Date
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="loading"></div>
                  Adding...
                </>
              ) : (
                <>
                  <Save size={20} />
                  Add Expense
                </>
              )}
            </button>
          </form>
        </div>

        {/* Quick Actions Sidebar */}
        <div className="space-y-6">
          {/* Quick Amounts */}
          <div className="glass-card">
            <h3 className="flex items-center gap-2 mb-4">
              <Zap size={20} />
              Quick Amounts
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {quickAmounts.map(amount => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => handleQuickAmount(amount)}
                  className="quick-action-btn"
                >
                  ₹{amount}
                </button>
              ))}
            </div>
          </div>

          {/* Calculator Integration */}
          <div className="glass-card">
            <h3 className="flex items-center gap-2 mb-4">
              <Calculator size={20} />
              Calculator
            </h3>
            <p className="text-sm text-gray-300 mb-4">
              Use the calculator to compute complex amounts, then transfer them here.
            </p>
            <button
              type="button"
              onClick={() => window.location.href = '/calculator'}
              className="btn-primary w-full"
            >
              Open Calculator
            </button>
            {calculatorAmount > 0 && (
              <div className="mt-2 p-2 bg-green-500/20 border border-green-500/30 rounded-lg">
                <div className="text-sm text-green-400">
                  Calculator Amount: ₹{calculatorAmount.toLocaleString()}
                </div>
              </div>
            )}
          </div>

          {/* Common Expenses */}
          <div className="glass-card">
            <h3 className="flex items-center gap-2 mb-4">
              <Plus size={20} />
              Common Expenses
            </h3>
            <div className="space-y-2">
              {commonExpenses.map((expense, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleQuickExpense(expense)}
                  className="w-full text-left p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <div className="font-medium">{expense.description}</div>
                  <div className="text-sm text-gray-300 flex justify-between">
                    <span>{expense.category}</span>
                    <span>₹{expense.amount}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Pro Tips */}
      <div className="glass-card mt-6">
        <h3 className="mb-4">💡 Pro Tips</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-white/5 rounded-lg">
            <div className="text-lg mb-2">🎯</div>
            <h4 className="font-medium mb-1">Quick Entry</h4>
            <p className="text-sm text-gray-300">
              Only amount and category are required. Description is optional for faster entry.
            </p>
          </div>
          <div className="p-4 bg-white/5 rounded-lg">
            <div className="text-lg mb-2">📅</div>
            <h4 className="font-medium mb-1">Daily Tracking</h4>
            <p className="text-sm text-gray-300">
              Record expenses daily for the most accurate financial insights.
            </p>
          </div>
          <div className="p-4 bg-white/5 rounded-lg">
            <div className="text-lg mb-2">🧮</div>
            <h4 className="font-medium mb-1">Use Calculator</h4>
            <p className="text-sm text-gray-300">
              For complex calculations, use our built-in calculator and transfer amounts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddExpense;
