'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function Home() {
  const [notes, setNotes] = useState<any[]>([])
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [editingNoteId, setEditingNoteID] = useState<number | null>(null)

  // Load notes when page loads
  useEffect(() => {
    fetchNotes()
  }, [])

  async function fetchNotes() {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) console.error('Error fetching notes:', error)
    else setNotes(data)
  }

  async function handleSubmit() {
    if (!title || !content) return

    if (editingNoteId) {
      // UPDATE existing note
      const { error } = await supabase
        .from('notes')
        .update({ title, content })
        .eq('id', editingNoteId)
      
      if (error) {
        console.error('Error updating:', error)
        return
      }
      
      setTitle('')
      setContent('')
      setEditingNoteID(null)
      
    } else {
      // CREATE new note
      const { error } = await supabase
        .from('notes')
        .insert([{ title, content }])
      
      if (error) {
        console.error('Error creating:', error)
        return
      }
      
      setTitle('')
      setContent('')
    }
    
    fetchNotes()
  }

  function startEditing(note: any) {
    setEditingNoteID(note.id)
    setTitle(note.title)
    setContent(note.content)
  }

  async function deleteNote(id: number) {
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id)
    
    if (error) console.error('Error deleting note:', error)
    else fetchNotes()
  }

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">My Notes</h1>
      
      {/* Create note form */}
      <div className="mb-8 p-4 border rounded">
        <input
          type="text"
          placeholder="Note title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 mb-2 border rounded"
        />
        <textarea
          placeholder="Note content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full p-2 mb-2 border rounded h-24"
        />
        <button
          onClick={handleSubmit}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          {editingNoteId ? 'Update Note' : 'Add Note'}
        </button>
      </div>

      {/* Display notes */}
      <div className="space-y-4">
        {notes.map((note) => (
          <div key={note.id} className="p-4 border rounded">
            <h2 className="text-xl font-semibold">{note.title}</h2>
            <p className="text-gray-600 mt-2">{note.content}</p>
            <button
              onClick={() => startEditing(note)}
              className="mt-2 mr-2 text-blue-500 hover:text-blue-700"
            >
              Edit
            </button>
            <button
              onClick={() => deleteNote(note.id)}
              className="mt-2 text-red-500 hover:text-red-700"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}