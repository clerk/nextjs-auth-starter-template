import axios from 'axios';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { cva, type VariantProps } from "class-variance-authority";
import { Note } from '../app/components/types';


// Better Tailwind button class manager using CVA
export const buttonVariants = cva(
  "rounded-md text-sm transition-colors focus:outline-none focus:ring-offset-2 disabled:opacity-50 inline-flex items-center justify-center",
  {
    variants: {
      variant: {
        default: "bg-orange-600 text-white hover:bg-orange-700",
        outline: "border border-orange-600 text-orange-600 hover:bg-orange-50",
        ghost: "bg-transparent text-neutral-400 hover:text-white",
        icon: "bg-transparent text-neutral-400 hover:text-white p-2",
        danger: "text-red-500 hover:bg-neutral-700",
      },
      size: {
        sm: "py-1 px-3 text-sm",
        md: "py-2 px-4 text-sm",
        lg: "py-3 px-6 text-base",
      },
      fullWidth: {
        true: "w-full",
        false: "",
      },
      alignLeft: {
        true: "text-left",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      fullWidth: false,
      alignLeft: false,
    },
  }
);

export type ButtonVariantProps = VariantProps<typeof buttonVariants>;

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// API base URL
const TODO_API_URL = 'https://6818a4d35a4b07b9d1d02948.mockapi.io/todo';

// Axios-based API functions
export async function fetchTodos(): Promise<Note[]> {
  const response = await axios.get<Note[]>(TODO_API_URL);
  return response.data;
}

export async function createNote(todo: Note): Promise<Note> {
  const response = await axios.post<Note>(TODO_API_URL, todo, {
    headers: { 'Content-Type': 'application/json' }
  });
  return response.data;
}

export async function updateNote(id: string, updates: Partial<Note>): Promise<Note> {
  const response = await axios.put<Note>(`${TODO_API_URL}/${id}`, updates, {
    headers: { 'Content-Type': 'application/json' }
  });
  return response.data;
}


export async function deleteNote(id: string): Promise<void> {
  await axios.delete(`${TODO_API_URL}/${id}`);
}

//my idea
export function buttonClasses(
  className = "",
  variant: "default" | "outline" | "ghost" | "danger" | "icon" = "default",
  size: "sm" | "md" | "lg" = "md"
) {
  const base =
    "inline-flex items-center justify-center rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50";

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-5 py-3 text-base",
  };

  const variants = {
    default: "bg-blue-600 text-white hover:bg-blue-700",
    outline: "border border-gray-300 text-gray-700 hover:bg-gray-100",
    ghost: "text-gray-700 hover:bg-gray-100",
    danger: "bg-red-600 text-white hover:bg-red-700",
    icon: "p-2",
  };

  return clsx(base, sizes[size], variants[variant], className);
}

// Type guard
export function isNote(data: any): data is Note {
  return (
    typeof data === 'object' &&
    data !== null &&
    typeof data.id === 'string' &&
    typeof data.title === 'string' &&
    typeof data.content === 'string' &&
    Array.isArray(data.tasks)
  );
}
