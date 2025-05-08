// componentt TodoModal.tsx
import React from 'react';
import { Note } from '../../types/types';

type Props = {
  note: Note;
  onClose: () => void;
};

const TodoModal = ({ note, onClose }: Props) => (
  <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-start justify-center pt-80">
    <div className="relative w-full max-w-xl mx-4 bg-white rounded-xl shadow-lg p-6">
      <button
        onClick={onClose}
        className="absolute top-3 right-4 text-gray-500 hover:text-red-500 text-2xl font-bold"
      >
        ×
      </button>
      <h2 className="text-2xl font-bold mb-2">{note.title}</h2>
      <p className="text-gray-700 whitespace-pre-wrap mb-4">{note.description}</p>
      <p className="text-sm text-gray-500">Created by: {note.user_firstname ?? 'Unknown'}</p>
      <p className="text-sm text-gray-500">Created at: {new Date(note.created_at).toLocaleString()}</p>
      <p className="text-sm text-gray-500">Last updated: {new Date(note.updated_at).toLocaleString()}</p>
    </div>
  </div>
);

export default TodoModal;
