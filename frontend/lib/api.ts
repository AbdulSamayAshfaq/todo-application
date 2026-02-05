// API service for communicating with the backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'

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
  getTasks: (): Promise<Task[]> => {
    return apiRequest('/tasks')
  },

  // Get a specific task by ID
  getTaskById: (id: number): Promise<Task> => {
    return apiRequest(`/tasks/${id}`)
  },

  // Create a new task
  createTask: (taskData: Omit<Task, 'id' | 'created_at' | 'updated_at' | 'completed_at'>): Promise<Task> => {
    return apiRequest('/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    })
  },

  // Update a task
  updateTask: (id: number, taskData: Partial<Task>): Promise<Task> => {
    return apiRequest(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(taskData),
    })
  },

  // Delete a task
  deleteTask: (id: number): Promise<void> => {
    return apiRequest(`/tasks/${id}`, {
      method: 'DELETE',
    })
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