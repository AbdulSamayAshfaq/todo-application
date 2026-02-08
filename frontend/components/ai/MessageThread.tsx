import React, { useState, useEffect, useRef } from 'react';
import EnhancedMessageFormatter from './EnhancedMessageFormatter';
import ErrorHandler from './ErrorHandler';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  messageType?: 'text' | 'command' | 'confirmation' | 'error' | 'info';
  priority?: 'low' | 'medium' | 'high';
  dateInfo?: string;
  category?: string;
  contextSnapshot?: any;
}

interface MessageThreadProps {
  initialMessages?: Message[];
  onNewMessage?: (message: Message) => void;
  maxContextSize?: number;
  showTimestamps?: boolean;
}

const MessageThread: React.FC<MessageThreadProps> = ({
  initialMessages = [],
  onNewMessage,
  maxContextSize = 50,
  showTimestamps = true
}) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [error, setError] = useState<Error | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const addMessage = (message: Message) => {
    try {
      // Limit context size to prevent memory issues
      setMessages(prev => {
        const newMessages = [...prev, message];

        // Keep only the last maxContextSize messages
        if (newMessages.length > maxContextSize) {
          return newMessages.slice(-maxContextSize);
        }

        return newMessages;
      });

      // Notify parent component of new message
      if (onNewMessage) {
        onNewMessage(message);
      }

      // Clear any previous errors
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to add message'));
    }
  };

  const addSystemMessage = (content: string, messageType: 'info' | 'confirmation' | 'error' = 'info') => {
    addMessage({
      id: `sys-${Date.now()}`,
      content,
      sender: 'ai',
      timestamp: new Date(),
      messageType
    });
  };

  const updateUserMessage = (messageId: string, newContent: string) => {
    setMessages(prev =>
      prev.map(msg =>
        msg.id === messageId && msg.sender === 'user'
          ? { ...msg, content: newContent, timestamp: new Date() }
          : msg
      )
    );
  };

  const clearThread = () => {
    setMessages([]);
    setError(null);
  };

  const getContextSummary = () => {
    // Create a summary of the current conversation context
    const userMessages = messages.filter(m => m.sender === 'user').length;
    const aiMessages = messages.filter(m => m.sender === 'ai').length;
    const lastUserMessage = messages.filter(m => m.sender === 'user').pop();

    return {
      totalMessages: messages.length,
      userMessages,
      aiMessages,
      lastInteraction: lastUserMessage?.timestamp || null,
      contextSize: messages.length
    };
  };

  // Group consecutive messages from the same sender
  const groupedMessages = messages.reduce((acc: Message[][], message, index) => {
    if (index === 0 || message.sender !== messages[index - 1].sender) {
      acc.push([message]);
    } else {
      acc[acc.length - 1].push(message);
    }
    return acc;
  }, []);

  return (
    <div className="flex flex-col h-full">
      {/* Context Info Bar */}
      <div className="mb-3 p-2 bg-gray-50 rounded-lg text-xs text-gray-600">
        <div className="flex justify-between">
          <span>Context: {getContextSummary().contextSize}/{maxContextSize} messages</span>
          <span>{getContextSummary().userMessages} user • {getContextSummary().aiMessages} AI</span>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-4">
        {groupedMessages.map((group, groupIndex) => {
          const sender = group[0].sender;
          const isFirstGroup = groupIndex === 0;
          const isLastGroup = groupIndex === groupedMessages.length - 1;

          return (
            <div
              key={`${group[0].id}-${groupIndex}`}
              className={`flex ${sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] ${
                  sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-800'
                } rounded-lg px-4 py-2`}
              >
                {group.map((message, messageIndex) => (
                  <div key={message.id} className="mb-2 last:mb-0">
                    <EnhancedMessageFormatter
                      content={message.content}
                      messageType={message.messageType}
                      timestamp={showTimestamps ? message.timestamp : undefined}
                      priority={message.priority}
                      dateInfo={message.dateInfo}
                      category={message.category}
                    />
                  </div>
                ))}

                {/* Show sender indicator for first message in group */}
                {groupIndex === 0 && (
                  <div className={`text-xs mt-1 ${sender === 'user' ? 'text-blue-100' : 'text-gray-500'} self-start`}>
                    {sender === 'user' ? 'You' : 'AI Assistant'}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        <div ref={messagesEndRef} />
      </div>

      {/* Error Handler */}
      <ErrorHandler
        error={error}
        onRetry={() => setError(null)}
      />
    </div>
  );
};

export default MessageThread;