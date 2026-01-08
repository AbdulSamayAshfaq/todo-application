'use client'

import { useState } from 'react'

interface Task {
  id: number
  title: string
  description: string
  status: string
  priority: string
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

  const handleStatusChange = async (taskId: number, newStatus: string) => {
    try {
      const token = localStorage.getItem('access_token')
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        const updatedTask = await response.json()
        onTaskUpdated(updatedTask)
      }
    } catch (err) {
      console.error('Error updating task status:', err)
    }
  }

  const handleEditClick = (task: Task) => {
    setEditingTaskId(task.id)
    setEditFormData({
      title: task.title,
      description: task.description,
      priority: task.priority,
      category: task.category || '',
    })
  }

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setEditFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleEditSubmit = async (taskId: number) => {
    try {
      const token = localStorage.getItem('access_token')
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editFormData),
      })

      if (response.ok) {
        const updatedTask = await response.json()
        onTaskUpdated(updatedTask)
        setEditingTaskId(null)
        setEditFormData({})
      }
    } catch (err) {
      console.error('Error updating task:', err)
    }
  }

  const handleDelete = async (taskId: number) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        const token = localStorage.getItem('access_token')
        const response = await fetch(`/api/tasks/${taskId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })

        if (response.ok) {
          onTaskDeleted(taskId)
        }
      } catch (err) {
        console.error('Error deleting task:', err)
      }
    }
  }

  const formatDate = (dateString: string) => {
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

  return (
    <div className="space-y-4">
      {tasks.length === 0 ? (
        <p className="text-center text-gray-500">No tasks found. Create your first task!</p>
      ) : (
        tasks.map((task) => (
          <div key={task.id} className="bg-white p-4 rounded-lg shadow-md border">
            {editingTaskId === task.id ? (
              // Edit mode
              <div>
                <input
                  type="text"
                  name="title"
                  value={editFormData.title}
                  onChange={handleEditChange}
                  className="w-full mb-2 p-2 border border-gray-300 rounded"
                />
                <textarea
                  name="description"
                  value={editFormData.description || ''}
                  onChange={handleEditChange}
                  className="w-full mb-2 p-2 border border-gray-300 rounded"
                  rows={3}
                />
                <select
                  name="priority"
                  value={editFormData.priority}
                  onChange={handleEditChange}
                  className="mr-2 p-1 border border-gray-300 rounded"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
                <input
                  type="text"
                  name="category"
                  value={editFormData.category || ''}
                  onChange={handleEditChange}
                  placeholder="Category"
                  className="mr-2 p-1 border border-gray-300 rounded"
                />
                <button
                  onClick={() => handleEditSubmit(task.id)}
                  className="bg-green-500 text-white px-3 py-1 rounded mr-2"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingTaskId(null)}
                  className="bg-gray-500 text-white px-3 py-1 rounded"
                >
                  Cancel
                </button>
              </div>
            ) : (
              // Display mode
              <div>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <h3 className={`text-lg font-semibold ${task.status === 'completed' ? 'line-through text-gray-500' : ''}`}>
                        {task.title}
                      </h3>
                      <span className={`ml-2 text-xs px-2 py-1 rounded-full ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    </div>
                    {task.description && (
                      <p className="text-gray-600 mt-1">{task.description}</p>
                    )}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {task.category && (
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                          {task.category}
                        </span>
                      )}
                      {task.due_date && (
                        <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                          Due: {formatDate(task.due_date)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleStatusChange(task.id, task.status === 'pending' ? 'completed' : 'pending')}
                      className={`px-3 py-1 rounded text-sm ${
                        task.status === 'completed'
                          ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          : 'bg-green-500 text-white hover:bg-green-600'
                      }`}
                    >
                      {task.status === 'completed' ? 'Mark Pending' : 'Mark Done'}
                    </button>
                    <button
                      onClick={() => handleEditClick(task)}
                      className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(task.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div className="mt-2 text-xs text-gray-500">
                  Created: {formatDate(task.created_at)}
                  {task.completed_at && ` | Completed: ${formatDate(task.completed_at)}`}
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  )
}