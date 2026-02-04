'use client'

import { useState } from 'react'
import { taskApi } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'

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

interface TaskFormProps {
  onTaskCreated: (task: Task) => void
}

export const TaskForm: React.FC<TaskFormProps> = ({ onTaskCreated }) => {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium')
  const [dueDate, setDueDate] = useState('')
  const [category, setCategory] = useState('')
  const [error, setError] = useState('')
  const { user } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      setError('Title is required')
      return
    }

    if (!user) {
      setError('You must be logged in to create a task')
      return
    }

    try {
      const createdTask = await taskApi.createTask({
        title: title.trim(),
        description: description.trim(),
        status: 'pending',
        priority,
        due_date: dueDate ? new Date(dueDate).toISOString() : null,
        category: category.trim() || null,
        is_recurring: false,
        recurrence_pattern: null,
        owner_id: user.id, // Add the owner_id from the authenticated user
      })
      onTaskCreated(createdTask)
      // Reset form
      setTitle('')
      setDescription('')
      setPriority('medium')
      setDueDate('')
      setCategory('')
      setError('')
    } catch (err) {
      console.error('Error creating task:', err)
      setError('Failed to create task. Please try again.')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Title *
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            placeholder="What needs to be done?"
            required
          />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            placeholder="Add details..."
            rows={2}
          />
        </div>

        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
            Priority
          </label>
          <select
            id="priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div>
          <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
            Due Date
          </label>
          <input
            type="date"
            id="dueDate"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <input
            type="text"
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            placeholder="e.g., Work, Personal, Health"
          />
        </div>
      </div>

      {error && (
        <div className="text-red-600 text-sm py-2">{error}</div>
      )}

      <div className="pt-2">
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors shadow-md hover:shadow-lg"
        >
          Add Task
        </button>
      </div>
    </form>
  )
}