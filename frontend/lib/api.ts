// API service for communicating with the backend
// Use relative path to go through Next.js proxy
const API_BASE_URL = '/api'

// Types
interface Task {
  id: number
  title: string
  description: string
  status: 'pending' | 'completed'
  priority: 'low' | 'medium' | 'high'
  due_date: string | null
  category: string | null
  is_recurring: boolean
  recurrence_pattern: string | null
  created_at: string
  updated_at: string | null
  completed_at: string | null
  owner_id: number
}

interface Note {
  id: number
  title: string
  content: string | null
  category: string | null
  is_pinned: boolean
  created_at: string
  updated_at: string | null
  owner_id: number
}

interface User {
  id: number
  email: string
  username: string
  is_active: boolean
}

// API utility function
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('access_token')

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    })

    if (!response.ok) {
      // Handle different error response types
      let errorData;
      const contentType = response.headers.get('content-type')

      if (contentType && contentType.includes('application/json')) {
        errorData = await response.json().catch(() => ({}))
      } else {
        errorData = { detail: await response.text() || `API request failed: ${response.status}` }
      }

      throw new Error(errorData.detail || `API request failed: ${response.status}`)
    }

    // Handle responses that might not have JSON content (like DELETE requests)
    const contentType = response.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
      return await response.json()
    } else {
      // For responses without JSON content (like DELETE), return success
      if (response.status === 204) {
        return undefined // No content for DELETE requests
      }
      return {} // Return empty object for other non-JSON responses
    }
  } catch (error) {
    console.error('API request error:', error)
    throw error
  }
}

// Task API functions
export const taskApi = {
  // Get all tasks
  getTasks: async (): Promise<Task[]> => {
    const token = localStorage.getItem('access_token')
    if (!token) throw new Error('Please login first')
    return apiRequest('/tasks', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
  },

  // Get a specific task by ID
  getTaskById: async (id: number): Promise<Task> => {
    const token = localStorage.getItem('access_token')
    if (!token) throw new Error('Please login first')
    return apiRequest(`/tasks/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
  },

  // Create a new task
  createTask: async (taskData: {
    title: string
    description?: string
    priority?: string
    due_date?: string
    category?: string
  }): Promise<Task> => {
    const token = localStorage.getItem('access_token')
    if (!token) throw new Error('Please login first')
    
    const response = await fetch(`${API_BASE_URL}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        ...taskData,
        status: 'pending',
        is_recurring: false,
        recurrence_pattern: null
      })
    })
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.detail || 'Failed to create task')
    }
    return response.json()
  },

  // Update a task
  updateTask: async (id: number, taskData: Partial<Task>): Promise<Task> => {
    const token = localStorage.getItem('access_token')
    if (!token) throw new Error('Please login first')
    
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(taskData)
    })
    
    if (!response.ok) throw new Error('Failed to update task')
    return response.json()
  },

  // Delete a task
  deleteTask: async (id: number): Promise<void> => {
    const token = localStorage.getItem('access_token')
    if (!token) throw new Error('Please login first')
    
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    })
    
    if (!response.ok) throw new Error('Failed to delete task')
  },
}

// Auth API functions
export const authApi = {
  // Login
  login: (username: string, password: string): Promise<{access_token: string, token_type: string}> => {
    const formData = new URLSearchParams()
    formData.append('username', username)
    formData.append('password', password)

    return apiRequest('/auth/token', {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })
  },

  // Signup
  signup: (userData: {username: string, email: string, password: string}): Promise<User> => {
    return apiRequest('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  },

  // Get current user
  getCurrentUser: (): Promise<User> => {
    return apiRequest('/auth/me')
  },
}

// Notes API functions
export const noteApi = {
  // Get all notes
  getNotes: (): Promise<Note[]> => {
    return apiRequest('/notes')
  },

  // Get a specific note by ID
  getNoteById: (id: number): Promise<Note> => {
    return apiRequest(`/notes/${id}`)
  },

  // Create a new note
  createNote: (noteData: Omit<Note, 'id' | 'created_at' | 'updated_at'>): Promise<Note> => {
    return apiRequest('/notes', {
      method: 'POST',
      body: JSON.stringify(noteData),
    })
  },

  // Update a note
  updateNote: (id: number, noteData: Partial<Note>): Promise<Note> => {
    return apiRequest(`/notes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(noteData),
    })
  },

  // Delete a note
  deleteNote: (id: number): Promise<void> => {
    return apiRequest(`/notes/${id}`, {
      method: 'DELETE',
    })
  },
}

// AI Agent API functions (for local ChatKit AI agent)
const AI_AGENT_BASE_URL = process.env.NEXT_PUBLIC_AI_AGENT_URL || process.env.CHATKIT_API_URL || 'http://localhost:8001'

export interface ChatKitEvent {
  type: 'user_message' | 'action_invoked'
  message?: {
    content: string
  }
  action?: {
    name: string
  }
  auth_token?: string
}

export interface ChatKitResponse {
  type: string
  content: string
  done: boolean
}

export const aiAgentApi = {
  // Send a user message to the AI agent
  sendMessage: async (message: string): Promise<ChatKitResponse> => {
    const token = localStorage.getItem('access_token')
    
    const event: ChatKitEvent = {
      type: 'user_message',
      message: {
        content: message,
      },
      auth_token: token || '',
    }

    try {
      const response = await fetch(`${AI_AGENT_BASE_URL}/chatkit/api`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      })

      if (!response.ok) {
        throw new Error(`AI Agent request failed: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('AI Agent API error:', error)
      throw error
    }
  },

  // Invoke an action on the AI agent
  invokeAction: async (actionName: string): Promise<ChatKitResponse> => {
    const event: ChatKitEvent = {
      type: 'action_invoked',
      action: {
        name: actionName,
      },
    }

    try {
      const response = await fetch(`${AI_AGENT_BASE_URL}/chatkit/api`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      })

      if (!response.ok) {
        throw new Error(`AI Agent request failed: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('AI Agent API error:', error)
      throw error
    }
  },

  // Health check for AI agent
  healthCheck: async (): Promise<{ status: string }> => {
    try {
      const response = await fetch(`${AI_AGENT_BASE_URL}/health`)
      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      console.error('AI Agent health check error:', error)
      throw error
    }
  },
}
