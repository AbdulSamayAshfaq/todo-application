'use client'

import { useState, useEffect } from 'react'
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

interface NotesListProps {
  onNoteUpdated: (note: Note) => void
  onNoteDeleted: (noteId: number) => void
}

export const NotesList: React.FC<NotesListProps> = ({ onNoteUpdated, onNoteDeleted }) => {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchNotes()
  }, [])

  const fetchNotes = async () => {
    try {
      setError('')
      setLoading(true)
      const fetchedNotes = await noteApi.getNotes()
      setNotes(fetchedNotes)
    } catch (err) {
      console.error('Error fetching notes:', err)
      setError('Failed to load notes. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
        {error}
        <button
          onClick={fetchNotes}
          className="ml-4 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {notes.length === 0 ? (
        <p className="text-gray-500 text-center py-4">No notes yet. Create your first note!</p>
      ) : (
        notes.map(note => (
          <div
            key={note.id}
            className={`p-4 rounded-lg border ${
              note.is_pinned
                ? 'border-yellow-300 bg-yellow-50'
                : 'border-gray-200 bg-white'
            } shadow-sm hover:shadow-md transition-shadow`}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-gray-800 truncate">{note.title}</h4>
                  {note.is_pinned && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Pinned
                    </span>
                  )}
                </div>
                {note.content && (
                  <p className="text-gray-600 text-sm whitespace-pre-wrap line-clamp-3">
                    {note.content}
                  </p>
                )}
                {note.category && (
                  <span className="inline-block mt-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                    {note.category}
                  </span>
                )}
              </div>
            </div>
            <div className="mt-3 flex justify-between items-center text-xs text-gray-500">
              <span>Created: {new Date(note.created_at).toLocaleDateString()}</span>
              {note.updated_at && (
                <span>Updated: {new Date(note.updated_at).toLocaleDateString()}</span>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  )
}