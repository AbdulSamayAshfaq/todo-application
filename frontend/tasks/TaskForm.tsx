'use client'

import { useState } from 'react'

interface TaskFormProps {
  onTaskCreated: (task: any) => void;
}

export const TaskForm: React.FC<TaskFormProps> = ({ onTaskCreated }) => {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('medium')
  const [dueDate, setDueDate] = useState('')
  const [category, setCategory] = useState('')
  const [isRecurring, setIsRecurring] = useState(false)
  const [recurrencePattern, setRecurrencePattern] = useState('daily')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      setError('Title is required')
      return
    }

    const taskData = {
      title: title.trim(),
      description: description.trim(),
      priority,
      due_date: dueDate ? new Date(dueDate).toISOString() : null,
      category: category.trim(),
      is_recurring: isRecurring,
      recurrence_pattern: isRecurring ? recurrencePattern : null,
    }

    try {
      const token = localStorage.getItem('access_token')
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      })

      if (response.ok) {
        const newTask = await response.json()
        onTaskCreated(newTask)
        // Reset form
        setTitle('')
        setDescription('')
        setPriority('medium')
        setDueDate('')
        setCategory('')
        setIsRecurring(false)
        setError('')
      } else {
        const errorData = await response.json()
        setError(errorData.detail || 'Failed to create task')
      }
    } catch (err) {
      setError('An error occurred while creating the task')
      console.error(err)
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Add New Task</h3>
      {error && <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="title" className="block text-gray-700 mb-2">Title *</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="description" className="block text-gray-700 mb-2">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="priority" className="block text-gray-700 mb-2">Priority</label>
            <select
              id="priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div>
            <label htmlFor="dueDate" className="block text-gray-700 mb-2">Due Date</label>
            <input
              type="date"
              id="dueDate"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="mb-4">
          <label htmlFor="category" className="block text-gray-700 mb-2">Category</label>
          <input
            type="text"
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isRecurring"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="isRecurring" className="text-gray-700">Recurring Task</label>
          </div>
        </div>

        {isRecurring && (
          <div className="mb-4">
            <label htmlFor="recurrencePattern" className="block text-gray-700 mb-2">Recurrence Pattern</label>
            <select
              id="recurrencePattern"
              value={recurrencePattern}
              onChange={(e) => setRecurrencePattern(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Add Task
        </button>
      </form>
    </div>
  )
}