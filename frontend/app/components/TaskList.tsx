'use client'

import { useState } from 'react'
import { taskApi } from '../../lib/api'

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

interface TaskListProps {
  tasks: Task[]
  onTaskUpdated: (task: Task) => void
  onTaskDeleted: (taskId: number) => void
}

export const TaskList: React.FC<TaskListProps> = ({ tasks, onTaskUpdated, onTaskDeleted }) => {
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null)
  const [editFormData, setEditFormData] = useState<Partial<Task>>({})
  const [isUpdating, setIsUpdating] = useState(false)

  const handleStatusChange = async (taskId: number, newStatus: 'pending' | 'completed') => {
    const task = tasks.find(t => t.id === taskId)
    if (!task) return

    try {
      setIsUpdating(true)
      const updatedTask = await taskApi.updateTask(taskId, {
        status: newStatus,
        completed_at: newStatus === 'completed' ? new Date().toISOString() : null
      })

      onTaskUpdated(updatedTask)
    } catch (err) {
      console.error('Error updating task status:', err)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleEditClick = (task: Task) => {
    setEditingTaskId(task.id)
    setEditFormData({
      title: task.title,
      description: task.description,
      priority: task.priority,
      due_date: task.due_date,
      category: task.category || '',
    })
  }

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setEditFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleEditSubmit = async (taskId: number) => {
    if (!editFormData.title?.trim()) return

    try {
      setIsUpdating(true)
      const updatedTask = await taskApi.updateTask(taskId, editFormData)

      onTaskUpdated(updatedTask)
      setEditingTaskId(null)
      setEditFormData({})
    } catch (err) {
      console.error('Error updating task:', err)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDelete = async (taskId: number) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await taskApi.deleteTask(taskId)
        onTaskDeleted(taskId)
      } catch (err) {
        console.error('Error deleting task:', err)
      }
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString()
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityBorder = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-4 border-red-500'
      case 'medium': return 'border-l-4 border-yellow-500'
      case 'low': return 'border-l-4 border-green-500'
      default: return 'border-l-4 border-gray-300'
    }
  }

  return (
    <div className="space-y-3">
      {tasks.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No tasks found. Create your first task!</p>
        </div>
      ) : (
        tasks.map((task) => (
          <div
            key={task.id}
            className={`bg-white p-4 rounded-lg shadow-sm border ${getPriorityBorder(task.priority)} transition-all hover:shadow-md`}
          >
            {editingTaskId === task.id ? (
              // Edit mode
              <div className="space-y-3">
                <input
                  type="text"
                  name="title"
                  value={editFormData.title || ''}
                  onChange={handleEditChange}
                  className="w-full mb-2 p-2 border border-gray-300 rounded-lg"
                  disabled={isUpdating}
                />
                <textarea
                  name="description"
                  value={editFormData.description || ''}
                  onChange={handleEditChange}
                  className="w-full mb-2 p-2 border border-gray-300 rounded-lg"
                  rows={2}
                  disabled={isUpdating}
                />
                <div className="flex flex-wrap gap-2">
                  <select
                    name="priority"
                    value={editFormData.priority || 'medium'}
                    onChange={handleEditChange}
                    className="p-2 border border-gray-300 rounded-lg"
                    disabled={isUpdating}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                  <input
                    type="date"
                    name="due_date"
                    value={editFormData.due_date?.split('T')[0] || ''}
                    onChange={handleEditChange}
                    className="p-2 border border-gray-300 rounded-lg"
                    disabled={isUpdating}
                  />
                  <input
                    type="text"
                    name="category"
                    value={editFormData.category || ''}
                    onChange={handleEditChange}
                    placeholder="Category"
                    className="p-2 border border-gray-300 rounded-lg flex-grow"
                    disabled={isUpdating}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => handleEditSubmit(task.id)}
                    disabled={isUpdating}
                    className={`bg-green-500 text-white px-4 py-2 rounded-lg ${isUpdating ? 'opacity-50' : 'hover:bg-green-600'} transition-colors`}
                  >
                    {isUpdating ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={() => setEditingTaskId(null)}
                    className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              // Display mode
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => handleStatusChange(task.id, task.status === 'pending' ? 'completed' : 'pending')}
                      disabled={isUpdating}
                      className={`mt-1 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                        task.status === 'completed'
                          ? 'bg-green-500 border-green-500'
                          : 'border-gray-300 hover:border-green-500'
                      } ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {task.status === 'completed' && (
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                    <div className="flex-1">
                      <h3 className={`font-medium ${task.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                        {task.title}
                      </h3>
                      {task.description && (
                        <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                      )}
                      <div className="flex flex-wrap gap-2 mt-2">
                        {task.category && (
                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                            {task.category}
                          </span>
                        )}
                        {task.due_date && (
                          <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                            Due: {formatDate(task.due_date)}
                          </span>
                        )}
                        <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(task.priority)}`}>
                          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 mt-2 md:mt-0">
                  <button
                    onClick={() => handleEditClick(task)}
                    className="p-2 text-gray-500 hover:text-blue-600 rounded-full hover:bg-blue-50 transition-colors disabled:opacity-50"
                    title="Edit task"
                    disabled={isUpdating}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(task.id)}
                    className="p-2 text-gray-500 hover:text-red-600 rounded-full hover:bg-red-50 transition-colors disabled:opacity-50"
                    title="Delete task"
                    disabled={isUpdating}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  )
}