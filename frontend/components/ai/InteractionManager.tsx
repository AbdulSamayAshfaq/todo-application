import React, { useState } from 'react';

interface QuickReplyOption {
  id: string;
  label: string;
  prompt: string;
}

interface SuggestedAction {
  id: string;
  label: string;
  action: () => void;
  icon?: string;
}

interface InteractionManagerProps {
  onSendMessage: (message: string) => void;
  quickReplies?: QuickReplyOption[];
  suggestedActions?: SuggestedAction[];
  isLoading?: boolean;
  placeholder?: string;
}

const InteractionManager: React.FC<InteractionManagerProps> = ({
  onSendMessage,
  quickReplies = [],
  suggestedActions = [],
  isLoading = false,
  placeholder = 'Type your message...'
}) => {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  const handleQuickReply = (prompt: string) => {
    if (!isLoading) {
      onSendMessage(prompt);
    }
  };

  return (
    <div className="flex flex-col">
      {/* Quick Replies */}
      {quickReplies.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {quickReplies.map((reply) => (
            <button
              key={reply.id}
              onClick={() => handleQuickReply(reply.prompt)}
              disabled={isLoading}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-full text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {reply.label}
            </button>
          ))}
        </div>
      )}

      {/* Suggested Actions */}
      {suggestedActions.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {suggestedActions.map((action) => (
            <button
              key={action.id}
              onClick={action.action}
              disabled={isLoading}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {action.icon && <span className="mr-1">{action.icon}</span>}
              {action.label}
            </button>
          ))}
        </div>
      )}

      {/* Message Input */}
      <form onSubmit={handleSubmit} className="flex rounded-md shadow-sm">
        <div className="relative flex-grow">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={placeholder}
            disabled={isLoading}
            className="block w-full rounded-none rounded-l-md border-gray-300 py-2 pl-3 pr-10 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading || !inputValue.trim()}
          className="relative -ml-px inline-flex items-center space-x-2 rounded-r-md border border-gray-300 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>Send</span>
          {isLoading && (
            <svg className="animate-spin -mr-1 ml-1 h-4 w-4 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
        </button>
      </form>
    </div>
  );
};

export default InteractionManager;