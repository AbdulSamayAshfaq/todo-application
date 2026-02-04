'use client';

import { useState, useRef, useEffect } from 'react';
import { taskApi } from '@/lib/api';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface TaskPreview {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  due_date: string | null;
  category: string | null;
}

interface AiAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AiAssistantDrawer = ({ isOpen, onClose }: AiAssistantDrawerProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hello! I'm your AI assistant. How can I help you with your tasks today?",
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [taskPreview, setTaskPreview] = useState<TaskPreview | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  // Scroll to bottom of messages when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);
    setTaskPreview(null);
    setShowPreview(false);

    try {
      // Get JWT token from wherever it's stored (localStorage, context, etc.)
      const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');

      if (!token) {
        throw new Error('No authentication token found');
      }

      // Call the AI agent API
      const aiAgentUrl = process.env.NEXT_PUBLIC_AI_AGENT_URL || 'http://localhost:8001';
      const response = await fetch(`${aiAgentUrl}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: inputValue,
          user_id: 'admin' // Using admin as default user ID
        })
      });

      if (!response.ok) {
        throw new Error(`AI agent error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      // Check if AI returned task preview data
      if (data.action === 'preview_task' && data.task_data) {
        setTaskPreview({
          title: data.task_data.title || '',
          description: data.task_data.description || '',
          priority: data.task_data.priority || 'medium',
          due_date: data.task_data.due_date || null,
          category: data.task_data.category || null
        });
        setShowPreview(true);

        const aiResponse: Message = {
          id: Date.now() + 1,
          text: `I can help you create this task. Preview: "${data.task_data.title}"`,
          sender: 'ai',
          timestamp: new Date()
        };

        setMessages(prev => [...prev, aiResponse]);
      } else {
        const aiResponse: Message = {
          id: Date.now() + 1,
          text: data.response,
          sender: 'ai',
          timestamp: new Date()
        };

        setMessages(prev => [...prev, aiResponse]);
      }
    } catch (error) {
      console.error('Error communicating with AI agent:', error);

      // Fallback response if API call fails
      const errorResponse: Message = {
        id: Date.now() + 1,
        text: "Sorry, I'm having trouble connecting to the AI service. Please try again later.",
        sender: 'ai',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleConfirmTask = async () => {
    if (!taskPreview) return;

    try {
      setIsTyping(true);
      const createdTask = await taskApi.createTask({
        title: taskPreview.title,
        description: taskPreview.description,
        status: 'pending',
        priority: taskPreview.priority,
        due_date: taskPreview.due_date,
        category: taskPreview.category,
        is_recurring: false,
        recurrence_pattern: null,
        owner_id: 1, // Default owner_id, should come from auth context
      });

      const aiResponse: Message = {
        id: Date.now() + 1,
        text: `Task "${taskPreview.title}" has been created successfully!`,
        sender: 'ai',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiResponse]);
      setTaskPreview(null);
      setShowPreview(false);
    } catch (error) {
      console.error('Error creating task:', error);

      const errorResponse: Message = {
        id: Date.now() + 1,
        text: "Failed to create the task. Please try again.",
        sender: 'ai',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleCancelTask = () => {
    setTaskPreview(null);
    setShowPreview(false);

    const aiResponse: Message = {
      id: Date.now() + 1,
      text: "Task creation cancelled.",
      sender: 'ai',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, aiResponse]);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      <div className="fixed inset-y-0 right-0 max-w-full flex">
        <div className="relative w-screen max-w-md">
          <div className="h-full flex flex-col bg-white shadow-xl">
            {/* Drawer header */}
            <div className="flex-1 overflow-y-auto">
              {/* Chat Header */}
              <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <div className="bg-blue-500 rounded-full p-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="font-semibold">AI Assistant</h3>
                </div>
                <button
                  onClick={onClose}
                  className="text-white hover:text-gray-200 focus:outline-none"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 bg-gray-50 h-[calc(100vh-200px)]">
                <div className="space-y-3">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                          message.sender === 'user'
                            ? 'bg-blue-500 text-white rounded-br-none'
                            : 'bg-gray-200 text-gray-800 rounded-bl-none'
                        }`}
                      >
                        <div className="text-sm">{message.text}</div>
                        <div className={`text-xs mt-1 ${message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  ))}

                  {showPreview && taskPreview && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-gray-900">Task Preview</h4>
                          <div className="mt-2">
                            <p className="text-sm font-medium text-gray-800">{taskPreview.title}</p>
                            {taskPreview.description && (
                              <p className="text-sm text-gray-600 mt-1">{taskPreview.description}</p>
                            )}
                            <div className="mt-2 flex flex-wrap gap-2">
                              {taskPreview.priority && (
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                  taskPreview.priority === 'high' ? 'bg-red-100 text-red-800' :
                                  taskPreview.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-green-100 text-green-800'
                                }`}>
                                  {taskPreview.priority}
                                </span>
                              )}
                              {taskPreview.category && (
                                <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                                  {taskPreview.category}
                                </span>
                              )}
                              {taskPreview.due_date && (
                                <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-800">
                                  Due: {new Date(taskPreview.due_date).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={handleConfirmTask}
                            className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={handleCancelTask}
                            className="text-xs bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-gray-200 text-gray-800 rounded-2xl rounded-bl-none px-4 py-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>
            </div>

            {/* Chat Input */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="flex space-x-2">
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me to create, update, or manage tasks..."
                  className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  rows={2}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim()}
                  className={`bg-blue-600 text-white rounded-lg px-4 py-2 self-end ${
                    !inputValue.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                  </svg>
                </button>
              </div>
              <div className="text-xs text-gray-500 mt-2">
                Examples: "Create a high priority task for tomorrow", "Show me tasks due today", "Mark the grocery task as completed"
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};