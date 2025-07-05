import React, { useState, useMemo } from 'react';
import { useExpense } from '../context/ExpenseContext';
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, subDays } from 'date-fns';
import { 
  BarChart3, 
  TrendingUp, 
  PieChart, 
  Calendar,
  Filter,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';

const Analytics = () => {
  const { expenses, categories } = useExpense();
  const [timeRange, setTimeRange] = useState('30'); // days
  const [selectedCategory, setSelectedCategory] = useState('');
  const [chartType, setChartType] = useState('daily'); // daily, weekly, monthly

  // Filter expenses based on time range
  const filteredExpenses = useMemo(() => {
    if (!expenses.length) return [];
    
    const now = new Date();
    const daysBack = timeRange === 'all' ? 365 : parseInt(timeRange);
    const startDate = subDays(now, daysBack);
    
    return expenses.filter(expense => {
      const expenseDate = parseISO(expense.date);
      const isInRange = expenseDate >= startDate && expenseDate <= now;
      const isInCategory = !selectedCategory || expense.category === selectedCategory;
      return isInRange && isInCategory;
    });
  }, [expenses, timeRange, selectedCategory]);

  // Category breakdown data
  const categoryData = useMemo(() => {
    const categoryTotals = {};
    
    filteredExpenses.forEach(expense => {
      const category = expense.category;
      categoryTotals[category] = (categoryTotals[category] || 0) + parseFloat(expense.amount);
    });

    return Object.entries(categoryTotals)
      .map(([category, amount]) => ({ 
        category: category.split(' ')[1] || category, 
        fullCategory: category,
        amount: parseFloat(amount.toFixed(2))
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [filteredExpenses]);

  // Daily spending data
  const dailyData = useMemo(() => {
    const dailyTotals = {};
    
    filteredExpenses.forEach(expense => {
      const date = format(parseISO(expense.date), 'MMM dd');
      dailyTotals[date] = (dailyTotals[date] || 0) + parseFloat(expense.amount);
    });

    return Object.entries(dailyTotals)
      .map(([date, amount]) => ({ date, amount: parseFloat(amount.toFixed(2)) }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [filteredExpenses]);

  // Monthly trend data
  const monthlyData = useMemo(() => {
    const monthlyTotals = {};
    
    filteredExpenses.forEach(expense => {
      const month = format(parseISO(expense.date), 'MMM yyyy');
      monthlyTotals[month] = (monthlyTotals[month] || 0) + parseFloat(expense.amount);
    });

    return Object.entries(monthlyTotals)
      .map(([month, amount]) => ({ month, amount: parseFloat(amount.toFixed(2)) }))
      .sort((a, b) => new Date(a.month) - new Date(b.month));
  }, [filteredExpenses]);

  // Insights calculations
  const insights = useMemo(() => {
    if (!filteredExpenses.length) return {};

    const total = filteredExpenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
    const average = total / filteredExpenses.length;
    const topCategory = categoryData[0];
    const topExpense = filteredExpenses.reduce((max, expense) => 
      parseFloat(expense.amount) > parseFloat(max.amount) ? expense : max
    );

    // Calculate trend
    const midpoint = Math.floor(filteredExpenses.length / 2);
    const firstHalf = filteredExpenses.slice(0, midpoint);
    const secondHalf = filteredExpenses.slice(midpoint);
    
    const firstHalfTotal = firstHalf.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
    const secondHalfTotal = secondHalf.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
    const trend = secondHalfTotal > firstHalfTotal ? 'increasing' : 'decreasing';
    const trendPercentage = firstHalfTotal > 0 ? 
      Math.abs((secondHalfTotal - firstHalfTotal) / firstHalfTotal) * 100 : 0;

    return {
      total,
      average,
      topCategory,
      topExpense,
      trend,
      trendPercentage
    };
  }, [filteredExpenses, categoryData]);

  const COLORS = ['#00d4aa', '#667eea', '#f093fb', '#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#f0932b'];

  if (!expenses.length) {
    return (
      <div className="analytics">
        <div className="page-header">
          <h1>📈 Analytics</h1>
          <p>Analyze your spending patterns and trends</p>
        </div>
        
        <div className="glass-card text-center p-8">
          <div className="text-6xl mb-4">📊</div>
          <h2>No Data Available</h2>
          <p className="text-gray-300 mb-6">
            Add some expenses to see beautiful analytics and insights about your spending habits.
          </p>
          <button 
            className="btn-primary"
            onClick={() => window.location.href = '/add-expense'}
          >
            Add Your First Expense
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="analytics">
      <div className="page-header">
        <h1>📈 Analytics</h1>
        <p>Analyze your spending patterns and trends</p>
      </div>

      {/* Filters */}
      <div className="glass-card mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={20} />
          <h3>Filters</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="form-group">
            <label className="form-label">Time Range</label>
            <select 
              value={timeRange} 
              onChange={(e) => setTimeRange(e.target.value)}
              className="form-input"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="60">Last 60 days</option>
              <option value="90">Last 90 days</option>
              <option value="365">Last year</option>
              <option value="all">All time</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Category</label>
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="form-input"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Chart Type</label>
            <select 
              value={chartType}
              onChange={(e) => setChartType(e.target.value)}
              className="form-input"
            >
              <option value="daily">Daily</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
        </div>
      </div>

      {/* Key Insights */}
      <div className="metrics-grid mb-6">
        <div className="metric-card">
          <div className="metric-icon">💰</div>
          <div className="metric-value">₹{insights.total?.toLocaleString()}</div>
          <div className="metric-label">Total Spent</div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">📊</div>
          <div className="metric-value">₹{insights.average?.toLocaleString()}</div>
          <div className="metric-label">Average per Transaction</div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">🔝</div>
          <div className="metric-value">{insights.topCategory?.category}</div>
          <div className="metric-label">Top Category</div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">
            {insights.trend === 'increasing' ? (
              <ArrowUp className="text-red-400" size={24} />
            ) : (
              <ArrowDown className="text-green-400" size={24} />
            )}
          </div>
          <div className="metric-value">{insights.trendPercentage?.toFixed(1)}%</div>
          <div className="metric-label">Spending Trend</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spending Trend Chart */}
        <div className="chart-container">
          <div className="chart-header">
            <h3 className="chart-title">
              {chartType === 'daily' ? 'Daily' : 'Monthly'} Spending Trend
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartType === 'daily' ? dailyData : monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey={chartType === 'daily' ? 'date' : 'month'} 
                stroke="rgba(255,255,255,0.6)" 
              />
              <YAxis stroke="rgba(255,255,255,0.6)" />
              <Tooltip 
                formatter={(value) => [`₹${value.toLocaleString()}`, 'Amount']}
                contentStyle={{ 
                  backgroundColor: 'rgba(255,255,255,0.1)', 
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '12px',
                  backdropFilter: 'blur(10px)'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="amount" 
                stroke="#00d4aa" 
                fill="rgba(0, 212, 170, 0.3)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Category Breakdown */}
        <div className="chart-container">
          <div className="chart-header">
            <h3 className="chart-title">Category Breakdown</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPieChart>
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
                contentStyle={{ 
                  backgroundColor: 'rgba(255,255,255,0.1)', 
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '12px',
                  backdropFilter: 'blur(10px)'
                }}
              />
            </RechartsPieChart>
          </ResponsiveContainer>
        </div>

        {/* Category Ranking */}
        <div className="chart-container">
          <div className="chart-header">
            <h3 className="chart-title">Category Ranking</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryData.slice(0, 6)}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="category" stroke="rgba(255,255,255,0.6)" />
              <YAxis stroke="rgba(255,255,255,0.6)" />
              <Tooltip 
                formatter={(value) => [`₹${value.toLocaleString()}`, 'Amount']}
                contentStyle={{ 
                  backgroundColor: 'rgba(255,255,255,0.1)', 
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '12px',
                  backdropFilter: 'blur(10px)'
                }}
              />
              <Bar dataKey="amount" fill="#667eea" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Insights Panel */}
        <div className="glass-card">
          <h3 className="flex items-center gap-2 mb-4">
            <TrendingUp size={20} />
            Smart Insights
          </h3>
          
          <div className="space-y-4">
            <div className="p-4 bg-white/5 rounded-lg">
              <h4 className="font-medium mb-2">💡 Top Spending Category</h4>
              <p className="text-sm text-gray-300">
                You spent the most on <strong>{insights.topCategory?.fullCategory}</strong> 
                with ₹{insights.topCategory?.amount?.toLocaleString()}.
              </p>
            </div>

            <div className="p-4 bg-white/5 rounded-lg">
              <h4 className="font-medium mb-2">📈 Spending Trend</h4>
              <p className="text-sm text-gray-300">
                Your spending is {insights.trend} by {insights.trendPercentage?.toFixed(1)}% 
                compared to the previous period.
              </p>
            </div>

            <div className="p-4 bg-white/5 rounded-lg">
              <h4 className="font-medium mb-2">🎯 Highest Single Expense</h4>
              <p className="text-sm text-gray-300">
                Your largest expense was ₹{insights.topExpense?.amount} 
                for "{insights.topExpense?.description}".
              </p>
            </div>

            <div className="p-4 bg-white/5 rounded-lg">
              <h4 className="font-medium mb-2">💰 Average Transaction</h4>
              <p className="text-sm text-gray-300">
                On average, you spend ₹{insights.average?.toLocaleString()} per transaction.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
