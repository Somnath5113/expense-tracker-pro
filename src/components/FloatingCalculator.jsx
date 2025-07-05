import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useExpense } from '../context/ExpenseContext';
import { useNotification } from '../context/NotificationContext';
import { format } from 'date-fns';
import { Calculator as CalcIcon, Plus, RotateCcw, Check, X, DollarSign, Tag, Calendar, FileText, Save } from 'lucide-react';

const FloatingCalculator = () => {
  const { setCalculatorAmount, addExpense, categories } = useExpense();
  const { success, error } = useNotification();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpenseOpen, setIsExpenseOpen] = useState(false);
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState(null);
  const [operation, setOperation] = useState(null);
  const [waitingForNumber, setWaitingForNumber] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [expenseForm, setExpenseForm] = useState({
    amount: '',
    category: categories[0] || '',
    description: '',
    date: format(new Date(), 'yyyy-MM-dd')
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const modalRef = useRef(null);
  const expenseModalRef = useRef(null);

  // Handle click outside to close modal
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target) && isOpen) {
        setIsOpen(false);
      }
      if (expenseModalRef.current && !expenseModalRef.current.contains(event.target) && isExpenseOpen) {
        setIsExpenseOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, isExpenseOpen]);

  const inputNumber = useCallback((num) => {
    if (waitingForNumber) {
      setDisplay(String(num));
      setWaitingForNumber(false);
    } else {
      setDisplay(display === '0' ? String(num) : display + num);
    }
  }, [display, waitingForNumber]);

  const inputDecimal = useCallback(() => {
    if (waitingForNumber) {
      setDisplay('0.');
      setWaitingForNumber(false);
    } else if (display.indexOf('.') === -1) {
      setDisplay(display + '.');
    }
  }, [display, waitingForNumber]);

  const clear = useCallback(() => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForNumber(false);
  }, []);

  const performOperation = useCallback((nextOperation) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue || 0;
      const newValue = calculate(currentValue, inputValue, operation);

      setDisplay(String(newValue));
      setPreviousValue(newValue);
    }

    setWaitingForNumber(true);
    setOperation(nextOperation);
  }, [display, previousValue, operation]);

  const calculate = (firstValue, secondValue, operation) => {
    switch (operation) {
      case '+':
        return firstValue + secondValue;
      case '-':
        return firstValue - secondValue;
      case '×':
        return firstValue * secondValue;
      case '÷':
        return secondValue !== 0 ? firstValue / secondValue : 0;
      default:
        return secondValue;
    }
  };

  const handleEquals = useCallback(() => {
    const inputValue = parseFloat(display);

    if (previousValue !== null && operation) {
      const newValue = calculate(previousValue, inputValue, operation);
      setDisplay(String(newValue));
      setPreviousValue(null);
      setOperation(null);
      setWaitingForNumber(true);
    }
  }, [display, previousValue, operation]);

  const handlePercentage = useCallback(() => {
    const value = parseFloat(display);
    setDisplay(String(value / 100));
  }, [display]);

  const handlePlusMinus = useCallback(() => {
    const value = parseFloat(display);
    setDisplay(String(value * -1));
  }, [display]);

  const addAsExpense = useCallback(() => {
    const amount = parseFloat(display);
    if (amount > 0) {
      setCalculatorAmount(amount);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  }, [display, setCalculatorAmount]);

  const toggleCalculator = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      // Reset calculator when opening
      clear();
    }
  };

  const toggleExpenseForm = () => {
    setIsExpenseOpen(!isExpenseOpen);
    if (!isExpenseOpen) {
      // Reset expense form when opening
      setExpenseForm({
        amount: '',
        category: categories[0] || '',
        description: '',
        date: format(new Date(), 'yyyy-MM-dd')
      });
    }
  };

  const handleExpenseInputChange = (e) => {
    const { name, value } = e.target;
    setExpenseForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleExpenseSubmit = async (e) => {
    e.preventDefault();
    
    if (!expenseForm.amount || !expenseForm.category) {
      error('Missing Information', 'Please fill in amount and category');
      return;
    }

    if (parseFloat(expenseForm.amount) <= 0) {
      error('Invalid Amount', 'Amount must be greater than 0');
      return;
    }

    setIsSubmitting(true);
    
    try {
      addExpense({
        amount: parseFloat(expenseForm.amount),
        category: expenseForm.category,
        description: expenseForm.description || 'No description',
        date: expenseForm.date
      });
      
      success(
        'Expense Added Successfully! 💰',
        `₹${expenseForm.amount} for ${expenseForm.description || 'expense'} has been saved.`
      );
      
      setExpenseForm({
        amount: '',
        category: categories[0] || '',
        description: '',
        date: format(new Date(), 'yyyy-MM-dd')
      });
      
      setTimeout(() => setIsExpenseOpen(false), 1000);
      
    } catch (err) {
      error('Error', 'Failed to add expense. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const Button = ({ onClick, className, children, ...props }) => (
    <button
      onClick={onClick}
      className={`calc-btn ${className}`}
      {...props}
    >
      {children}
    </button>
  );

  return (
    <>
      {/* Floating Add Expense Icon */}
      <div className="floating-expense-icon" onClick={toggleExpenseForm}>
        <Plus size={24} />
        <div className="floating-expense-pulse"></div>
      </div>

      {/* Floating Calculator Icon */}
      <div className="floating-calc-icon" onClick={toggleCalculator}>
        <CalcIcon size={24} />
        <div className="floating-calc-pulse"></div>
      </div>

      {/* Calculator Modal */}
      {isOpen && (
        <div className="floating-calc-overlay">
          <div className="floating-calc-modal" ref={modalRef}>
            <div className="floating-calc-header">
              <h3 className="floating-calc-title">
                <CalcIcon size={20} />
                Calculator
              </h3>
              <button className="floating-calc-close" onClick={toggleCalculator}>
                <X size={20} />
              </button>
            </div>

            {showSuccess && (
              <div className="floating-calc-success">
                <div className="flex items-center gap-2">
                  <Check size={16} />
                  <span>Amount ready for expense!</span>
                </div>
              </div>
            )}

            <div className="floating-calculator-container">
              <div className="floating-calculator-display">
                {display}
              </div>
              
              <div className="floating-calculator-buttons">
                {/* Row 1 */}
                <div className="floating-calc-row">
                  <Button onClick={clear} className="function">AC</Button>
                  <Button onClick={handlePlusMinus} className="function">±</Button>
                  <Button onClick={handlePercentage} className="function">%</Button>
                  <Button onClick={() => performOperation('÷')} className="operator">÷</Button>
                </div>
                
                {/* Row 2 */}
                <div className="floating-calc-row">
                  <Button onClick={() => inputNumber(7)} className="number">7</Button>
                  <Button onClick={() => inputNumber(8)} className="number">8</Button>
                  <Button onClick={() => inputNumber(9)} className="number">9</Button>
                  <Button onClick={() => performOperation('×')} className="operator">×</Button>
                </div>
                
                {/* Row 3 */}
                <div className="floating-calc-row">
                  <Button onClick={() => inputNumber(4)} className="number">4</Button>
                  <Button onClick={() => inputNumber(5)} className="number">5</Button>
                  <Button onClick={() => inputNumber(6)} className="number">6</Button>
                  <Button onClick={() => performOperation('-')} className="operator">−</Button>
                </div>
                
                {/* Row 4 */}
                <div className="floating-calc-row">
                  <Button onClick={() => inputNumber(1)} className="number">1</Button>
                  <Button onClick={() => inputNumber(2)} className="number">2</Button>
                  <Button onClick={() => inputNumber(3)} className="number">3</Button>
                  <Button onClick={() => performOperation('+')} className="operator">+</Button>
                </div>
                
                {/* Row 5 */}
                <div className="floating-calc-row">
                  <Button onClick={() => inputNumber(0)} className="number zero">0</Button>
                  <Button onClick={inputDecimal} className="number">.</Button>
                  <Button onClick={handleEquals} className="operator">=</Button>
                </div>
              </div>

              <div className="floating-calc-actions">
                <button
                  onClick={addAsExpense}
                  className="floating-calc-add-btn"
                  disabled={parseFloat(display) <= 0}
                >
                  <Plus size={16} />
                  Add as Expense
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Expense Form Modal */}
      {isExpenseOpen && (
        <div className="floating-expense-overlay">
          <div className="floating-expense-modal" ref={expenseModalRef}>
            <div className="floating-expense-header">
              <h3 className="floating-expense-title">
                <Plus size={20} />
                Add Expense
              </h3>
              <button className="floating-expense-close" onClick={toggleExpenseForm}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleExpenseSubmit} className="floating-expense-form">
              <div className="floating-expense-field">
                <label htmlFor="amount" className="floating-expense-label">
                  <DollarSign size={16} />
                  Amount
                </label>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  value={expenseForm.amount}
                  onChange={handleExpenseInputChange}
                  placeholder="Enter amount"
                  className="floating-expense-input"
                  step="0.01"
                  min="0"
                  required
                />
              </div>

              <div className="floating-expense-field">
                <label htmlFor="category" className="floating-expense-label">
                  <Tag size={16} />
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  value={expenseForm.category}
                  onChange={handleExpenseInputChange}
                  className="floating-expense-input"
                  required
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="floating-expense-field">
                <label htmlFor="description" className="floating-expense-label">
                  <FileText size={16} />
                  Description
                </label>
                <input
                  type="text"
                  id="description"
                  name="description"
                  value={expenseForm.description}
                  onChange={handleExpenseInputChange}
                  placeholder="Enter description"
                  className="floating-expense-input"
                />
              </div>

              <div className="floating-expense-field">
                <label htmlFor="date" className="floating-expense-label">
                  <Calendar size={16} />
                  Date
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={expenseForm.date}
                  onChange={handleExpenseInputChange}
                  className="floating-expense-input"
                  required
                />
              </div>

              <button
                type="submit"
                className="floating-expense-submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="floating-expense-spinner"></div>
                    Adding...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Add Expense
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .floating-expense-icon {
          position: fixed;
          bottom: 100px;
          right: 24px;
          width: 56px;
          height: 56px;
          background: linear-gradient(135deg, #00d4aa 0%, #00b894 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 8px 32px rgba(0, 212, 170, 0.3);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 1000;
          color: white;
          border: none;
          backdrop-filter: blur(10px);
          overflow: hidden;
          user-select: none;
          animation: floating-expense-breathe 3s ease-in-out infinite;
        }

        @keyframes floating-expense-breathe {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        .floating-expense-icon:hover {
          animation-play-state: paused;
          transform: scale(1.15) rotate(5deg);
          box-shadow: 0 12px 48px rgba(0, 212, 170, 0.4), 0 0 40px rgba(0, 212, 170, 0.3);
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        }

        .floating-expense-icon:active {
          transform: scale(0.95);
        }

        .floating-expense-pulse {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: linear-gradient(135deg, #00d4aa 0%, #00b894 100%);
          animation: floating-expense-pulse 2s infinite;
          z-index: -1;
        }

        @keyframes floating-expense-pulse {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.2);
            opacity: 0.7;
          }
          100% {
            transform: scale(1.4);
            opacity: 0;
          }
        }

        .floating-expense-overlay {
          position: fixed;
          bottom: 120px;
          right: 24px;
          z-index: 1001;
          animation: floating-expense-overlay-in 0.3s ease-out;
        }

        @keyframes floating-expense-overlay-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .floating-expense-modal {
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          border-radius: 24px;
          padding: 0;
          width: 320px;
          max-height: 600px;
          overflow-y: auto;
          overflow-x: hidden;
          box-shadow: 0 25px 75px rgba(0, 0, 0, 0.3);
          backdrop-filter: blur(20px);
          animation: floating-expense-modal-in 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        @keyframes floating-expense-modal-in {
          from {
            opacity: 0;
            transform: scale(0.8) translateY(20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .floating-expense-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 24px;
          border-bottom: 1px solid var(--glass-border);
          background: var(--glass-bg-light);
        }

        .floating-expense-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 1.2rem;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0;
        }

        .floating-expense-close {
          background: none;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          padding: 8px;
          border-radius: 50%;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .floating-expense-close:hover {
          background: var(--glass-hover);
          color: var(--text-primary);
          transform: scale(1.1);
        }

        .floating-expense-form {
          padding: 20px;
        }

        .floating-expense-field {
          margin-bottom: 16px;
        }

        .floating-expense-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.9rem;
          font-weight: 500;
          color: var(--text-primary);
          margin-bottom: 6px;
        }

        .floating-expense-input {
          width: 100%;
          padding: 10px 14px;
          border: 1px solid var(--glass-border);
          border-radius: 12px;
          background: var(--glass-bg);
          color: var(--text-primary);
          font-size: 0.95rem;
          font-family: inherit;
          transition: all 0.2s ease;
          backdrop-filter: blur(10px);
          box-sizing: border-box;
        }

        .floating-expense-input:focus {
          outline: none;
          border-color: #00d4aa;
          box-shadow: 0 0 0 3px rgba(0, 212, 170, 0.1);
        }

        .floating-expense-input::placeholder {
          color: var(--text-secondary);
        }

        .floating-expense-submit {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, #00d4aa, #00b894);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 20px;
          box-shadow: 0 4px 15px rgba(0, 212, 170, 0.3);
          min-height: 48px;
        }

        .floating-expense-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 212, 170, 0.3);
        }

        .floating-expense-submit:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .floating-expense-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: white;
          animation: floating-expense-spin 1s linear infinite;
        }

        @keyframes floating-expense-spin {
          to { transform: rotate(360deg); }
        }

        .floating-calc-icon {
          position: fixed;
          bottom: 24px;
          right: 24px;
          width: 64px;
          height: 64px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 1000;
          color: white;
          border: none;
          backdrop-filter: blur(10px);
          overflow: hidden;
          user-select: none;
          animation: floating-breathe 3s ease-in-out infinite;
        }

        @keyframes floating-breathe {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        .floating-calc-icon:hover {
          animation-play-state: paused;
          transform: scale(1.15) rotate(5deg);
          box-shadow: 0 12px 48px rgba(102, 126, 234, 0.4), 0 0 40px rgba(102, 126, 234, 0.3);
          background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%);
        }

        .floating-calc-icon:active {
          transform: scale(0.95);
        }

        .floating-calc-pulse {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          animation: floating-pulse 2s infinite;
          z-index: -1;
        }

        @keyframes floating-pulse {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.2);
            opacity: 0.7;
          }
          100% {
            transform: scale(1.4);
            opacity: 0;
          }
        }

        .floating-calc-overlay {
          position: fixed;
          bottom: 100px;
          right: 24px;
          z-index: 1001;
          animation: floating-overlay-in 0.3s ease-out;
        }

        @keyframes floating-overlay-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .floating-calc-modal {
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          border-radius: 24px;
          padding: 0;
          width: 320px;
          max-height: 500px;
          overflow: hidden;
          box-shadow: 0 25px 75px rgba(0, 0, 0, 0.3);
          backdrop-filter: blur(20px);
          animation: floating-modal-in 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        @keyframes floating-modal-in {
          from {
            opacity: 0;
            transform: scale(0.8) translateY(20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .floating-calc-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 24px;
          border-bottom: 1px solid var(--glass-border);
          background: var(--glass-bg-light);
        }

        .floating-calc-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 1.2rem;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0;
        }

        .floating-calc-close {
          background: none;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          padding: 8px;
          border-radius: 50%;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .floating-calc-close:hover {
          background: var(--glass-hover);
          color: var(--text-primary);
          transform: scale(1.1);
        }

        .floating-calc-success {
          background: linear-gradient(135deg, #00d4aa, #00b894);
          color: white;
          padding: 12px 24px;
          font-size: 0.9rem;
          animation: floating-success-in 0.3s ease-out;
        }

        @keyframes floating-success-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .floating-calculator-container {
          padding: 24px;
          background: #1c1c1e;
          border-radius: 0 0 24px 24px;
        }

        .floating-calculator-display {
          background: transparent;
          color: white;
          font-size: 2.5rem;
          font-weight: 200;
          text-align: right;
          padding: 16px 0;
          margin-bottom: 20px;
          font-family: 'Inter', sans-serif;
          min-height: 60px;
          display: flex;
          align-items: flex-end;
          justify-content: flex-end;
          border-radius: 12px;
          overflow: hidden;
          word-break: break-all;
          border-bottom: 1px solid #333;
        }

        .floating-calculator-buttons {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .floating-calc-row {
          display: flex;
          gap: 12px;
          justify-content: space-between;
        }

        .calc-btn {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          border: none;
          font-size: 1.4rem;
          font-weight: 400;
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: 'Inter', sans-serif;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .calc-btn:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 16px rgba(0,0,0,0.3);
        }

        .calc-btn:active {
          transform: scale(0.95);
        }

        .calc-btn.number {
          background: #333333;
          color: white;
        }

        .calc-btn.operator {
          background: #ff9500;
          color: white;
        }

        .calc-btn.function {
          background: #a6a6a6;
          color: black;
        }

        .calc-btn.zero {
          width: 132px;
          border-radius: 30px;
          justify-content: flex-start;
          padding-left: 20px;
        }

        .floating-calc-actions {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid #333;
        }

        .floating-calc-add-btn {
          width: 100%;
          padding: 12px;
          background: linear-gradient(135deg, #00d4aa, #00b894);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .floating-calc-add-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 212, 170, 0.3);
        }

        .floating-calc-add-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .floating-expense-icon {
            bottom: 85px;
            right: 20px;
            width: 48px;
            height: 48px;
          }

          .floating-calc-icon {
            bottom: 20px;
            right: 20px;
            width: 56px;
            height: 56px;
          }

          .floating-expense-overlay {
            bottom: 140px;
            right: 20px;
            left: 20px;
            width: auto;
          }

          .floating-expense-modal {
            width: 100%;
            max-width: 320px;
            max-height: 500px;
            margin: 0 auto;
          }

          .floating-calc-overlay {
            bottom: 85px;
            right: 20px;
          }

          .floating-calc-modal {
            width: 280px;
            max-height: 450px;
          }

          .floating-calculator-display {
            font-size: 2rem;
            min-height: 50px;
          }

          .calc-btn {
            width: 50px;
            height: 50px;
            font-size: 1.2rem;
          }

          .calc-btn.zero {
            width: 112px;
            padding-left: 16px;
          }
        }
      `}</style>
    </>
  );
};

export default FloatingCalculator;
