import React, { useState, useRef } from 'react';
import * as yup from 'yup';
import { useTasks } from "../hooks/useTasks";


interface Task {
  id: string;
  text: string;
  completed: boolean;
}

interface FormValues {
  title: string;
  content: string;
  tasks: Task[];
  isChecklist: boolean;
  images: string[];
}

interface NoteInputProps {
  onSave: (values: FormValues) => Promise<void>;
}

const noteSchema = yup.object().shape({
  title: yup.string().trim().required('Title is required'),
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

export const TaskForm: React.FC<NoteInputProps> = ({ onSave }) => {
  const [formValues, setFormValues] = useState<FormValues>({
    title: '',
    content: '',
    tasks: [],
    isChecklist: false,
    images: []
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { taskInputRefs, handleTaskTextChange, handleTaskKeyDown } = useTasks();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await noteSchema.validate(formValues, { abortEarly: false });
      await onSave(formValues);
      setFormValues({
        title: '',
        content: '',
        tasks: [],
        isChecklist: false,
        images: []
      });
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        const validationErrors: Record<string, string> = {};
        err.inner.forEach((error) => {
          if (error.path) {
            validationErrors[error.path] = error.message;
          }
        });
        setErrors(validationErrors);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        value={formValues.title}
        onChange={(e) => setFormValues({ ...formValues, title: e.target.value })}
        placeholder="Title"
        className="w-full p-2 border rounded"
      />
      {errors.title && <span className="text-red-500">{errors.title}</span>}

      <textarea
        value={formValues.content}
        onChange={(e) => setFormValues({ ...formValues, content: e.target.value })}
        placeholder="Content"
        className="w-full p-2 border rounded"
      />
      {errors.content && <span className="text-red-500">{errors.content}</span>}

      <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">
        Save
      </button>
    </form>
  );
};