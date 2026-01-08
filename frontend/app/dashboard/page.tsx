
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { TaskList } from '../components/TaskList'
import { TaskForm } from '../components/TaskForm'
import { Chatbot } from '../components/Chatbot'
import { authApi, taskApi } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'

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

export default function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [showChatbot, setShowChatbot] = useState(false)
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'completed' | 'due_today'>('all')
  const [error, setError] = useState('')
  const { isAuthenticated, loading: authLoading } = useAuth()
  const router = useRouter()

  // Check authentication on component mount
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
      return
    }
    if (isAuthenticated) {
      fetchTasks()
    }
  }, [isAuthenticated, authLoading, router])

  const fetchTasks = async () => {
    try {
      setError('')
      const fetchedTasks = await taskApi.getTasks()
      setTasks(fetchedTasks)
      applyFilter(fetchedTasks, activeFilter)
    } catch (err) {
      console.error('Error fetching tasks:', err)
      setError('Failed to load tasks. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const applyFilter = (taskList: Task[], filter: string) => {
    let filtered = taskList

    switch (filter) {
      case 'pending':
        filtered = taskList.filter(task => task.status === 'pending')
        break
      case 'completed':
        filtered = taskList.filter(task => task.status === 'completed')
        break
      case 'due_today':
        const today = new Date().toISOString().split('T')[0]
        filtered = taskList.filter(task =>
          task.due_date && task.due_date.startsWith(today) && task.status === 'pending'
        )
        break
      default:
        filtered = taskList
    }

    setFilteredTasks(filtered)
  }

  const handleFilterChange = (filter: 'all' | 'pending' | 'completed' | 'due_today') => {
    setActiveFilter(filter)
    applyFilter(tasks, filter)
  }

  const handleTaskCreated = (newTask: Task) => {
    const updatedTasks = [...tasks, newTask]
    setTasks(updatedTasks)
    applyFilter(updatedTasks, activeFilter)
  }

  const handleTaskUpdated = (updatedTask: Task) => {
    const updatedTasks = tasks.map(task => task.id === updatedTask.id ? updatedTask : task)
    setTasks(updatedTasks)
    applyFilter(updatedTasks, activeFilter)
  }

  const handleTaskDeleted = (taskId: number) => {
    const updatedTasks = tasks.filter(task => task.id !== taskId)
    setTasks(updatedTasks)
    applyFilter(updatedTasks, activeFilter)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
          {error}
          <button
            onClick={fetchTasks}
            className="ml-4 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
          >
            Retry
          </button>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleFilterChange('all')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeFilter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => handleFilterChange('pending')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeFilter === 'pending'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => handleFilterChange('completed')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeFilter === 'completed'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Completed
            </button>
            <button
              onClick={() => handleFilterChange('due_today')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeFilter === 'due_today'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Due Today
            </button>
          </div>
        </div>

        <TaskForm onTaskCreated={handleTaskCreated} />
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-800">
            Your Tasks {activeFilter !== 'all' && `(${activeFilter.replace('_', ' ')})`}
          </h3>
          <div className="text-sm text-gray-500">
            {tasks.filter(t => t.status === 'pending').length} pending, {tasks.filter(t => t.status === 'completed').length} completed
          </div>
        </div>

        <TaskList
          tasks={filteredTasks}
          onTaskUpdated={handleTaskUpdated}
          onTaskDeleted={handleTaskDeleted}
        />
      </div>

      {/* Floating Chatbot Button */}
      <button
        onClick={() => setShowChatbot(true)}
        className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-50"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      </button>

      {/* Chatbot Component */}
      {showChatbot && (
        <Chatbot onClose={() => setShowChatbot(false)} />
      )}
    </div>
  )
}