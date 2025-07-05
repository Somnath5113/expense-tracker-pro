import React, { useState, useMemo } from 'react';
import { useExpense } from '../context/ExpenseContext';
import { format, parseISO, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { 
  FileText, 
  Download, 
  Calendar, 
  TrendingUp,
  DollarSign,
  PieChart,
  BarChart3,
  Target,
  Award,
  AlertCircle
} from 'lucide-react';

const Reports = () => {
  const { expenses, exportToCSV, exportToTXT } = useExpense();
  const [reportPeriod, setReportPeriod] = useState('30');
  const [reportType, setReportType] = useState('summary');

  // Filter expenses based on report period
  const filteredExpenses = useMemo(() => {
    if (!expenses.length) return [];
    
    const now = new Date();
    let startDate;
    
    switch (reportPeriod) {
      case '7':
        startDate = subDays(now, 7);
        break;
      case '30':
        startDate = subDays(now, 30);
        break;
      case '90':
        startDate = subDays(now, 90);
        break;
      case 'month':
        startDate = startOfMonth(now);
        break;
      case 'all':
        startDate = new Date(0);
        break;
      default:
        startDate = subDays(now, 30);
    }
    
    return expenses.filter(expense => {
      const expenseDate = parseISO(expense.date);
      return expenseDate >= startDate && expenseDate <= now;
    });
  }, [expenses, reportPeriod]);

  // Calculate summary statistics
  const summary = useMemo(() => {
    if (!filteredExpenses.length) return {};

    const total = filteredExpenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
    const average = total / filteredExpenses.length;
    const count = filteredExpenses.length;
    
    // Category breakdown
    const categoryTotals = {};
    filteredExpenses.forEach(expense => {
      categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + parseFloat(expense.amount);
    });
    
    const sortedCategories = Object.entries(categoryTotals)
      .sort(([,a], [,b]) => b - a)
      .map(([category, amount]) => ({ category, amount }));

    // Daily averages
    const dailyTotals = {};
    filteredExpenses.forEach(expense => {
      const date = format(parseISO(expense.date), 'yyyy-MM-dd');
      dailyTotals[date] = (dailyTotals[date] || 0) + parseFloat(expense.amount);
    });
    
    const dailyAmounts = Object.values(dailyTotals);
    const dailyAverage = dailyAmounts.length > 0 ? dailyAmounts.reduce((a, b) => a + b, 0) / dailyAmounts.length : 0;
    const highestDay = Math.max(...dailyAmounts, 0);
    const lowestDay = Math.min(...dailyAmounts, 0);

    // Find patterns
    const topExpense = filteredExpenses.reduce((max, expense) => 
      parseFloat(expense.amount) > parseFloat(max.amount) ? expense : max
    );

    return {
      total,
      average,
      count,
      categoryTotals: sortedCategories,
      dailyAverage,
      highestDay,
      lowestDay,
      topExpense
    };
  }, [filteredExpenses]);

  // Generate recommendations
  const recommendations = useMemo(() => {
    if (!summary.categoryTotals || !summary.categoryTotals.length) return [];

    const recs = [];
    
    // Top spending category
    const topCategory = summary.categoryTotals[0];
    if (topCategory) {
      const percentage = (topCategory.amount / summary.total) * 100;
      if (percentage > 40) {
        recs.push({
          type: 'warning',
          title: 'High Category Spending',
          description: `${topCategory.category} accounts for ${percentage.toFixed(1)}% of your expenses. Consider reviewing this category.`,
          icon: AlertCircle
        });
      }
    }

    // Daily spending pattern
    if (summary.dailyAverage > 0) {
      const monthlyProjection = summary.dailyAverage * 30;
      recs.push({
        type: 'info',
        title: 'Monthly Projection',
        description: `Based on current spending, you're projected to spend ₹${monthlyProjection.toLocaleString()} this month.`,
        icon: TrendingUp
      });
    }

    // Savings opportunity
    if (summary.categoryTotals.length > 1) {
      const secondCategory = summary.categoryTotals[1];
      const potentialSavings = secondCategory.amount * 0.1; // 10% reduction
      recs.push({
        type: 'success',
        title: 'Savings Opportunity',
        description: `Reducing ${secondCategory.category} by 10% could save you ₹${potentialSavings.toLocaleString()}.`,
        icon: Target
      });
    }

    return recs;
  }, [summary]);

  const handleExport = (format) => {
    if (format === 'csv') {
      exportToCSV();
    } else if (format === 'txt') {
      exportToTXT();
    }
  };

  if (!expenses.length) {
    return (
      <div className="reports">
        <div className="page-header">
          <h1>📋 Reports</h1>
          <p>Generate detailed reports and export your data</p>
        </div>
        
        <div className="glass-card text-center p-8">
          <div className="text-6xl mb-4">📊</div>
          <h2>No Data Available</h2>
          <p className="text-gray-300 mb-6">
            Add some expenses to generate comprehensive reports and insights.
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
    <div className="reports">
      <div className="page-header">
        <h1>📋 Reports</h1>
        <p>Generate detailed reports and export your data</p>
      </div>

      {/* Report Configuration */}
      <div className="glass-card mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="flex items-center gap-2">
            <FileText size={20} />
            Report Configuration
          </h3>
          <div className="flex gap-2">
            <button 
              onClick={() => handleExport('csv')}
              className="btn-success flex items-center gap-2"
            >
              <Download size={16} />
              Export CSV
            </button>
            <button 
              onClick={() => handleExport('txt')}
              className="btn-primary flex items-center gap-2"
            >
              <Download size={16} />
              Export TXT
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-group">
            <label className="form-label">Report Period</label>
            <select 
              value={reportPeriod} 
              onChange={(e) => setReportPeriod(e.target.value)}
              className="form-input"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="month">This month</option>
              <option value="all">All time</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Report Type</label>
            <select 
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="form-input"
            >
              <option value="summary">Summary Report</option>
              <option value="detailed">Detailed Report</option>
              <option value="category">Category Analysis</option>
            </select>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="metrics-grid mb-6">
        <div className="metric-card">
          <div className="metric-icon">💰</div>
          <div className="metric-value">₹{summary.total?.toLocaleString()}</div>
          <div className="metric-label">Total Expenses</div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">📊</div>
          <div className="metric-value">{summary.count}</div>
          <div className="metric-label">Total Transactions</div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">📅</div>
          <div className="metric-value">₹{summary.dailyAverage?.toLocaleString()}</div>
          <div className="metric-label">Daily Average</div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">🔝</div>
          <div className="metric-value">₹{summary.highestDay?.toLocaleString()}</div>
          <div className="metric-label">Highest Day</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Summary Report */}
        <div className="lg:col-span-2">
          <div className="glass-card">
            <h3 className="flex items-center gap-2 mb-4">
              <BarChart3 size={20} />
              {reportType === 'summary' ? 'Summary Report' : 
               reportType === 'detailed' ? 'Detailed Report' : 'Category Analysis'}
            </h3>
            
            {reportType === 'summary' && (
              <div className="space-y-4">
                <div className="p-4 bg-white/5 rounded-lg">
                  <h4 className="font-medium mb-2">📊 Overview</h4>
                  <p className="text-sm text-gray-300 mb-2">
                    Report Period: {reportPeriod === '7' ? 'Last 7 days' : 
                                   reportPeriod === '30' ? 'Last 30 days' : 
                                   reportPeriod === '90' ? 'Last 90 days' : 
                                   reportPeriod === 'month' ? 'This month' : 'All time'}
                  </p>
                  <p className="text-sm text-gray-300">
                    You have made {summary.count} transactions totaling ₹{summary.total?.toLocaleString()}.
                    Your average transaction amount is ₹{summary.average?.toLocaleString()}.
                  </p>
                </div>

                <div className="p-4 bg-white/5 rounded-lg">
                  <h4 className="font-medium mb-2">🏆 Top Categories</h4>
                  <div className="space-y-2">
                    {summary.categoryTotals?.slice(0, 5).map((category, index) => (
                      <div key={category.category} className="flex justify-between items-center">
                        <span className="text-sm">{index + 1}. {category.category}</span>
                        <span className="text-sm font-medium">₹{category.amount.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-white/5 rounded-lg">
                  <h4 className="font-medium mb-2">🎯 Spending Patterns</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-300">Highest Day:</span>
                      <span className="ml-2 font-medium">₹{summary.highestDay?.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-300">Lowest Day:</span>
                      <span className="ml-2 font-medium">₹{summary.lowestDay?.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-300">Daily Average:</span>
                      <span className="ml-2 font-medium">₹{summary.dailyAverage?.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-300">Largest Expense:</span>
                      <span className="ml-2 font-medium">₹{summary.topExpense?.amount}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {reportType === 'detailed' && (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredExpenses.map((expense) => (
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
            )}

            {reportType === 'category' && (
              <div className="space-y-3">
                {summary.categoryTotals?.map((category, index) => (
                  <div key={category.category} className="p-3 bg-white/5 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">{category.category}</span>
                      <span className="text-lg font-bold">₹{category.amount.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                        style={{ width: `${(category.amount / summary.total) * 100}%` }}
                      ></div>
                    </div>
                    <div className="text-sm text-gray-300 mt-1">
                      {((category.amount / summary.total) * 100).toFixed(1)}% of total spending
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recommendations */}
        <div className="space-y-6">
          <div className="glass-card">
            <h3 className="flex items-center gap-2 mb-4">
              <Award size={20} />
              Smart Recommendations
            </h3>
            
            <div className="space-y-3">
              {recommendations.map((rec, index) => (
                <div key={index} className={`p-3 rounded-lg ${
                  rec.type === 'warning' ? 'bg-orange-500/20 border border-orange-500/30' :
                  rec.type === 'success' ? 'bg-green-500/20 border border-green-500/30' :
                  'bg-blue-500/20 border border-blue-500/30'
                }`}>
                  <div className="flex items-start gap-2">
                    <rec.icon size={16} className="mt-1" />
                    <div>
                      <h4 className="font-medium text-sm">{rec.title}</h4>
                      <p className="text-xs text-gray-300 mt-1">{rec.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card">
            <h3 className="flex items-center gap-2 mb-4">
              <Download size={20} />
              Export Options
            </h3>
            
            <div className="space-y-3">
              <button 
                onClick={() => handleExport('csv')}
                className="w-full btn-success flex items-center justify-center gap-2"
              >
                <Download size={16} />
                Export as CSV
              </button>
              <button 
                onClick={() => handleExport('txt')}
                className="w-full btn-primary flex items-center justify-center gap-2"
              >
                <Download size={16} />
                Export as TXT
              </button>
            </div>
            
            <div className="mt-4 p-3 bg-white/5 rounded-lg">
              <h4 className="font-medium text-sm mb-2">📄 Export Information</h4>
              <ul className="text-xs text-gray-300 space-y-1">
                <li>• CSV: Spreadsheet format for analysis</li>
                <li>• TXT: Detailed text report</li>
                <li>• All transactions included</li>
                <li>• Compatible with Excel/Google Sheets</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
