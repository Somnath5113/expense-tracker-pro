import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  const navigate = useNavigate();
  const location = useLocation();

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

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  return (
    <div className="dashboard">
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Your financial overview at a glance</p>
      </div>

      {/* Filters */}
      <div className="dashboard-filters">
        <div className="filter-header">
          <Filter size={18} />
          <span>Filters</span>
        </div>
        
        <div className="filter-controls">
          <div className="filter-group">
            <label>Time Period</label>
            <select 
              value={filterDays} 
              onChange={(e) => setFilterDays(parseInt(e.target.value))}
              className="filter-select"
            >
              <option value={7}>Last 7 days</option>
              <option value={14}>Last 14 days</option>
              <option value={30}>Last 30 days</option>
              <option value={60}>Last 60 days</option>
              <option value={90}>Last 90 days</option>
              <option value={365}>Last year</option>
            </select>
          </div>

          <div className="filter-group categories-filter">
            <label>
              Categories
              {selectedCategories.length > 0 && (
                <span className="selected-count">({selectedCategories.length} selected)</span>
              )}
            </label>
            <div className="categories-filter-container">
              <div className="categories-chips">
                <div 
                  className={`category-chip ${selectedCategories.length === 0 ? 'active' : ''}`}
                  onClick={() => setSelectedCategories([])}
                >
                  <span>All</span>
                  {selectedCategories.length === 0 && <span className="chip-check">✓</span>}
                </div>
                {categories.map(category => {
                  const isSelected = selectedCategories.includes(category);
                  const categoryIcon = category.split(' ')[0] || '💰';
                  const categoryName = category.split(' ').slice(1).join(' ') || category;
                  
                  return (
                    <div 
                      key={category}
                      className={`category-chip ${isSelected ? 'active' : ''}`}
                      onClick={() => {
                        if (isSelected) {
                          setSelectedCategories(selectedCategories.filter(c => c !== category));
                        } else {
                          setSelectedCategories([...selectedCategories, category]);
                        }
                      }}
                    >
                      <span className="chip-icon">{categoryIcon}</span>
                      <span className="chip-name">{categoryName}</span>
                      {isSelected && <span className="chip-check">✓</span>}
                    </div>
                  );
                })}
              </div>
              {selectedCategories.length > 0 && (
                <div className="filter-actions">
                  <button 
                    className="clear-filters-btn"
                    onClick={() => setSelectedCategories([])}
                  >
                    Clear All
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="metrics-overview">
        <div className="metric-card primary">
          <div className="metric-content">
            <div className="metric-header">
              <DollarSign size={24} className="metric-icon" />
              <div className="metric-trend">
                {metrics.changePercent >= 0 ? (
                  <ArrowUpRight size={16} className="trend-up" />
                ) : (
                  <ArrowDownRight size={16} className="trend-down" />
                )}
                <span className="trend-value">{Math.abs(metrics.changePercent).toFixed(1)}%</span>
              </div>
            </div>
            <div className="metric-value">₹{metrics.total.toLocaleString()}</div>
            <div className="metric-label">Total Expenses</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-content">
            <div className="metric-header">
              <Calendar size={24} className="metric-icon" />
            </div>
            <div className="metric-value">₹{metrics.average.toLocaleString()}</div>
            <div className="metric-label">Average Daily</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-content">
            <div className="metric-header">
              <TrendingUp size={24} className="metric-icon" />
            </div>
            <div className="metric-value">₹{metrics.highest.toLocaleString()}</div>
            <div className="metric-label">Highest Expense</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-content">
            <div className="metric-header">
              <CreditCard size={24} className="metric-icon" />
            </div>
            <div className="metric-value">{metrics.count}</div>
            <div className="metric-label">Transactions</div>
          </div>
        </div>
      </div>

      {expenses.length === 0 ? (
        <div className="dashboard-empty">
          <div className="empty-icon">🎯</div>
          <h2>Welcome to Expense Tracker Pro!</h2>
          <p>Start tracking your expenses to see beautiful insights and analytics.</p>
          <button 
            className="btn-primary"
            onClick={() => navigate('/add-expense')}
          >
            Add Your First Expense
          </button>
        </div>
      ) : (
        <div className="dashboard-content">
          {/* Charts Section */}
          <div className="charts-section">
            {/* Spending Trend Chart */}
            <div className="chart-card">
              <div className="chart-header">
                <h3>Daily Spending Trend</h3>
                <TrendingUp size={20} className="chart-icon" />
              </div>
              <div className="chart-content">
                <ThemedChart>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" />
                      <XAxis 
                        dataKey="date" 
                        stroke="var(--text-muted)"
                        fontSize={12}
                      />
                      <YAxis 
                        stroke="var(--text-muted)"
                        fontSize={12}
                      />
                      <Tooltip 
                        formatter={(value) => [`₹${value.toLocaleString()}`, 'Amount']}
                        contentStyle={{
                          backgroundColor: 'var(--glass-bg)',
                          border: '1px solid var(--glass-border)',
                          borderRadius: '12px',
                          backdropFilter: 'blur(10px)'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="amount" 
                        stroke="#3b82f6" 
                        strokeWidth={2}
                        dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, fill: '#3b82f6' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ThemedChart>
              </div>
            </div>

            {/* Category Breakdown */}
            <div className="categories-section">
              <div className="section-header">
                <h3>Top Categories</h3>
                <div className="chart-icon">📊</div>
              </div>
              
              <div className="categories-grid">
                {categoryData.map((category, index) => {
                  const percentage = ((category.amount / metrics.total) * 100).toFixed(1);
                  const categoryIcon = categories.find(cat => cat.includes(category.category))?.split(' ')[0] || '💰';
                  
                  return (
                    <div key={category.category} className="category-card">
                      <div className="category-header">
                        <div className="category-icon" style={{ backgroundColor: COLORS[index % COLORS.length] }}>
                          {categoryIcon}
                        </div>
                        <div className="category-info">
                          <h4 className="category-name">{category.category}</h4>
                          <div className="category-percentage">{percentage}%</div>
                        </div>
                        <div className="category-amount">₹{category.amount.toLocaleString()}</div>
                      </div>
                      <div className="category-progress">
                        <div 
                          className="category-progress-fill" 
                          style={{ 
                            width: `${percentage}%`,
                            backgroundColor: COLORS[index % COLORS.length]
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Small pie chart for visual reference */}
              <div className="category-chart-small">
                <ThemedChart>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        outerRadius={60}
                        fill="#8884d8"
                        dataKey="amount"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => [`₹${value.toLocaleString()}`, 'Amount']}
                        contentStyle={{
                          backgroundColor: 'var(--glass-bg)',
                          border: '1px solid var(--glass-border)',
                          borderRadius: '12px',
                          backdropFilter: 'blur(10px)'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </ThemedChart>
              </div>
            </div>
          </div>

          {/* Recent Expenses */}
          <div className="expenses-section">
            <div className="section-header">
              <h3>Recent Expenses</h3>
              <button 
                className="btn-primary"
                onClick={() => navigate('/add-expense')}
              >
                Add New
              </button>
            </div>
            
            <div className="expenses-list">
              {metrics.filteredExpenses.slice(0, 10).map((expense) => (
                <div key={expense.id} className="expense-item">
                  <div className="expense-details">
                    <div className="expense-title">{expense.description}</div>
                    <div className="expense-meta">
                      <span className="expense-category">{expense.category}</span>
                      <span className="expense-date">{format(parseISO(expense.date), 'MMM dd, yyyy')}</span>
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
