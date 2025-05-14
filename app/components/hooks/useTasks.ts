import { useState, useCallback } from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { noteSchema } from '@/lib/schema';

interface Task {
  id: string;
  text: string;
  completed: boolean;
}

interface UseTasksReturn {
  tasks: Task[];
  addTask: (text: string) => void;
  removeTask: (id: string) => void;
  toggleTask: (id: string) => void;
  updateTask: (id: string, text: string) => void;
}

export const useTasks = (): UseTasksReturn => {
  const [tasks, setTasks] = useState<Task[]>([]);

  const addTask = useCallback((text: string) => {
    setTasks(prev => [...prev, {
      id: Date.now().toString(),
      text,
      completed: false
    }]);
  }, []);

  const removeTask = useCallback((id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  }, []);

  const toggleTask = useCallback((id: string) => {
    setTasks(prev => prev.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  }, []);

  const updateTask = useCallback((id: string, text: string) => {
    setTasks(prev => prev.map(task =>
      task.id === id ? { ...task, text } : task
    ));
  }, []);

  return {
    tasks,
    addTask,
    removeTask,
    toggleTask,
    updateTask
  };
};

export const noteSchema = yup.object().shape({
  title: yup.string().trim(),
  content: yup.string().required('Note content is required'),
  tasks: yup.array().of(
    yup.object().shape({
      id: yup.string().required(),
      text: yup.string().required('Task text is required'),
      completed: yup.boolean().required()
    })
  ),
  isChecklist: yup.boolean(),
  images: yup.array().of(yup.string())
});

const NoteInput = ({ onSave }: NoteInputProps) => {
  const formik = useFormik({
    initialValues: {
      title: '',
      content: '',
      tasks: [{ id: Date.now().toString(), text: '', completed: false }],
      isChecklist: false,
      images: []
    },
    validationSchema: noteSchema,
    onSubmit: async (values) => {
      try {
        setIsSaving(true);
        await onSave(values);
        formik.resetForm();
      } catch (error) {
        console.error('Failed to save note:', error);
      } finally {
        setIsSaving(false);
      }
    }
  });

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="bg-neutral-800/90 backdrop-blur-sm rounded-lg shadow-xl border border-neutral-700/50">
        <form onSubmit={formik.handleSubmit} className="space-y-2">
          <input
            {...formik.getFieldProps('title')}
            ref={titleInputRef}
            className={`w-full px-4 pt-4 bg-transparent text-lg ${
              formik.errors.title ? 'border-red-500' : 'border-transparent'
            }`}
            placeholder="Title"
            autoFocus
          />
          {formik.errors.title && (
            <div className="text-red-500 text-sm px-4">{formik.errors.title}</div>
          )}
          
          <textarea
            {...formik.getFieldProps('content')}
            ref={textareaRef}
            className={`w-full px-4 py-2 bg-transparent ${
              formik.errors.content ? 'border-red-500' : 'border-transparent'
            }`}
            placeholder="Take a note..."
            rows={3}
          />
          {formik.errors.content && (
            <div className="text-red-500 text-sm px-4">{formik.errors.content}</div>
          )}

          <div className="flex justify-end items-center p-2 border-t border-neutral-700/50">
            <Button
              type="submit"
              disabled={isSaving || !formik.isValid}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
