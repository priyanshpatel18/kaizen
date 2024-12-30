import { Category } from "@/store/category";
import { create } from "zustand";

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: number;
  position: number;
  categoryId: string;
  dueDate: Date | string;
  projectId?: string;
  category?: Category;
}

interface TaskState {
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
}

export const useTaskStore = create<TaskState>((set) => ({
  tasks: [],
  setTasks: (tasks) => set({ tasks }),
}));
