import React, { createContext, useContext, useState, useCallback } from 'react';

// Create the context
const AppContext = createContext();

// Context provider component
export function AppProvider({ children }) {
    // Global state
    const [timeRange, setTimeRange] = useState('month');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [notifications, setNotifications] = useState([]);

    // Remove a notification
    const removeNotification = useCallback((id) => {
        setNotifications(prev => prev.filter(notification => notification.id !== id));
    }, []);

    // Add a notification
    const addNotification = useCallback((message, type = 'info') => {
        const id = Date.now();
        setNotifications(prev => [...prev, { id, message, type }]);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            removeNotification(id);
        }, 5000);
        
        return id;
    }, [removeNotification]); // Fixed: Added removeNotification as a dependency

    // Set global loading state
    const setLoading = useCallback((loading) => {
        setIsLoading(loading);
    }, []);

    // Set global error
    const setGlobalError = useCallback((errorMessage) => {
        setError(errorMessage);
        if (errorMessage) {
            addNotification(errorMessage, 'error');
        }
    }, [addNotification]);

    // Clear global error
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    // Context value
    const contextValue = {
        // State
        timeRange,
        isLoading,
        error,
        notifications,
        
        // Actions
        setTimeRange,
        setLoading,
        setError: setGlobalError,
        clearError,
        addNotification,
        removeNotification
    };

    return (
        <AppContext.Provider value={contextValue}>
            {children}
            
            {/* Notifications display */}
            {notifications.length > 0 && (
                <div style={{ 
                    position: 'fixed', 
                    bottom: '20px', 
                    right: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    maxWidth: '300px',
                    zIndex: 9999
                }}>
                    {notifications.map(notification => (
                        <div
                            key={notification.id}
                            style={{
                                padding: '12px 16px',
                                borderRadius: '8px',
                                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                                backgroundColor: notification.type === 'error' ? '#fee2e2' : 
                                                notification.type === 'success' ? '#d1fae5' : 
                                                notification.type === 'warning' ? '#fef3c7' : '#e0f2fe',
                                color: notification.type === 'error' ? '#b91c1c' :
                                        notification.type === 'success' ? '#047857' :
                                        notification.type === 'warning' ? '#b45309' : '#0369a1',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}
                        >
                            <span>{notification.message}</span>
                            <button 
                                onClick={() => removeNotification(notification.id)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: '16px',
                                    marginLeft: '10px'
                                }}
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </AppContext.Provider>
    );
}

// Custom hook for using the context
export function useAppContext() {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
}