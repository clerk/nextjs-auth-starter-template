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
    createdAt: new Date(note.createdAt),
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
        isOpen: false
      };

      const newNotes = [...notes, completeNote];
      saveNotes(newNotes);
    } catch (err) {
      setError('Failed to create note');
      throw err;
    }
  };

  const handleUpdateNote = async (updatedNote: Note) => {
    try {
      const updatedNotes = notes.map(note =>
        note.id === updatedNote.id ? updatedNote : note
      );
      saveNotes(updatedNotes);
    } catch (err) {
      setError('Failed to update note');
      throw err;
    }
  };

  const handleDeleteNote = async (id: string) => {
    try {
      const updatedNotes = notes.filter(note => note.id !== id);
      saveNotes(updatedNotes);
    } catch (err) {
      setError('Failed to delete note');
      throw err;
    }
  };

  return (
    <main className="min-h-screen p-4  text-white">
      <h1 className="text-2xl font-bold mb-4">My Notes</h1>
      <NoteInput onSave={handleCreateNote} />

      {isLoading ? (
        <p className="mt-4">Loading...</p>
      ) : error ? (
        <p className="mt-4 text-red-500">{error}</p>
      ) : notes.length === 0 ? (
        <p className="mt-4">No notes yet. Start writing one!</p>
      ) : (
        <NotesList
          notes={notes}
          onUpdate={handleUpdateNote}
          onDelete={handleDeleteNote}
        />
      )}
    </main>
  );
}
