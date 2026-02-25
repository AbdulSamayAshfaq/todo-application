// API service for communicating with the backend
// CRITICAL: Must use NEXT_PUBLIC_API_URL environment variable for Vercel deployment
// Default to Hugging Face Spaces backend URL if not set

// Get base URL from environment variable - works in both client and server
const getApiBaseUrl = () => {
  // For client-side rendering
  if (typeof window !== 'undefined') {
    return (window as any).ENV?.NEXT_PUBLIC_API_URL || 
           process.env.NEXT_PUBLIC_API_URL || 
           'https://abdulsamay-todo-bk.hf.space/api'
  }
  // For server-side rendering
  return process.env.NEXT_PUBLIC_API_URL || 'https://abdulsamay-todo-bk.hf.space/api'
}

const API_BASE_URL = getApiBaseUrl()

// Remove trailing /api if present to avoid duplication
const BASE_URL = API_BASE_URL.endsWith('/api') ? API_BASE_URL : `${API_BASE_URL}/api`

console.log('[API] Using base URL:', BASE_URL)

// Types
export interface Task {
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

export interface Note {
  id: number
  title: string
  content: string | null
  category: string | null
  is_pinned: boolean
  created_at: string
  updated_at: string | null
  owner_id: number
}

export interface User {
  id: number
  email: string
  username: string
  is_active: boolean
}

// API utility function with consistent error handling
const apiRequest = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  }

  const url = `${BASE_URL}${endpoint}`
  console.log('[API] Request:', options.method || 'GET', url)

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    })

    // Handle different error response types
    if (!response.ok) {
      let errorData: any = {}
      const contentType = response.headers.get('content-type')

      if (contentType && contentType.includes('application/json')) {
        errorData = await response.json().catch(() => ({}))
      } else {
        const text = await response.text().catch(() => '')
        errorData = { detail: text || `API request failed: ${response.status}` }
      }

      console.error('[API] Error response:', errorData)
      throw new Error(errorData.detail || `API request failed: ${response.status}`)
    }

    // Handle responses that might not have JSON content (like DELETE requests)
    const contentType = response.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
      return await response.json()
    } else {
      // For responses without JSON content (like DELETE), return success
      if (response.status === 204) {
        return undefined as unknown as T
      }
      return {} as T
    }
  } catch (error) {
    console.error('[API] Request error:', error)
    throw error
  }
}

// Task API functions
export const taskApi = {
  // Get all tasks
  getTasks: async (): Promise<Task[]> => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null
    if (!token) throw new Error('Please login first')
    return apiRequest<Task[]>('/tasks', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
  },

  // Get a specific task by ID
  getTaskById: async (id: number): Promise<Task> => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null
    if (!token) throw new Error('Please login first')
    return apiRequest<Task>(`/tasks/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
  },

  // Create a new task
  createTask: async (taskData: {
    title: string
    description?: string
    priority?: string
    due_date?: string | null
    category?: string | null
  }): Promise<Task> => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null
    if (!token) throw new Error('Please login first')

    console.log('[TaskAPI] Creating task:', taskData)

    const response = await fetch(`${BASE_URL}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        title: taskData.title,
        description: taskData.description || '',
        priority: taskData.priority || 'medium',
        due_date: taskData.due_date || null,
        category: taskData.category || null,
        is_recurring: false,
        status: 'pending'
      })
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      console.error('[TaskAPI] Create error:', error)
      throw new Error(error.detail || 'Failed to create task')
    }
    const result = await response.json()
    console.log('[TaskAPI] Task created:', result)
    return result
  },

  // Update a task
  updateTask: async (id: number, taskData: Partial<Task>): Promise<Task> => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null
    if (!token) throw new Error('Please login first')

    console.log('[TaskAPI] Updating task:', id, taskData)

    const response = await fetch(`${BASE_URL}/tasks/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(taskData)
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      console.error('[TaskAPI] Update error:', error)
      throw new Error(error.detail || 'Failed to update task')
    }
    const result = await response.json()
    console.log('[TaskAPI] Task updated:', result)
    return result
  },

  // Delete a task
  deleteTask: async (id: number): Promise<void> => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null
    if (!token) throw new Error('Please login first')

    console.log('[TaskAPI] Deleting task:', id)

    const response = await fetch(`${BASE_URL}/tasks/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      console.error('[TaskAPI] Delete error:', error)
      throw new Error(error.detail || 'Failed to delete task')
    }
    console.log('[TaskAPI] Task deleted:', id)
  },
}

