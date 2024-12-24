import { Project } from "@/store/project";
import { Task } from "@/store/task";
import { create } from "zustand";

export interface Category {
  id: string;
  name: string;
  position: number;
  projectId: string;
  tasks: Task[];
  project: Project;
}

interface CategoryState {
  categories: Category[];
  setCategories: (categories: Category[]) => void;
}

export const useCategoryStore = create<CategoryState>((set) => ({
  categories: [],
  setCategories: (categories: Category[]) => set({ categories }),
}));
