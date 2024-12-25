import { Category } from "@/store/category";
import { Workspace } from "@/store/workspace";
import { create } from "zustand";

export interface Project {
  id: string;
  name: string;
  isDefault: boolean;
  categoryIds: string[];
  workspaceId: string;
  categories?: Category[];
  workspace?: Workspace;
}

interface ProjectState {
  projects: Project[];
  setProjects: (projects: Project[]) => void;
}

export const useProjectStore = create<ProjectState>((set) => ({
  projects: [],
  setProjects: (projects: Project[]) => set({ projects }),
}));
