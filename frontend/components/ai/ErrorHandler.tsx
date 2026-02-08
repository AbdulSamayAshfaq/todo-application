import React from 'react';

interface ErrorHandlerProps {
  error: Error | string | null;
  onRetry?: () => void;
  onContactSupport?: () => void;
  showActions?: boolean;
}

const ErrorHandler: React.FC<ErrorHandlerProps> = ({
  error,
  onRetry,
  onContactSupport,
  showActions = true
}) => {
  if (!error) return null;

  const errorMessage = typeof error === 'string' ? error : error.message;

  // Determine error type and provide appropriate guidance
  let errorType = 'generic';
  let guidance = 'Please try again or contact support if the problem persists.';
  let actionLabel = 'Try Again';

  if (errorMessage.includes('network') || errorMessage.includes('fetch') || errorMessage.includes('connection')) {
    errorType = 'network';
    guidance = 'Check your internet connection and try again.';
    actionLabel = 'Retry Connection';
  } else if (errorMessage.includes('timeout')) {
    errorType = 'timeout';
    guidance = 'The request took too long. Please try again.';
    actionLabel = 'Retry Request';
  } else if (errorMessage.includes('auth') || errorMessage.includes('token') || errorMessage.includes('unauthorized')) {
    errorType = 'authentication';
    guidance = 'Authentication failed. Please refresh the page or log in again.';
    actionLabel = 'Refresh Session';
  } else if (errorMessage.includes('rate') || errorMessage.includes('limit')) {
    errorType = 'rate-limit';
    guidance = 'Too many requests. Please wait a moment before trying again.';
    actionLabel = 'Wait & Retry';
  } else if (errorMessage.includes('MCP') || errorMessage.includes('tool')) {
    errorType = 'mcp';
    guidance = 'There was an issue with the task management system. Our team has been notified.';
    actionLabel = 'Try Different Action';
  }

  return (
    <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-lg mb-4">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">Something went wrong</h3>
          <div className="mt-2 text-sm text-red-700">
            <p>{errorMessage}</p>
          </div>
          <div className="mt-3">
            <p className="text-xs text-red-600">{guidance}</p>
          </div>

          {showActions && (
            <div className="mt-3 flex space-x-3">
              {onRetry && (
                <button
                  type="button"
                  onClick={onRetry}
                  className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  {actionLabel}
                </button>
              )}
              {onContactSupport && (
                <button
                  type="button"
                  onClick={onContactSupport}
                  className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Contact Support
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorHandler;