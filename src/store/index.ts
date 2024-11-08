import { create } from "zustand";

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: number;
  isCompleted: boolean;
  categoryId: string;
}

export interface Category {
  id: string;
  title: string;
  projectId: string;
  tasks: Task[];
}

export interface Project {
  id: string;
  name: string;
  userId: string;
  categories: Category[];
}

interface ProjectState {
  loading: boolean;
  setLoading: (loading: boolean) => void;

  projects: Project[];
  setProjects: (projects: Project[]) => void;

  fetchProjectData: () => Promise<Project[] | null>;
}

export const useStore = create<ProjectState>((set) => ({
  loading: false,
  setLoading: (loading: boolean) => set({ loading }),

  projects: [],
  setProjects: (projects: Project[]) => set({ projects }),

  fetchProjectData: async () => {
    set({ loading: true });

    try {
      const res = await fetch("/api/project/get-projects", {
        method: "GET",
      });

      if (!res.ok) {
        console.error("Failed to fetch projects:", res.statusText);
        return null;
      }

      const data = await res.json();
      const projects = data.projects as Project[];

      if (projects) {
        set({ projects });
      }
      return projects;
    } catch (error) {
      console.error("Error fetching project data:", error);
      return null;
    } finally {
      set({ loading: false });
    }
  },
}));
