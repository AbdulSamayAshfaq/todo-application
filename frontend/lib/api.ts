// API service for communicating with the backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api'

// Types
interface Task {
  id: number
  title: string
  description: string
  status: 'pending' | 'completed'
  priority: 'low' | 'medium' | 'high'
  due_date: string | null
  category: string | null
  created_at: string
  updated_at: string | null
  completed_at: string | null
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
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || `API request failed: ${response.status}`)
    }

    return await response.json()
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