// Auth API functions
export const authApi = {
  // Login
  login: async (username: string, password: string): Promise<{access_token: string, token_type: string}> => {
    console.log('[AuthAPI] Logging in user:', username)

    const formData = new URLSearchParams()
    formData.append('username', username)
    formData.append('password', password)

    const response = await fetch(`${BASE_URL}/auth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      console.error('[AuthAPI] Login error:', error)
      throw new Error(error.detail || 'Login failed')
    }
    const result = await response.json()
    console.log('[AuthAPI] Login successful')
    return result
  },

  // Signup
  signup: async (userData: {username: string, email: string, password: string}): Promise<User> => {
    console.log('[AuthAPI] Signing up user:', userData.username)
    return apiRequest<User>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  },

  // Get current user
  getCurrentUser: async (): Promise<User> => {
    return apiRequest<User>('/auth/me')
  },
}

// Notes API functions
export const noteApi = {
  // Get all notes
  getNotes: async (): Promise<Note[]> => {
    return apiRequest<Note[]>('/notes')
  },

  // Get a specific note by ID
  getNoteById: async (id: number): Promise<Note> => {
    return apiRequest<Note>(`/notes/${id}`)
  },

  // Create a new note
  createNote: async (noteData: Omit<Note, 'id' | 'created_at' | 'updated_at'>): Promise<Note> => {
    return apiRequest<Note>('/notes', {
      method: 'POST',
      body: JSON.stringify(noteData),
    })
  },

  // Update a note
  updateNote: async (id: number, noteData: Partial<Note>): Promise<Note> => {
    return apiRequest<Note>(`/notes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(noteData),
    })
  },

  // Delete a note
  deleteNote: async (id: number): Promise<void> => {
    return apiRequest<void>(`/notes/${id}`, {
      method: 'DELETE',
    })
  },
}

// AI Agent API functions (for local ChatKit AI agent)
// CRITICAL: Update this URL when deploying the AI agent
const getAiAgentBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return (window as any).ENV?.NEXT_PUBLIC_AI_AGENT_URL || 
           process.env.NEXT_PUBLIC_AI_AGENT_URL || 
           process.env.CHATKIT_API_URL || 
           'http://localhost:8001'
  }
  return process.env.NEXT_PUBLIC_AI_AGENT_URL || process.env.CHATKIT_API_URL || 'http://localhost:8001'
}

const AI_AGENT_BASE_URL = getAiAgentBaseUrl()

console.log('[AI Agent] Using base URL:', AI_AGENT_BASE_URL)

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
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null

    const event: ChatKitEvent = {
      type: 'user_message',
      message: {
        content: message,
      },
      auth_token: token || '',
    }

    console.log('[AI Agent] Sending message:', message)

    try {
      const response = await fetch(`${AI_AGENT_BASE_URL}/chatkit/api`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || `AI Agent request failed: ${response.status}`)
      }

      const result = await response.json()
      console.log('[AI Agent] Response:', result)
      return result
    } catch (error) {
      console.error('[AI Agent] API error:', error)
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
      console.error('[AI Agent] API error:', error)
      throw error
    }
  },

  // Health check for AI agent
  healthCheck: async (): Promise<{ status: string }> => {
    try {
      console.log('[AI Agent] Health check...')
      const response = await fetch(`${AI_AGENT_BASE_URL}/health`)
      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status}`)
      }
      const result = await response.json()
      console.log('[AI Agent] Health:', result)
      return result
    } catch (error) {
      console.error('[AI Agent] Health check error:', error)
      throw error
    }
  },
}
