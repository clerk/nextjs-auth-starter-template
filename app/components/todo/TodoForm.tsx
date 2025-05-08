// components/TodoForm.tsx
import React from 'react';

type Props = {
  title: string;
  description: string;
  setTitle: (val: string) => void;
  setDescription: (val: string) => void;
  onSubmit: () => void;
};

const TodoForm = ({ title, description, setTitle, setDescription, onSubmit }: Props) => (
  <div className="grid col-1 mb-6 gap-2">
    <input
      type="text"
      placeholder="Title..."
      value={title}
      onChange={(e) => setTitle(e.target.value)}
      className="w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring focus:border-blue-300"
    />
    <textarea
      rows={4}
      placeholder="Write a new note..."
      value={description}
      onChange={(e) => setDescription(e.target.value)}
      className="w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring focus:border-blue-300"
    />
    <button
      onClick={onSubmit}
      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
    >
      Add
    </button>
  </div>
);

export default TodoForm;
