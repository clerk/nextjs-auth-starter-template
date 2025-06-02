// app/components/hooks/useNoteForm.ts
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { v4 as uuidv4 } from 'uuid';
import { NoteType } from '../types';

const noteSchema = yup.object().shape({
  title: yup.string().required('Title is required'),
  content: yup.string().when('isChecklist', (isChecklist, schema) => {
    return isChecklist
      ? schema.notRequired()
      : schema.required('Content is required');
  }),
  tasks: yup.array().of(
    yup.object().shape({
      text: yup.string().required('Task text is required'),
      completed: yup.boolean().required(),
    })
  ),
  isChecklist: yup.boolean(),
  images: yup.array().of(yup.string()),
});

export const useNoteForm = (onSubmit: (data: NoteType) => void) => {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<Partial<NoteType>>({
    defaultValues: {
      title: '',
      content: '',
      tasks: [],
      isChecklist: false,
      images: [],
    },
    resolver: yupResolver(noteSchema),
  });

  const submitHandler = handleSubmit((data) => {
    const finalNote: NoteType = {
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      title: data.title || '',
      content: data.content || '',
      tasks: data.tasks || [],
      isChecklist: data.isChecklist || false,
      images: data.images || [],
    };

    onSubmit(finalNote);
    reset();
  });

  return {
    register,
    handleSubmit,
    reset,
    watch,
    errors,
    submitHandler,
  };
};
