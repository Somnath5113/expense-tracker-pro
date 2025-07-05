import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, AlertCircle, XCircle, Info, X } from 'lucide-react';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

/**
 * Individual notification component
 */
const NotificationItem = ({ notification, onClose }) => {
  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertCircle,
    info: Info
  };

  const colors = {
    success: 'notification-success',
    error: 'notification-error',
    warning: 'notification-warning',
    info: 'notification-info'
  };

  const IconComponent = icons[notification.type];

  return (
    <div className={`notification ${colors[notification.type]}`}>
      <div className="notification-icon">
        <IconComponent size={20} />
      </div>
      <div className="notification-content">
        <h4 className="notification-title">{notification.title}</h4>
        {notification.message && (
          <p className="notification-message">{notification.message}</p>
        )}
      </div>
      <button 
        onClick={() => onClose(notification.id)}
        className="notification-close"
      >
        <X size={16} />
      </button>
      
      <style jsx>{`
        .notification {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          padding: 1rem;
          margin-bottom: 0.5rem;
          border-radius: 12px;
          border: 1px solid var(--glass-border);
          background: var(--glass-bg);
          backdrop-filter: blur(20px);
          box-shadow: var(--shadow-soft);
          animation: slideInRight 0.3s ease;
          transition: all var(--transition-normal);
        }
        
        .notification:hover {
          transform: translateX(-5px);
          box-shadow: var(--shadow-hover);
        }
        
        .notification-success {
          border-left: 4px solid var(--success-color);
        }
        
        .notification-error {
          border-left: 4px solid var(--danger-color);
        }
        
        .notification-warning {
          border-left: 4px solid var(--warning-color);
        }
        
        .notification-info {
          border-left: 4px solid var(--info-color);
        }
        
        .notification-icon {
          color: var(--text-primary);
          margin-top: 0.125rem;
        }
        
        .notification-content {
          flex: 1;
        }
        
        .notification-title {
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0 0 0.25rem 0;
        }
        
        .notification-message {
          font-size: 0.8rem;
          color: var(--text-secondary);
          margin: 0;
          line-height: 1.4;
        }
        
        .notification-close {
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 0.25rem;
          border-radius: 6px;
          transition: all var(--transition-fast);
        }
        
        .notification-close:hover {
          background: var(--glass-bg-strong);
          color: var(--text-primary);
        }
        
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

/**
 * Notification container component
 */
const NotificationContainer = ({ notifications, onClose }) => {
  if (notifications.length === 0) return null;

  return (
    <div className="notification-container">
      {notifications.map(notification => (
        <NotificationItem 
          key={notification.id}
          notification={notification}
          onClose={onClose}
        />
      ))}
      
      <style jsx>{`
        .notification-container {
          position: fixed;
          top: 2rem;
          right: 2rem;
          z-index: 10000;
          max-width: 400px;
          width: 100%;
        }
        
        @media (max-width: 768px) {
          .notification-container {
            top: 1rem;
            right: 1rem;
            left: 1rem;
            max-width: none;
          }
        }
      `}</style>
    </div>
  );
};

/**
 * Notification Provider component
 */
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((notification) => {
    const id = Date.now().toString();
    const newNotification = {
      id,
      type: 'info',
      title: 'Notification',
      ...notification
    };
    
    setNotifications(prev => [...prev, newNotification]);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
    
    return id;
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Convenience methods
  const success = useCallback((title, message) => {
    return addNotification({ type: 'success', title, message });
  }, [addNotification]);

  const error = useCallback((title, message) => {
    return addNotification({ type: 'error', title, message });
  }, [addNotification]);

  const warning = useCallback((title, message) => {
    return addNotification({ type: 'warning', title, message });
  }, [addNotification]);

  const info = useCallback((title, message) => {
    return addNotification({ type: 'info', title, message });
  }, [addNotification]);

  const value = {
    notifications,
    addNotification,
    removeNotification,
    clearAllNotifications,
    success,
    error,
    warning,
    info
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationContainer 
        notifications={notifications}
        onClose={removeNotification}
      />
    </NotificationContext.Provider>
  );
};
