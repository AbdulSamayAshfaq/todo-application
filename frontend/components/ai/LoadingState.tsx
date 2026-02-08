import React from 'react';

interface LoadingStateProps {
  type: 'ai-processing' | 'mcp-execution' | 'network-operation' | 'idle';
  message?: string;
  showSpinner?: boolean;
  className?: string;
}

const LoadingState: React.FC<LoadingStateProps> = ({
  type,
  message,
  showSpinner = true,
  className = ''
}) => {
  // Define type-specific properties
  const getTypeConfig = () => {
    switch (type) {
      case 'ai-processing':
        return {
          color: 'text-blue-600',
          bgColor: 'bg-blue-100',
          borderColor: 'border-blue-200',
          defaultMessage: 'AI is analyzing your request...',
          icon: '🧠'
        };
      case 'mcp-execution':
        return {
          color: 'text-purple-600',
          bgColor: 'bg-purple-100',
          borderColor: 'border-purple-200',
          defaultMessage: 'Executing task management operation...',
          icon: '⚙️'
        };
      case 'network-operation':
        return {
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          borderColor: 'border-green-200',
          defaultMessage: 'Connecting to servers...',
          icon: '📡'
        };
      default:
        return {
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          borderColor: 'border-gray-200',
          defaultMessage: '',
          icon: ''
        };
    }
  };

  const config = getTypeConfig();

  if (type === 'idle') {
    return null;
  }

  return (
    <div className={`flex items-center p-3 rounded-lg ${config.bgColor} ${config.borderColor} border ${className}`}>
      {showSpinner && (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-3" style={{ borderTopColor: 'transparent' }}></div>
      )}
      {config.icon && <span className="mr-2">{config.icon}</span>}
      <span className={`text-sm ${config.color}`}>
        {message || config.defaultMessage}
      </span>
    </div>
  );
};

export default LoadingState;