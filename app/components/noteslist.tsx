"use client";

import { useState, useEffect, useRef } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { Note } from "./types";
import { useNotes } from "./hooks/useNotes";
import { Button } from "./atoms/Button";
import { useTasks } from "./hooks/useTasks";
import { TaskForm } from "./hooks/TaskForm";
import { useNoteInput } from "./hooks/useNoteInput";


interface NotesListProps {
  notes: Note[];
  onUpdate: (note: Note) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const NotesList = ({ notes, onUpdate, onDelete }: NotesListProps) => {
  const [hoveredNoteId, setHoveredNoteId] = useState<string | null>(null);
  const [showDeleteMenuId, setShowDeleteMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const {
    editingNoteId,
    editingNote,
    isUpdating,
    setEditingNote,
    deleteNote,
    toggleChecklist,
    toggleTaskCompletion,
    startEditingNote,
    closeEditor,
  } = useNotes(notes, onUpdate, onDelete);

  const { taskInputRefs, handleTaskTextChange, handleTaskKeyDown } = useTasks();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowDeleteMenuId(null);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (editingNote) {
      setEditingNote({ ...editingNote, title: e.target.value });
    }
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (editingNote) {
      setEditingNote({ ...editingNote, content: e.target.value });
    }
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination || !editingNote) return;

    const updatedTasks = Array.from(editingNote.tasks);
    const [movedTask] = updatedTasks.splice(result.source.index, 1);
    updatedTasks.splice(result.destination.index, 0, movedTask);

    setEditingNote({ ...editingNote, tasks: updatedTasks });
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      {[...notes]
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .map((note) => {
          const isEditing = editingNoteId === note.id;
          const displayNote = isEditing && editingNote ? editingNote : note;

          return (
            <div
              key={note.id}
              onMouseEnter={() => setHoveredNoteId(note.id)}
              onMouseLeave={() => setHoveredNoteId(null)}
              onClick={() => !editingNoteId && startEditingNote(note.id)}
              className={`bg-neutral-800 border border-neutral-700 rounded-lg p-4 relative transition-all ${
                isEditing
                  ? "fixed inset-0 z-30 m-auto max-h-[80vh] overflow-y-auto"
                  : editingNoteId
                  ? "opacity-50 blur-sm pointer-events-none"
                  : "hover:shadow-md hover:border-neutral-600 cursor-pointer"
              }`}
            >
              {/* Options menu */}
              {(hoveredNoteId === note.id || showDeleteMenuId === note.id) &&
                !editingNoteId && (
                  <div className="absolute top-2 right-2 z-10" ref={menuRef}>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowDeleteMenuId(
                          showDeleteMenuId === note.id ? null : note.id
                        );
                      }}
                      variant="icon"
                      size="sm"
                      className="rounded-full hover:bg-neutral-700"
                      aria-label="Menu options"
                    >
                      ⋮
                    </Button>

                    {showDeleteMenuId === note.id && (
                      <div className="absolute right-0 mt-1 w-40 bg-neutral-800 border border-neutral-700 rounded-md shadow-lg z-20">
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNote(note.id);
                          }}
                          variant="ghost"
                          size="sm"
                          className="w-full text-left"
                        >
                          Delete Note
                        </Button>
                      </div>
                    )}
                  </div>
                )}

              {/* Editing mode */}
              {isEditing ? (
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center border-b border-neutral-700">
                    <input
                      type="text"
                      value={displayNote.title}
                      onChange={handleTitleChange}
                      className="w-full px-4 py-3 bg-transparent text-lg font-medium text-white placeholder-neutral-500 focus:outline-none"
                      placeholder="Title"
                    />
                    <Button
                      onClick={() => toggleChecklist(note.id)}
                      title={
                        displayNote.isChecklist
                          ? "Switch to text"
                          : "Switch to checklist"
                      }
                      variant="ghost"
                      size="sm"
                      className="text-neutral-400 hover:text-white mr-2"
                    >
                      {displayNote.isChecklist ? "📝" : "☑️"}
                    </Button>
                  </div>

                  {/* Checklist mode */}
                  {displayNote.isChecklist ? (
                    <DragDropContext onDragEnd={handleDragEnd}>
                      <Droppable droppableId={`tasks-${note.id}`}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className="px-4 py-2"
                          >
                            {displayNote.tasks.map((task, index) => (
                              <Draggable
                                key={task.id}
                                draggableId={task.id}
                                index={index}
                              >
                                {(provided) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    className="flex items-center py-1 group"
                                  >
                                    <span
                                      {...provided.dragHandleProps}
                                      className="mr-2 text-neutral-500 hover:text-neutral-700 cursor-grab invisible group-hover:visible"
                                    >
                                      ≡
                                    </span>
                                    <input
                                      ref={(el) => {
                                        if (el) {
                                          (taskInputRefs.current as HTMLInputElement[])[index] = el;
                                        }
                                      }}
                                      type="text"
                                      value={task.text}
                                      onChange={(e) => {
                                        if (displayNote?.tasks) {
                                          handleTaskTextChange(
                                            displayNote.tasks,
                                            (updatedTasks) => {
                                              setEditingNote((prev) => {
                                                if (!prev) return prev;
                                                return {
                                                  ...prev,
                                                  tasks: updatedTasks
                                                };
                                              });
                                            }
                                          )(task.id, e.target.value);
                                        }
                                      }}
                                      className="flex-1 bg-transparent outline-none"
                                      placeholder="Enter task..."
                                      onKeyDown={(e) => {
                                        if (displayNote?.tasks) {
                                          handleTaskKeyDown(
                                            displayNote.tasks,
                                            (updatedTasks) => {
                                              if (editingNote) {
                                                setEditingNote({
                                                  ...editingNote,
                                                  tasks: updatedTasks
                                                });
                                              }
                                            }
                                          )(e, index);
                                        }
                                      }}
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
                      value={displayNote.content}
                      onChange={handleContentChange}
                      rows={4}
                      className="w-full px-4 py-3 bg-transparent text-base text-neutral-200 placeholder-neutral-500 resize-none focus:outline-none"
                      placeholder="Note content..."
                    />
                  )}

                  <div className="flex justify-between items-center text-xs text-neutral-500 px-2 mt-2">
                    <span>{new Date(note.createdAt).toLocaleString()}</span>

                    <Button
                      onClick={closeEditor}
                      disabled={isUpdating}
                      variant="default"
                      size="md"
                    >
                      {isUpdating ? "Saving..." : "Close"}
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  {note.title && (
                    <h3 className="text-lg font-medium text-white mb-2">
                      {note.title}
                    </h3>
                  )}
                  {note.isChecklist ? (
                    <ul className="space-y-1">
                      {note.tasks.map((task) => (
                        <li key={task.id} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={task.completed}
                            onChange={() => toggleTaskCompletion(note.id, task.id)}
                            className="mr-2 h-4 w-4"
                          />
                          <span
                            className={`${
                              task.completed
                                ? "line-through text-neutral-500"
                                : "text-neutral-300"
                            }`}
                          >
                            {task.text}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-neutral-300 whitespace-pre-wrap">
                      {note.content}
                    </p>
                  )}
                  <div className="text-xs text-neutral-500 mt-2">
                    {new Date(note.createdAt).toLocaleString()}
                  </div>
                </>
              )}
            </div>
          );
        })}
    </div>
  );
};

export default NotesList;