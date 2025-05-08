'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth, useUser } from '@clerk/nextjs';
import { Note } from '../types/types';
import TodoList from '../components/todo/TodoList';
import ConfirmModal from '../components/ConfirmModal';
import TodoForm from '../components/todo/TodoForm';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [noteToDelete, setNoteToDelete] = useState<Note | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const { getToken } = useAuth();
  const { isSignedIn } = useUser();

  const getNotes = async () => {
    const token = await getToken();
    if (!token) return;
  
    try {
      const res = await axios.get(`${API_URL}/notes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('API response:', res.data); // Add this line
      const fetchedNotes = Array.isArray(res.data?.Notes) ? res.data.Notes : [];
      setNotes(fetchedNotes);
    } catch (error: any) {
      console.error('Error fetching notes:', error.response?.data || error.message);
    }
  };

  const handleSubmit = async () => {
    const token = await getToken();
    if (!token) return;

    try {
      const res = await axios.post(
        `${API_URL}/notes`,
        { title, description },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setNotes((prev) => [...prev, res.data]);
      setTitle('');
      setDescription('');
    } catch (error: any) {
      console.error('Error adding note:', error.response?.data || error.message);
    }
  };

  const confirmDelete = async () => {
    if (!noteToDelete) return;

    try {
      const token = await getToken();
      await axios.delete(`${API_URL}/notes/${noteToDelete.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotes((prev) => prev.filter((n) => n.id !== noteToDelete.id));
      setNoteToDelete(null);
    } catch (error: any) {
      console.error('Error deleting note:', error.response?.data || error.message);
    }
  };

  const handleDelete = (note: Note) => {
    setNoteToDelete(note);
    setIsConfirmOpen(true);
  };

  useEffect(() => {
    if (isSignedIn) getNotes();
  }, [isSignedIn]);

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6 text-center">My Notes</h1>

      <TodoForm
        title={title}
        description={description}
        setTitle={setTitle}
        setDescription={setDescription}
        onSubmit={handleSubmit}
      />

      <TodoList
        notes={Array.isArray(notes) ? notes : []}
        onSelect={setSelectedNote}
        onDelete={handleDelete}
      />

      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Note"
        message={`Are you sure you want to delete "${noteToDelete?.title}"?`}
      />
    </div>
  );
}
