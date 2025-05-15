import { useRef } from "react";

interface Task {
  id: string;
  text: string;
  completed: boolean;
}

type TaskSetter = React.Dispatch<React.SetStateAction<Task[]>>;

export const useTasks = () => {
  const taskInputRefs = useRef<HTMLInputElement[]>([]);

  const handleTaskTextChange = (tasks: Task[], setTasks: TaskSetter) => 
    (taskId: string, text: string): void => {
      const updatedTasks = tasks.map((task) =>
        task.id === taskId ? { ...task, text } : task
      );
      setTasks(updatedTasks);
    };

  const handleTaskKeyDown = (tasks: Task[], setTasks: TaskSetter) => 
    (e: React.KeyboardEvent<HTMLInputElement>, index: number): void => {
      if (e.key === "Enter") {
        e.preventDefault();
        const newTask: Task = {
          id: Date.now().toString(),
          text: "",
          completed: false,
        };
        const updatedTasks = [...tasks];
        updatedTasks.splice(index + 1, 0, newTask);
        setTasks(updatedTasks);

        setTimeout(() => {
          taskInputRefs.current[index + 1]?.focus();
        }, 0);
      }
    };

  return {
    taskInputRefs,
    handleTaskTextChange,
    handleTaskKeyDown,
  };
};
