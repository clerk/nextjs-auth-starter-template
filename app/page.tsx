'use client';

import { useState, useEffect } from 'react';
import { fetchTodos, createNote, updateNote, deleteNote } from '@/lib/utils';
import { Note } from './components/types';
import NoteInput from './components/noteInput';
import NotesList from './components/noteslist';

const validateNote = (note: Partial<Note>): Note => {
  if (!note.id || !note.content || !note.createdAt) {
    throw new Error('Invalid note data');
  }
  return {
    id: note.id,
    title: note.title || '',
    content: note.content,
    createdAt: note.createdAt,
    isOpen: note.isOpen ?? true,
    images: note.images || [],
    isChecklist: note.isChecklist ?? false,
    tasks: note.tasks ?? []
  };
};

export default function Home() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      setIsLoading(true);
      const data = await fetchTodos();
      const validatedNotes = data.map(validateNote);
      setNotes(validatedNotes);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load notes');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // const handleCreateNote = async (note: Partial<Note>) => {
  //   try {
  //     const newNote = await createNote({
  //       ...note,
  //       id: note.id || generateId(), // Generate an id if not provided
  //       createdAt: new Date() // Set createdAt field if not present
  //     });
  //     setNotes(prev => [...prev, validateNote(newNote)]);
  //   } catch (err) {
  //     setError(err instanceof Error ? err.message : 'Failed to create note');
  //   }
  // };
  
  function generateId(): string {
    return Math.random().toString(36).substr(2, 9); // Example ID generator
  }
  

  const handleUpdateNote = async (id: string, updates: Partial<Note>) => {
    try {
      await updateNote(id, updates);
      await loadNotes();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update note');
    }
  };

  const handleDeleteNote = async (id: string) => {
    try {
      await deleteNote(id);
      setNotes(prev => prev.filter(note => note.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete note');
    }
  };

  return (
    <main className="container mx-auto px-4 py-8">
      {/* <NoteInput onSubmit={handleCreateNote} /> */}
      {error && (
        <div className="text-red-500 my-4 p-2 bg-red-50 rounded">
          {error}
        </div>
      )}
      {/* {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-orange-500" />
        </div>
      ) : (
        // <NotesList 
        //   notes={notes} 
        //   onUpdate={handleUpdateNote}
        //   onDelete={handleDeleteNote}
        //   onRefresh={loadNotes}
        // />
      )} */}
    </main>
  );
}
