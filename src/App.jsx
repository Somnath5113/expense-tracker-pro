import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useTheme } from './context/ThemeContext';
import { useNotification } from './context/NotificationContext';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import AddExpense from './pages/AddExpense';
import Calculator from './pages/Calculator';
import Analytics from './pages/Analytics';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import './App.css';

function App() {
  const { theme } = useTheme();

  return (
    <Router>
      <div className={`app ${theme}`}>
        <Sidebar />
        <main className="main-content">
          <div className="container">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/add-expense" element={<AddExpense />} />
              <Route path="/calculator" element={<Calculator />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}

export default App;
