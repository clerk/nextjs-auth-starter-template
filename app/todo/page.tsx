'use client';

import React, { useState } from 'react';
import { useUser, useAuth } from "@clerk/nextjs";
import axios from 'axios';

type Note = {
  id: number;
  content: string;
};

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [input, setInput] = useState('');
  const { getToken } = useAuth();
  const { isSignedIn } = useUser();

  const addNote = async () => {
    if (!input.trim() || !isSignedIn) return;

    try {
      const token = await getToken();
      console.log('Token:', token);
      const response = await axios.post('http://localhost:8080/notes',
        {
          title: input.trim(),
          description: input.trim(), // You can expand this as needed
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const createdNote = response.data;

      setNotes((prev) => [
        {
          id: createdNote.id,
          content: createdNote.title, // or description
        },
        ...prev,
      ]);
      setInput('');
    } catch (error: any) {
      console.error('Failed to create note:', error.response?.data || error.message);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6 text-center">My Notes</h1>

      <div className="flex mb-6 gap-2">
        <input
          type="text"
          placeholder="Write a new note..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-grow px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring focus:border-blue-300"
        />
        <button
          onClick={addNote}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Add
        </button>
      </div>

      <ul className="space-y-3">
        {notes.map((note) => (
          <li
            key={note.id}
            className="p-4 bg-gray-100 rounded-lg shadow-sm border"
          >
            {note.content}
          </li>
        ))}
      </ul>
    </div>
  );
}
