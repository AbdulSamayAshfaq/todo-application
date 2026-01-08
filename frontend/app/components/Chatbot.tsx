'use client'

import { useState, useRef, useEffect } from 'react'

interface Message {
  id: number
  text: string
  sender: 'user' | 'ai'
  timestamp: Date
}

interface ChatbotProps {
  onClose: () => void
}

export const Chatbot: React.FC<ChatbotProps> = ({ onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hello! I'm your AI assistant. How can I help you with your tasks today?",
      sender: 'ai',
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<null | HTMLDivElement>(null)

  // Scroll to bottom of messages when messages change
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    // Add user message
    const userMessage: Message = {
      id: Date.now(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsTyping(true)

    try {
      // Get JWT token from wherever it's stored (localStorage, context, etc.)
      const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');

      if (!token) {
        throw new Error('No authentication token found');
      }

      // Call the AI agent API
      const response = await fetch('http://localhost:8001/chat', {
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

      const aiResponse: Message = {
        id: Date.now() + 1,
        text: data.response,
        sender: 'ai',
        timestamp: new Date()
      }

      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Error communicating with AI agent:', error);

      // Fallback response if API call fails
      const errorResponse: Message = {
        id: Date.now() + 1,
        text: "Sorry, I'm having trouble connecting to the AI service. Please try again later.",
        sender: 'ai',
        timestamp: new Date()
      }

      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsTyping(false);
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end md:items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md h-[70vh] flex flex-col">
        {/* Chat Header */}
        <div className="bg-blue-600 text-white p-4 rounded-t-xl flex justify-between items-center">
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
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
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

        {/* Chat Input */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex space-x-2">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
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
            Ask me to help with your tasks - add, update, delete, list, or set reminders
          </div>
        </div>
      </div>
    </div>
  )
}