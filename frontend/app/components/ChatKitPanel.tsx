'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { aiAgentApi, ChatKitResponse, taskApi } from '@/lib/api';
import EnhancedMessageFormatter from '@/components/ai/EnhancedMessageFormatter';
import ErrorHandler from '@/components/ai/ErrorHandler';
import InteractionManager from '@/components/ai/InteractionManager';
import LoadingState from '@/components/ai/LoadingState';

interface ChatKitPanelProps {
  onClose: () => void;
}

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  type: 'text' | 'command' | 'confirmation' | 'error' | 'info';
}

interface TaskFormData {
  title: string;
  description: string;
  priority: string;
  due_date: string;
  category: string;
}

export function ChatKitPanel({ onClose }: ChatKitPanelProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [loadingState, setLoadingState] = useState<'idle' | 'ai-processing' | 'mcp-execution' | 'network-operation'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isAgentAvailable, setIsAgentAvailable] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    priority: 'medium',
    due_date: '',
    category: '',
  });

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Check AI agent health on mount
  useEffect(() => {
    const checkHealth = async () => {
      try {
        await aiAgentApi.healthCheck();
        setIsAgentAvailable(true);
        // Add welcome message
        setMessages([
          {
            id: 'welcome',
            content: "Hello! I'm your AI assistant. How can I help you manage your tasks today?",
            sender: 'ai',
            timestamp: new Date(),
            type: 'info',
          },
        ]);
      } catch (err) {
        setIsAgentAvailable(false);
        setMessages([
          {
            id: 'welcome',
            content: "Hello! I'm your AI assistant. Note: The AI agent is currently unavailable. You can still create tasks manually using the form below.",
            sender: 'ai',
            timestamp: new Date(),
            type: 'info',
          },
        ]);
      }
    };
    checkHealth();
  }, []);

  // Handle close button click
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Quick reply options
  const quickReplies = [
    {
      id: 'create-task',
      label: 'Create task',
      prompt: 'CREATE_TASK'
    },
    {
      id: 'check-tasks',
      label: 'Check tasks',
      prompt: 'What tasks do I have pending?'
    },
    {
      id: 'mark-complete',
      label: 'Mark task complete',
      prompt: 'I want to mark a task as complete'
    }
  ];

  // Suggested actions
  const suggestedActions = [
    {
      id: 'list-all',
      label: 'List all tasks',
      action: () => handleSendMessage('Show me all my tasks')
    },
    {
      id: 'create-high-priority',
      label: 'Create high priority task',
      action: () => setShowTaskForm(true)
    }
  ];

  // Handle form submission - Direct API call to backend
  const handleFormSubmit = async () => {
    if (!formData.title.trim()) return;

    setLoadingState('network-operation');

    const userMessage: Message = {
      id: Date.now().toString(),
      content: `Creating task: ${formData.title}\nDescription: ${formData.description || 'None'}\nPriority: ${formData.priority}\nDue: ${formData.due_date || 'None'}\nCategory: ${formData.category || 'None'}`,
      sender: 'user',
      timestamp: new Date(),
      type: 'text',
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      // Create task directly via backend API
      const taskData = {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        priority: formData.priority,
        due_date: formData.due_date ? new Date(formData.due_date).toISOString() : null,
        category: formData.category.trim() || null,
      };

      console.log('[ChatKitPanel] Creating task:', taskData);
      const createdTask = await taskApi.createTask(taskData);

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `✅ Task created successfully!\n📝 Title: ${createdTask.title}\n🏷️ Priority: ${createdTask.priority}\n📌 Status: ${createdTask.status}\n🆔 Task ID: ${createdTask.id}`,
        sender: 'ai',
        timestamp: new Date(),
        type: 'confirmation',
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: err instanceof Error ? err.message : 'Failed to create task',
        sender: 'ai',
        timestamp: new Date(),
        type: 'error',
      };
      setMessages(prev => [...prev, errorMessage]);
      setError(err instanceof Error ? err.message : 'Failed to create task');
    } finally {
      setLoadingState('idle');
      setShowTaskForm(false);
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        due_date: '',
        category: '',
      });
    }
  };

  // Handle sending a message
  const handleSendMessage = useCallback(async (message: string) => {
    if (!message.trim()) return;

    // Check for special commands
    if (message === 'CREATE_TASK') {
      setShowTaskForm(true);
      return;
    }

    setLoadingState(message.toLowerCase().includes('task') ? 'mcp-execution' : 'ai-processing');

    const userMessage: Message = {
      id: Date.now().toString(),
      content: message,
      sender: 'user',
      timestamp: new Date(),
      type: 'text',
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      if (!isAgentAvailable) {
        // If AI agent is not available, provide a helpful response
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: "I'm currently unavailable, but you can use the task form below to manage your tasks. Click 'Create task' to add a new task!",
          sender: 'ai',
          timestamp: new Date(),
          type: 'info',
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        const response: ChatKitResponse = await aiAgentApi.sendMessage(message);

        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: response.content,
          sender: 'ai',
          timestamp: new Date(),
          type: response.type === 'error' ? 'error' : 'text',
        };
        setMessages(prev => [...prev, aiMessage]);
      }
    } catch (err) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: err instanceof Error ? err.message : 'An error occurred',
        sender: 'ai',
        timestamp: new Date(),
        type: 'error',
      };
      setMessages(prev => [...prev, errorMessage]);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoadingState('idle');
    }
  }, [isAgentAvailable]);

  // Handle retry
  const handleRetry = () => {
    setError(null);
    setLoadingState('idle');
  };

  return (
    <div className="relative h-full w-full rounded-2xl flex flex-col overflow-hidden bg-white shadow-sm transition-colors dark:bg-slate-900">
      {/* Close Button */}
      <div className="absolute top-3 right-3 z-10">
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 focus:outline-none"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Enhanced Message Thread */}
      <div className="flex-1 overflow-hidden p-4">
        <div className="h-full flex flex-col">
          {/* Loading State */}
          <LoadingState
            type={loadingState}
            className="mb-4"
          />

          {/* Error Handler */}
          <ErrorHandler
            error={error}
            onRetry={handleRetry}
            showActions={true}
          />

          {/* Task Form Modal */}
          {showTaskForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
                <h3 className="text-lg font-semibold mb-4">Create New Task</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter task title"
                      autoFocus
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter description (optional)"
                      rows={2}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Priority
                      </label>
                      <select
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="low">Low 🟢</option>
                        <option value="medium">Medium 🟡</option>
                        <option value="high">High 🔴</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Due Date
                      </label>
                      <input
                        type="date"
                        value={formData.due_date}
                        onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter category (optional)"
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setShowTaskForm(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleFormSubmit}
                    disabled={!formData.title.trim() || loadingState !== 'idle'}
                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                  >
                    Create Task
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    msg.sender === 'user'
                      ? 'bg-blue-500 text-white'
                      : msg.type === 'error'
                      ? 'bg-red-100 text-red-800'
                      : msg.type === 'confirmation'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <EnhancedMessageFormatter
                    content={msg.content}
                    messageType={msg.type}
                  />
                  <div className={`text-xs mt-1 ${msg.sender === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                    {msg.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Enhanced Interaction Manager */}
      <div className="p-4 border-t border-gray-200">
        <InteractionManager
          onSendMessage={handleSendMessage}
          quickReplies={quickReplies}
          suggestedActions={suggestedActions}
          isLoading={loadingState !== 'idle'}
          placeholder="Ask me to help with your tasks..."
        />
      </div>
    </div>
  );
}
