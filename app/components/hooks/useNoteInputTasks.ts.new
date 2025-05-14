import { useRef, useEffect } from "react";
import { DropResult } from "@hello-pangea/dnd";
import { Task } from "../types";

export const useNoteInputTasks = (
  tasks: Task[],
  isOpen: boolean,
  isChecklist: boolean,
  onTasksUpdate: (tasks: Task[]) => void
) => {
  const taskInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (taskInputRefs.current.length > 0 && isOpen && isChecklist) {
      const lastIndex = tasks.length - 1;
      taskInputRefs.current[lastIndex]?.focus();
    }
  }, [tasks.length, isOpen, isChecklist]);

  const toggleTaskCompletion = (taskId: string) => {
    const updatedTasks = tasks.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    onTasksUpdate(updatedTasks);
  };

  const handleTaskKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const newTasks = [...tasks];
      newTasks.splice(index + 1, 0, {
        id: Date.now().toString(),
        text: "",
        completed: false
      });
      onTasksUpdate(newTasks);
    } else if (
      e.key === "Backspace" &&
      (e.target as HTMLInputElement).value === "" &&
      tasks.length > 1
    ) {
      e.preventDefault();
      const newTasks = tasks.filter((_, i) => i !== index);
      onTasksUpdate(newTasks);

      if (index > 0) {
        setTimeout(() => {
          taskInputRefs.current[index - 1]?.focus();
        }, 0);
      }
    }
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const reordered = Array.from(tasks);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    onTasksUpdate(reordered);
  };

  return {
    taskInputRefs,
    toggleTaskCompletion,
    handleTaskKeyDown,
    handleDragEnd
  };
};
