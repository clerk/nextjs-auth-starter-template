'use client';
import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import {      
  DragDropContext,
  Droppable,
  Draggable,
  DropResult
} from '@hello-pangea/dnd'; 
import { Button } from './atoms/Button';
import { Note, noteSchema } from './types';
import { useNotes } from './hooks/useNotes';
import NotesList from './noteslist';

export const useNoteForm = (onSubmit: (data: Note) => Promise<void>) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    resolver: yupResolver(noteSchema),
    defaultValues: {
      title: '',
      content: '',
      isChecklist: false,
      tasks: [],
      images: []
    }
  });

  const submitHandler = handleSubmit(async (data) => {
    try {
      await onSubmit(data);
      reset();
    } catch (error) {
      console.error('Form submission error:', error);
    }
  });

  return {
    register,
    errors,
    submitHandler
  };
};

export const useNotes = () => {
  const saveNote = async (note: Omit<Note, 'id' | 'createdAt'>) => {
    try {
      const newNote: Note = {
        ...note,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };

      const existingNotes = JSON.parse(localStorage.getItem('notes') || '[]');
      const updatedNotes = [newNote, ...existingNotes];
      
      localStorage.setItem('notes', JSON.stringify(updatedNotes));
      return newNote;
    } catch (error) {
      console.error('Error saving note:', error);
      throw new Error('Failed to save note');
    }
  };

  const getNotes = (): Note[] => {
    try {
      const notes = JSON.parse(localStorage.getItem('notes') || '[]');
      return notes.sort((a: Note, b: Note) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } catch (error) {
      console.error('Error getting notes:', error);
      return [];
    }
  };

  return { saveNote, getNotes };
};

interface NoteInputProps {
  onSave: (note: Note) => Promise<void>;
}

const NoteInput = ({ onSave }: NoteInputProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const taskInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isSaving, setIsSaving] = useState(false);

  const { register, errors, submitHandler } = useNoteForm(onSave);

  const [newNote, setNewNote] = useState({
    title: '',
    content: '',
    tasks: [{ id: Date.now().toString(), text: '', completed: false }],
    isOpen: true,
    isChecklist: false,
    images: [] as string[]
  });

  useEffect(() => {
    if (!newNote.isOpen) {
      textareaRef.current?.focus();
    }
  }, [newNote.isOpen]);

  useEffect(() => {
    if (taskInputRefs.current.length > 0 && newNote.isOpen && newNote.isChecklist) {
      const lastIndex = newNote.tasks.length - 1;
      taskInputRefs.current[lastIndex]?.focus();
    }
  }, [newNote.tasks.length, newNote.isOpen, newNote.isChecklist]);

  const toggleNewTaskCompletion = (taskId: string) => {
    setNewNote(prev => ({
      ...prev,
      tasks: prev.tasks.map(task =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    }));
  };

  const handleTaskKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const newTasks = [...newNote.tasks];
      newTasks.splice(index + 1, 0, {
        id: Date.now().toString(),
        text: '',
        completed: false
      });
      setNewNote(prev => ({ ...prev, tasks: newTasks }));
    } else if (e.key === 'Backspace' && (e.target as HTMLInputElement).value === '' && newNote.tasks.length > 1) {
      e.preventDefault();
      const newTasks = newNote.tasks.filter((_, i) => i !== index);
      setNewNote(prev => ({ ...prev, tasks: newTasks }));

      if (index > 0) {
        setTimeout(() => {
          taskInputRefs.current[index - 1]?.focus();
        }, 0);
      }
    }
  };

  const toggleChecklist = () => {
    setNewNote(prev => ({
      ...prev,
      isChecklist: !prev.isChecklist,
      tasks: prev.isChecklist ? [] : [{ id: Date.now().toString(), text: '', completed: false }]
    }));
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
  
    const items = Array.from(newNote.tasks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
  
    setNewNote((prev) => ({
      ...prev,
      tasks: items
    }));
  };
  

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const validImageTypes = ['image/jpeg', 'image/png', 'image/gif'];
    const validFiles = Array.from(files).filter(file =>
      validImageTypes.includes(file.type)
    );

    const imageUrls = validFiles.map(file => URL.createObjectURL(file));
    setNewNote(prev => ({
      ...prev,
      images: [...prev.images, ...imageUrls]
    }));
  };

  const removeImage = (index: number) => {
    setNewNote(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="w-full max-w-2xl mx-auto mb-6">
      <div className={`w-full rounded-lg bg-neutral-800/50 hover:bg-neutral-800 transition-colors ${newNote.isOpen ? 'z-10 relative' : ''}`}>
        {newNote.isOpen ? (
          <form onSubmit={submitHandler} className="flex flex-col">
            <div className="flex items-center border-b border-neutral-700">
              <input
                type="text"
                placeholder="Title"
                {...register('title')}
                className="w-full px-4 py-3 bg-transparent text-lg font-medium text-white placeholder-neutral-500 focus:outline-none"
              />

              <Button
                onClick={toggleChecklist}
                variant="icon"
                type="button"
                className="px-3 py-2 mr-2"
              >
                {newNote.isChecklist ? 'Text' : 'List'}
              </Button>

              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
              />

              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="icon"
                type="button"
                className="px-3 py-2"
              >
                📷
              </Button>
            </div>

            {newNote.images.length > 0 && (
              <div className="grid grid-cols-3 gap-2 p-4">
                {newNote.images.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image}
                      alt={`Image ${index + 1}`}
                      className="w-full h-24 object-cover rounded"
                    />
                    <Button
                      type="button"
                      onClick={() => removeImage(index)}
                      variant="ghost"
                      size="sm"
                      className="absolute top-1 right-1 rounded-full p-1"
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {newNote.isChecklist ? (
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="tasks">
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef} className="px-4 py-2">
                      {newNote.tasks.map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id.toString()} index={index}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="flex items-center py-1 group"
                            >
                              <span
                                className="mr-2 cursor-grab text-neutral-500 group-hover:text-white"
                              >
                                ≡
                              </span>
                              <input
                                type="checkbox"
                                checked={task.completed}
                                onChange={() => toggleNewTaskCompletion(task.id)}
                                className="mr-2"
                              />
                              <input
                                ref={(el) => {
                                  taskInputRefs.current[index] = el;
                                }}
                                type="text"
                                value={task.text}
                                onChange={(e) => {
                                  const updatedTasks = [...newNote.tasks];
                                  updatedTasks[index].text = e.target.value;
                                  setNewNote(prev => ({ ...prev, tasks: updatedTasks }));
                                }}
                                onKeyDown={(e) => handleTaskKeyDown(e, index)}
                                className={`flex-1 bg-transparent ${task.completed ? 'line-through text-neutral-500' : 'text-neutral-200'
                                  }`}
                                placeholder="List item"
                              />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            ) : (
              <textarea
                ref={textareaRef}
                autoFocus
                {...register('content')}
                className="w-full px-4 py-3 bg-transparent text-base text-neutral-200 placeholder-neutral-500 resize-none focus:outline-none"
                placeholder="Take a note..."
                rows={3}
              />
            )} 

            <div className="flex justify-end items-center p-2 rounded-b-lg">
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => setNewNote(prev => ({ ...prev, isOpen: false }))}
              >
                Close
              </Button>
              <Button type="submit" className="ml-2" disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </form>
        ) : (
          <div
            onClick={() => setNewNote(prev => ({ ...prev, isOpen: true }))}
            className="px-4 py-3 text-neutral-400 cursor-pointer rounded-lg"
          >
            Take a note...
          </div>
        )}
      </div>
    </div>
  );
};

export default function Page() {
  const { saveNote, getNotes } = useNotes();
  const [notes, setNotes] = useState<Note[]>(getNotes());

  const handleSave = async (noteData: Omit<Note, 'id' | 'createdAt'>) => {
    try {
      const savedNote = await saveNote(noteData);
      setNotes(getNotes());
    } catch (error) {
      console.error('Error in handleSave:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <NoteInput onSave={handleSave} />
      <NotesList 
        notes={notes} 
        onUpdate={async (updatedNote) => {
          setNotes((prevNotes) =>
            prevNotes.map((note) =>
              note.id === updatedNote.id ? updatedNote : note
            )
          );
        }}
        onDelete={async (noteId) => {
          setNotes((prevNotes) => prevNotes.filter((note) => note.id !== noteId));
          const existingNotes = JSON.parse(localStorage.getItem('notes') || '[]');
          const updatedNotes = existingNotes.filter((note: Note) => note.id !== noteId);
          localStorage.setItem('notes', JSON.stringify(updatedNotes));
        }}
      />
    </div>
  );
}
