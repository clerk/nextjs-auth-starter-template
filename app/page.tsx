'use client';

import { useState, useEffect } from 'react';
import { Note } from './components/types';
import NoteInput from './components/noteInput';
import NotesList from './components/noteslist';

const LOCAL_STORAGE_KEY = 'notes-app-data';

const validateNote = (note: Partial<Note>): Note => {
  if (!note.id || !note.createdAt) {
    throw new Error('Invalid note data');
  }
  return {
    id: note.id,
    title: note.title || '',
    content: note.content || '',
    createdAt: note.createdAt,
    isOpen: note.isOpen ?? true,
    images: note.images || [],
    isChecklist: note.isChecklist ?? false,
    tasks: note.tasks || []
  };
};

const generateId = () => Date.now().toString();

export default function Home() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = () => {
    try {
      setIsLoading(true);
      const savedNotes = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedNotes) {
        const parsedNotes = JSON.parse(savedNotes);
        const validatedNotes = parsedNotes.map(validateNote);
        setNotes(validatedNotes);
      }
      setError(null);
    } catch (err) {
      setError('Failed to load notes');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const saveNotes = (newNotes: Note[]) => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newNotes));
    setNotes(newNotes);
  };

  const handleCreateNote = async (note: Omit<Note, 'id' | 'createdAt'>) => {
    try {
      const completeNote: Note = {
        ...note,
        id: generateId(),
        createdAt: new Date(),
        title: note.title || 'Untitled Note',
        content: note.content || '',
        tasks: note.tasks || [],
        images: note.images || [],
        isChecklist: note.isChecklist || false,
        isOpen: note.isOpen || false
      };
      
      const newNotes = [...notes, completeNote];
      saveNotes(newNotes);
    } catch (err) {
      setError('Failed to create note');
      throw err;
    }
  };

  const handleUpdateNote = async (note: Note) => {
    try {
      const updatedNotes = notes.map(n => 
        n.id === note.id ? { ...n, ...note } : n
      );
      saveNotes(updatedNotes);
    } catch (err) {
      setError('Failed to update note');
    }
  };

  const handleDeleteNote = async (id: string) => {
    try {
      const filteredNotes = notes.filter(note => note.id !== id);
      saveNotes(filteredNotes);
    } catch (err) {
      setError('Failed to delete note');
    }
  };

  return (
    <div className="flex flex-col pt-16">
  {/* sticky NoteInput */}
  <div className="sticky top-16 z-10 p-4 -mx-4">
    <NoteInput onSave={handleCreateNote} />
  </div>


      {/* Error display */}
      {error && (
        <div className="text-red-500 my-4 p-2 bg-red-50/10 rounded">
          {error}
        </div>
      )}

      {/* Notes list with proper spacing */}
      <div className="mt-4">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-orange-500" />
          </div>
        ) : (
          <NotesList 
            notes={notes} 
            onUpdate={handleUpdateNote}
            onDelete={handleDeleteNote}
          />
        )}
      </div>

      {/* Pagination controls */}
      {notes.length > 0 && (
        <div className="mt-8 flex justify-center">
          {/* Your pagination component here */}
        </div>
      )}
    </div>
  );
}