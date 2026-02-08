import React from 'react';

interface EnhancedMessageFormatterProps {
  content: string;
  messageType?: 'text' | 'command' | 'confirmation' | 'error' | 'info';
  timestamp?: Date;
  priority?: 'low' | 'medium' | 'high';
  dateInfo?: string;
  category?: string;
}

const EnhancedMessageFormatter: React.FC<EnhancedMessageFormatterProps> = ({
  content,
  messageType = 'text',
  timestamp,
  priority,
  dateInfo,
  category,
}) => {
  // Function to format dates in a user-friendly way
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';

    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays === 1) {
      return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays < 7) {
      return `${date.toLocaleDateString([], { weekday: 'long' })} at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };

  // Function to get appropriate styling based on message type
  const getMessageStyle = () => {
    switch (messageType) {
      case 'error':
        return 'text-red-700 bg-red-50 border-l-4 border-red-500';
      case 'confirmation':
        return 'text-green-700 bg-green-50 border-l-4 border-green-500';
      case 'info':
        return 'text-blue-700 bg-blue-50 border-l-4 border-blue-500';
      case 'command':
        return 'text-purple-700 bg-purple-50 border-l-4 border-purple-500';
      default:
        return 'text-gray-700 bg-gray-50 border-l-4 border-gray-300';
    }
  };

  // Function to get priority badge styling
  const getPriorityBadgeStyle = () => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium';
      case 'low':
        return 'bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium';
      default:
        return 'bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium';
    }
  };

  // Function to extract and format task-related information from content
  const extractAndFormatTaskInfo = (textContent: string) => {
    // Parse the text to identify task-related information and format it appropriately
    let formattedText = textContent;

    // Identify and format dates (look for YYYY-MM-DD, MM/DD/YYYY, etc.)
    const dateRegex = /\b(\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{4})\b/g;
    formattedText = formattedText.replace(dateRegex, (match) => {
      try {
        const date = new Date(match);
        if (!isNaN(date.getTime())) {
          return `<span class="font-medium text-blue-600">${formatDate(match)}</span>`;
        }
        return match;
      } catch {
        return match;
      }
    });

    // Identify and format priorities (low, medium, high)
    const priorityRegex = /\b(low|medium|high)\s+priority\b/gi;
    formattedText = formattedText.replace(priorityRegex, (match) => {
      const lowerMatch = match.toLowerCase();
      let colorClass = 'text-gray-600';
      if (lowerMatch.includes('high')) colorClass = 'text-red-600';
      if (lowerMatch.includes('medium')) colorClass = 'text-yellow-600';
      if (lowerMatch.includes('low')) colorClass = 'text-green-600';

      return `<span class="font-medium ${colorClass}">${match}</span>`;
    });

    // Identify and format categories (words starting with #)
    const categoryRegex = /#(\w+)/g;
    formattedText = formattedText.replace(categoryRegex, '<span class="inline-block bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-xs font-medium ml-1">$&</span>');

    return formattedText;
  };

  return (
    <div className={`p-3 rounded-lg ${getMessageStyle()} mb-2`}>
      <div className="flex flex-col space-y-2">
        {/* Main content with HTML formatting */}
        <div className="text-sm">
          <div dangerouslySetInnerHTML={{ __html: extractAndFormatTaskInfo(content) }} />
        </div>

        {/* Additional metadata */}
        {(priority || dateInfo || category) && (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {priority && (
              <span className={getPriorityBadgeStyle()}>
                {priority.charAt(0).toUpperCase() + priority.slice(1)} priority
              </span>
            )}

            {dateInfo && (
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                {formatDate(dateInfo)}
              </span>
            )}

            {category && (
              <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full">
                #{category}
              </span>
            )}
          </div>
        )}

        {/* Timestamp */}
        {timestamp && (
          <div className="text-xs text-gray-500 pt-1">
            {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedMessageFormatter;