// src/components/common/Toast.jsx
import React, { useState, useEffect } from 'react';

const Toast = ({ message, type = 'success', duration = 3000, onClose }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onClose && onClose(), 300); // Wait for fade out animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const bgColor = {
    success: 'bg-green-50 border-green-500',
    error: 'bg-red-50 border-red-500',
    warning: 'bg-yellow-50 border-yellow-500',
    info: 'bg-blue-50 border-blue-500'
  };

  const textColor = {
    success: 'text-green-800',
    error: 'text-red-800',
    warning: 'text-yellow-800',
    info: 'text-blue-800'
  };

  return (
    <div 
      className={`fixed top-4 right-4 p-4 rounded-md shadow-md border-l-4 transition-opacity duration-300 ${
        bgColor[type]
      } ${
        visible ? 'opacity-100' : 'opacity-0'
      } z-50`}
    >
      <div className="flex">
        <div className={`flex-shrink-0 ${textColor[type]}`}>
          {type === 'success' && (
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          )}
          {/* Add icons for other types */}
        </div>
        <div className="ml-3">
          <p className={`text-sm font-medium ${textColor[type]}`}>{message}</p>
        </div>
      </div>
    </div>
  );
};

export default Toast;