import React, { useState, useMemo, useEffect } from 'react';
import { useExpense } from '../context/ExpenseContext';
import { format, parseISO, subDays, isWithinInterval } from 'date-fns';
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  CreditCard, 
  DollarSign,
  Filter,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';
import ThemedChart from '../components/ThemedChart';

const Dashboard = () => {
  const { expenses, categories, error, isLoading, isInitialized } = useExpense();
  const [filterDays, setFilterDays] = useState(30);
  const [selectedCategories, setSelectedCategories] = useState([]);

  // Calculate metrics (must be before early return to follow Rules of Hooks)
  const metrics = useMemo(() => {
    const now = new Date();
    const filterDate = subDays(now, filterDays);
    
    const filteredExpenses = expenses.filter(expense => {
      const expenseDate = parseISO(expense.date);
      const isInDateRange = isWithinInterval(expenseDate, { start: filterDate, end: now });
      const isInCategories = selectedCategories.length === 0 || selectedCategories.includes(expense.category);
      return isInDateRange && isInCategories;
    });

    const total = filteredExpenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
    const count = filteredExpenses.length;
    const average = count > 0 ? total / count : 0;
    const highest = filteredExpenses.length > 0 ? Math.max(...filteredExpenses.map(e => parseFloat(e.amount))) : 0;

    // Previous period comparison
    const previousPeriodStart = subDays(filterDate, filterDays);
    const previousExpenses = expenses.filter(expense => {
      const expenseDate = parseISO(expense.date);
      return isWithinInterval(expenseDate, { start: previousPeriodStart, end: filterDate });
    });
    const previousTotal = previousExpenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
    const changePercent = previousTotal > 0 ? ((total - previousTotal) / previousTotal) * 100 : 0;

    return {
      total,
      count,
      average,
      highest,
      changePercent,
      filteredExpenses
    };
  }, [expenses, filterDays, selectedCategories]);

  // Prepare chart data
  const chartData = useMemo(() => {
    const dailyData = {};
    
    metrics.filteredExpenses.forEach(expense => {
      const date = format(parseISO(expense.date), 'MMM dd');
      dailyData[date] = (dailyData[date] || 0) + parseFloat(expense.amount);
    });

    return Object.entries(dailyData)
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [metrics.filteredExpenses]);

  // Category breakdown
  const categoryData = useMemo(() => {
    const categoryTotals = {};
    
    metrics.filteredExpenses.forEach(expense => {
      const category = expense.category.split(' ')[1] || expense.category; // Remove emoji
      categoryTotals[category] = (categoryTotals[category] || 0) + parseFloat(expense.amount);
    });

    return Object.entries(categoryTotals)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5); // Top 5 categories
  }, [metrics.filteredExpenses]);

  // Show loading state while initializing
  if (!isInitialized) {
    return (
      <div className="dashboard">
        <div className="dashboard-header">
          <h1>Loading...</h1>
          <p>Initializing your expense data...</p>
        </div>
        <div className="glass-card text-center p-6">
          <div className="text-6xl mb-4">⏳</div>
          <h2>Loading Your Data</h2>
          <p className="text-lg text-gray-300">
            Please wait while we load your saved expenses...
          </p>
        </div>
      </div>
    );
  }

  const COLORS = ['#00d4aa', '#667eea', '#f093fb', '#ff6b6b', '#4ecdc4'];

  return (
    <div className="dashboard">
      <div className="page-header">
        <h1>💰 Dashboard</h1>
        <p>Your financial overview at a glance</p>
      </div>

      {/* Filters */}
      <div className="glass-card mb-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="flex items-center gap-2">
            <Filter size={20} />
            Filters
          </h3>
        </div>
        
        <div className="flex gap-4 flex-wrap">
          <div className="form-group">
            <label className="form-label">Time Period</label>
            <select 
              value={filterDays} 
              onChange={(e) => setFilterDays(parseInt(e.target.value))}
              className="form-input"
            >
              <option value={7}>Last 7 days</option>
              <option value={14}>Last 14 days</option>
              <option value={30}>Last 30 days</option>
              <option value={60}>Last 60 days</option>
              <option value={90}>Last 90 days</option>
              <option value={365}>Last year</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Categories</label>
            <select 
              multiple 
              value={selectedCategories}
              onChange={(e) => setSelectedCategories(Array.from(e.target.selectedOptions, option => option.value))}
              className="form-input"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon">💸</div>
          <div className="metric-value">₹{metrics.total.toLocaleString()}</div>
          <div className="metric-label">Total Expenses</div>
          <div className={`flex items-center gap-1 mt-2 ${metrics.changePercent >= 0 ? 'text-red-400' : 'text-green-400'}`}>
            {metrics.changePercent >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
            <span className="text-sm">{Math.abs(metrics.changePercent).toFixed(1)}%</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">📅</div>
          <div className="metric-value">₹{metrics.average.toLocaleString()}</div>
          <div className="metric-label">Average Daily</div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">🔝</div>
          <div className="metric-value">₹{metrics.highest.toLocaleString()}</div>
          <div className="metric-label">Highest Expense</div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">📊</div>
          <div className="metric-value">{metrics.count}</div>
          <div className="metric-label">Transactions</div>
        </div>
      </div>

      {expenses.length === 0 ? (
        <div className="glass-card text-center p-6">
          <div className="text-6xl mb-4">🎯</div>
          <h2>Welcome to Expense Tracker Pro!</h2>
          <p className="text-lg text-gray-300 mb-6">
            Start tracking your expenses to see beautiful insights and analytics.
          </p>
          <div className="flex gap-4 justify-center">
            <button 
              className="btn-primary"
              onClick={() => window.location.href = '/add-expense'}
            >
              Add Your First Expense
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Spending Trend Chart */}
          <div className="chart-container">
            <div className="chart-header">
              <h3 className="chart-title">Daily Spending Trend</h3>
            </div>
            <ThemedChart>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [`₹${value.toLocaleString()}`, 'Amount']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="#00d4aa" 
                    strokeWidth={3}
                    dot={{ fill: '#00d4aa', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ThemedChart>
          </div>

          {/* Category Breakdown */}
          <div className="chart-container">
            <div className="chart-header">
              <h3 className="chart-title">Top Categories</h3>
            </div>
            <ThemedChart>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="amount"
                    label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [`₹${value.toLocaleString()}`, 'Amount']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </ThemedChart>
          </div>

          {/* Recent Expenses */}
          <div className="glass-card lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="flex items-center gap-2">
                <CreditCard size={20} />
                Recent Expenses
              </h3>
              <button 
                className="btn-primary"
                onClick={() => window.location.href = '/add-expense'}
              >
                Add New
              </button>
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              {metrics.filteredExpenses.slice(0, 10).map((expense) => (
                <div key={expense.id} className="expense-card">
                  <div className="expense-info">
                    <div className="expense-description">{expense.description}</div>
                    <div className="expense-meta">
                      <span>{expense.category}</span>
                      <span>•</span>
                      <span>{format(parseISO(expense.date), 'MMM dd, yyyy')}</span>
                    </div>
                  </div>
                  <div className="expense-amount">
                    ₹{parseFloat(expense.amount).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
