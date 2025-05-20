import * as yup from 'yup';
import { useState, useRef } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';



export interface NoteType {
  id: string;
  title: string;
  content: string;
  // other fields...
}

export interface Task {
  id: string;
  text: string;
  completed: boolean;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  tasks: Task[];
  isChecklist: boolean;
  isOpen: boolean;
  images: string[];
  createdAt: Date;
}

export interface FormData {
  title: string;
  checklist: { text: string }[];
  image: File | null | undefined;
}

// Helper function to validate notes
export function validateNote(data: any): Note {
  return {
    id: data.id || Date.now().toString(),
    title: data.title || '',
    content: data.content || '',
    tasks: Array.isArray(data.tasks) 
      ? data.tasks.map((t: any) => ({
          id: t.id || Date.now().toString(),
          text: t.text || '',
          completed: Boolean(t.completed)
        }))
      : [],
    isChecklist: Boolean(data.isChecklist),
    isOpen: Boolean(data.isOpen),
    images: Array.isArray(data.images) ? data.images : [],
    createdAt: data.createdAt ? new Date(data.createdAt) : new Date()
  };
}

export const noteSchema = yup.object().shape({
  title: yup.string().required('Title is required'),
  checklist: yup.array().of(
    yup.object().shape({
      text: yup.string().required('Checklist item text is required')
    })
  ).required(),
  image: yup
    .mixed<File>()
    .nullable()
    .test(
      'fileType',
      'Invalid file type',
      (value) => value === null || value === undefined || value instanceof File
    )
});

type NoteInputProps = {
  onSave: (note: Omit<Note, "id" | "createdAt">) => Promise<void>;
};

export default function NoteInput({ onSave: onSaveAction }: NoteInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(noteSchema),
    defaultValues: {
      title: "",
      checklist: [],
      image: null,
    },
  });

  
  
// In ../types.ts
const NoteType = {
  id: '',
  title: '',
  content: '',
  tasks: [],
  isChecklist: false,
  isOpen: false,
  images: [],
  createdAt: new Date(),
}; // or `interface NoteType { ... }`




  const { fields, append, remove } = useFieldArray({
    control,
    name: 'checklist'
  });
}