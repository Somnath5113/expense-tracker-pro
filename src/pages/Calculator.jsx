import React, { useState, useCallback } from 'react';
import { useExpense } from '../context/ExpenseContext';
import { Calculator as CalcIcon, Plus, RotateCcw, Check } from 'lucide-react';

const Calculator = () => {
  const { setCalculatorAmount } = useExpense();
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState(null);
  const [operation, setOperation] = useState(null);
  const [waitingForNumber, setWaitingForNumber] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

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
    <div className="calculator-page">
      <div className="page-header">
        <h1>🧮 Calculator</h1>
        <p>calculator for expense</p>
      </div>

      {showSuccess && (
        <div className="success animate-slideIn">
          <div className="flex items-center gap-2">
            <Check size={20} />
            <span>Amount ready for expense entry! Go to Add Expense to complete.</span>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Calculator */}
        <div className="calculator-container">
          <div className="calculator-display">
            {display}
          </div>
          
          <div className="calculator-buttons">
            {/* Row 1 */}
            <div className="calc-row">
              <Button onClick={clear} className="function">AC</Button>
              <Button onClick={handlePlusMinus} className="function">±</Button>
              <Button onClick={handlePercentage} className="function">%</Button>
              <Button onClick={() => performOperation('÷')} className="operator">÷</Button>
            </div>
            
            {/* Row 2 */}
            <div className="calc-row">
              <Button onClick={() => inputNumber(7)} className="number">7</Button>
              <Button onClick={() => inputNumber(8)} className="number">8</Button>
              <Button onClick={() => inputNumber(9)} className="number">9</Button>
              <Button onClick={() => performOperation('×')} className="operator">×</Button>
            </div>
            
            {/* Row 3 */}
            <div className="calc-row">
              <Button onClick={() => inputNumber(4)} className="number">4</Button>
              <Button onClick={() => inputNumber(5)} className="number">5</Button>
              <Button onClick={() => inputNumber(6)} className="number">6</Button>
              <Button onClick={() => performOperation('-')} className="operator">−</Button>
            </div>
            
            {/* Row 4 */}
            <div className="calc-row">
              <Button onClick={() => inputNumber(1)} className="number">1</Button>
              <Button onClick={() => inputNumber(2)} className="number">2</Button>
              <Button onClick={() => inputNumber(3)} className="number">3</Button>
              <Button onClick={() => performOperation('+')} className="operator">+</Button>
            </div>
            
            {/* Row 5 */}
            <div className="calc-row">
              <Button onClick={() => inputNumber(0)} className="number zero">0</Button>
              <Button onClick={inputDecimal} className="number">.</Button>
              <Button onClick={handleEquals} className="operator">=</Button>
            </div>
          </div>
        </div>

        {/* Actions Panel */}
        <div className="actions-panel">
          <div className="glass-card">
            <h3 className="flex items-center gap-2 mb-4">
              <Plus size={20} />
              Quick Actions
            </h3>
            
            <div className="space-y-3">
              <button
                onClick={addAsExpense}
                className="btn-success w-full flex items-center justify-center gap-2"
                disabled={parseFloat(display) <= 0}
              >
                <Plus size={20} />
                Add as Expense
              </button>
              
              <button
                onClick={clear}
                className="btn-warning w-full flex items-center justify-center gap-2"
              >
                <RotateCcw size={20} />
                Clear All
              </button>
              
              <button
                onClick={() => window.location.href = '/add-expense'}
                className="btn-primary w-full"
              >
                Go to Add Expense
              </button>
            </div>
            
            <div className="mt-4 p-3 bg-white/5 rounded-lg">
              <div className="text-sm text-gray-300">
                <strong>Current Amount:</strong> ₹{parseFloat(display).toLocaleString()}
              </div>
            </div>
          </div>

          <div className="glass-card">
            <h3 className="flex items-center gap-2 mb-4">
              <CalcIcon size={20} />
              Calculator Tips
            </h3>
            
            <div className="space-y-3 text-sm text-gray-300">
              <div className="flex items-start gap-2">
                <span className="text-blue-400">AC:</span>
                <span>Clear all calculations</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-400">±:</span>
                <span>Change positive/negative sign</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-400">%:</span>
                <span>Convert to percentage (divide by 100)</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-400">💡:</span>
                <span>Use 'Add as Expense' to quickly create an expense entry</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .calculator-container {
          background: #1c1c1e;
          border-radius: 24px;
          padding: 20px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.4);
          max-width: 320px;
          margin: 0 auto;
        }

        .calculator-display {
          background: transparent;
          color: white;
          font-size: 3rem;
          font-weight: 200;
          text-align: right;
          padding: 20px;
          margin-bottom: 20px;
          font-family: 'Inter', sans-serif;
          min-height: 80px;
          display: flex;
          align-items: flex-end;
          justify-content: flex-end;
          border-radius: 12px;
          overflow: hidden;
          word-break: break-all;
        }

        .calculator-buttons {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .calc-row {
          display: flex;
          gap: 10px;
          justify-content: space-between;
        }

        .calc-btn {
          width: 70px;
          height: 70px;
          border-radius: 50%;
          border: none;
          font-size: 1.8rem;
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
          box-shadow: 0 8px 25px rgba(0,0,0,0.3);
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
          width: 150px;
          border-radius: 35px;
          justify-content: flex-start;
          padding-left: 25px;
        }

        .actions-panel {
          flex: 1;
          max-width: 400px;
        }

        @media (max-width: 768px) {
          .calculator-container {
            max-width: 280px;
            padding: 15px;
          }
          
          .calculator-display {
            font-size: 2.5rem;
            padding: 15px;
            min-height: 60px;
          }
          
          .calc-btn {
            width: 60px;
            height: 60px;
            font-size: 1.5rem;
          }
          
          .calc-btn.zero {
            width: 126px;
            padding-left: 20px;
          }
        }
      `}</style>
    </div>
  );
};

export default Calculator;
