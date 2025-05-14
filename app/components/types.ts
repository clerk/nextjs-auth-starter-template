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