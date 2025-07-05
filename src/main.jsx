import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider } from './context/ThemeContext'
import { NotificationProvider } from './context/NotificationContext'
import { ExpenseProvider } from './context/ExpenseContext'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <NotificationProvider>
        <ExpenseProvider>
          <App />
        </ExpenseProvider>
      </NotificationProvider>
    </ThemeProvider>
  </StrictMode>,
)
