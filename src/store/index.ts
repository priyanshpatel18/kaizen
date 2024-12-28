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
  name: string;
  projectId: string;
  tasks: Task[];
}

export interface Project {
  id?: string;
  name?: string;
  userId?: string;
  categories: Category[];
  workspaceId?: string;
}

export interface UserWorkspace {
  id: string;
  userId: string;
  workspaceId: string;
}

export interface Workspace {
  id: string;
  name: string;
  projects: Project[];
  userWorkspaces: UserWorkspace[];
  isDefault: boolean;
}

export interface TaskComboBox {
  projectName?: string;
  projectId?: string;
  categoryName: string;
  categoryId: string;
}

export interface Option {
  value: string;
  label: string;
}

export interface ViewOption {
  route: string;
  view: "list" | "board";
}

interface ProjectState {
  loading: boolean;
  setLoading: (loading: boolean) => void;

  projects: Project[];
  setProjects: (projects: Project[]) => void;

  fetchProjectData: () => Promise<Project[] | null>;

  workspaces: Workspace[];
  setWorkspaces: (workspaces: Workspace[]) => void;

  fetchWorkspaceData: () => Promise<Workspace[] | null>;

  viewOptions: ViewOption[];
  setViewOptions: (viewOptions: ViewOption[]) => void;
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

  workspaces: [],
  setWorkspaces: (workspaces: Workspace[]) => set({ workspaces }),

  fetchWorkspaceData: async () => {
    set({ loading: true });

    try {
      const res = await fetch("/api/workspace/get-workspaces", {
        method: "GET",
      });

      const data = await res.json();
      if (!res.ok) {
        return null;
      }

      const workspaces = data.workspaces as Workspace[];

      if (workspaces) {
        set({ workspaces });
        return workspaces;
      }

      return null;
    } catch (error) {
      console.error("Error fetching workspace data:", error);
      return null;
    } finally {
      set({ loading: false });
    }
  },

  viewOptions: JSON.parse(localStorage.getItem("view_options") || "[]"),
  setViewOptions: (viewOptions) => {
    set({ viewOptions });
    localStorage.setItem("view_options", JSON.stringify(viewOptions));
  },
}));
