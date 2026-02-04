'use client'

import { useState } from 'react'
import { noteApi } from '../../lib/api'

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

interface NotesFormProps {
  onNoteCreated: (note: Note) => void
}

export const NotesForm: React.FC<NotesFormProps> = ({ onNoteCreated }) => {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('')
  const [isPinned, setIsPinned] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      setError('Title is required')
      return
    }

    try {
      const createdNote = await noteApi.createNote({
        title: title.trim(),
        content: content.trim() || null,
        category: category.trim() || null,
        is_pinned: isPinned,
        owner_id: 1, // This should be dynamically set based on the logged-in user
      })
      onNoteCreated(createdNote)
      // Reset form
      setTitle('')
      setContent('')
      setCategory('')
      setIsPinned(false)
      setError('')
    } catch (err) {
      console.error('Error creating note:', err)
      setError('Failed to create note. Please try again.')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Title *
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            placeholder="Note title..."
            required
          />
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
            Content
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            placeholder="Write your note content here..."
            rows={4}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <input
              type="text"
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              placeholder="e.g., Work, Personal, Ideas"
            />
          </div>

          <div className="flex items-center pt-6">
            <input
              type="checkbox"
              id="isPinned"
              checked={isPinned}
              onChange={(e) => setIsPinned(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isPinned" className="ml-2 block text-sm text-gray-700">
              Pin this note
            </label>
          </div>
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
          Add Note
        </button>
      </div>
    </form>
  )
}