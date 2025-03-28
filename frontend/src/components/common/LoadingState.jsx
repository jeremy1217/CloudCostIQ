// src/components/common/LoadingState.jsx
const LoadingState = ({ message = "Loading..." }) => (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      <p className="mt-4 text-gray-500">{message}</p>
    </div>
  );
  
  // src/components/common/ErrorState.jsx
  const ErrorState = ({ message, onRetry }) => (
    <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-sm text-red-700">{message}</p>
          {onRetry && (
            <button 
              onClick={onRetry}
              className="mt-2 text-sm font-medium text-red-700 hover:text-red-600"
            >
              Try again
            </button>
          )}
        </div>
      </div>
    </div>
  );