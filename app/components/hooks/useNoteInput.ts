import { useState, useRef, useEffect } from "react";
import { Note } from "../types";

export const useNoteInput = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const taskInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [newNote, setNewNote] = useState<Note>({
    title: "",
    content: "",
    tasks: [{ id: Date.now().toString(), text: "", completed: false }],
    isOpen: true,
    isChecklist: false,
    images: [],
    id: "",
    createdAt: new Date(),
  });

  return {
    fileInputRef,
    titleInputRef,
    taskInputRefs,
    textareaRef,
    isSaving,
    setIsSaving,
    newNote,
    setNewNote,
  };
};
