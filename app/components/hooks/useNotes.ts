import { useState } from "react";
import { Note } from "../types";

export const useNotes = (
  initialNotes: Note[],
  onUpdate: (note: Note) => Promise<void>,
  onDelete: (id: string) => Promise<void>
) => {
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [hoveredNoteId, setHoveredNoteId] = useState<string | null>(null);
  const [showDeleteMenuId, setShowDeleteMenuId] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const deleteNote = async (noteId: string) => {
    try {
      await onDelete(noteId);
    } catch (error) {
      console.error("Failed to delete note:", error);
    }
  };

  const updateNote = async (updatedNote: Note) => {
    try {
      setIsUpdating(true);
      await onUpdate(updatedNote);
    } catch (error) {
      console.error("Failed to update note:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const toggleChecklist = async (noteId: string) => {
    const note = initialNotes.find((n) => n.id === noteId);
    if (!note) return;

    const updatedNote = {
      ...note,
      isChecklist: !note.isChecklist,
      content: note.isChecklist ? note.content : "",
      tasks: note.isChecklist
        ? note.tasks
        : [{ id: Date.now().toString(), text: "", completed: false }],
    };

    setEditingNote(updatedNote);
  };

  const toggleTaskCompletion = (taskId: string) => {
    if (!editingNote) return;

    const updatedTasks = editingNote.tasks.map((t) =>
      t.id === taskId ? { ...t, completed: !t.completed } : t
    );

    setEditingNote({ ...editingNote, tasks: updatedTasks });
  };

  const startEditingNote = (noteId: string) => {
    if (!showDeleteMenuId) {
      const noteToEdit = initialNotes.find((n) => n.id === noteId);
      if (noteToEdit) {
        setEditingNoteId(noteId);
        setEditingNote({ ...noteToEdit });
      }
    }
  };

  const closeEditor = async () => {
    if (editingNote) {
      await updateNote(editingNote);
    }
    setEditingNoteId(null);
    setEditingNote(null);
  };

  return {
    editingNoteId,
    editingNote,
    hoveredNoteId,
    showDeleteMenuId,
    isUpdating,
    setEditingNote,
    setHoveredNoteId,
    setShowDeleteMenuId,
    deleteNote,
    updateNote,
    toggleChecklist,
    toggleTaskCompletion,
    startEditingNote,
    closeEditor,
  };
};
