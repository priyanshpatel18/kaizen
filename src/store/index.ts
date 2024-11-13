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

interface ProjectState {
  loading: boolean;
  setLoading: (loading: boolean) => void;

  projects: Project[];
  setProjects: (projects: Project[]) => void;

  fetchProjectData: () => Promise<Project[] | null>;

  taskComboBox: TaskComboBox[];
  setTaskComboBox: (taskComboBox: TaskComboBox[]) => void;

  workspaces: Workspace[];
  setWorkspaces: (workspaces: Workspace[]) => void;

  fetchWorkspaceData: () => Promise<Workspace[] | null>;
}

export const useStore = create<ProjectState>((set) => ({
  loading: false,
  setLoading: (loading: boolean) => set({ loading }),

  projects: [],
  setProjects: (projects: Project[]) => set({ projects }),

  fetchProjectData: async () => {
    set({ loading: true });
    console.log("Fetching project data...");

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
        projects.forEach((project) => {
          project.categories.forEach((category) => {
            set((state) => {
              const newTaskComboBox = [
                ...state.taskComboBox,
                {
                  projectId: project.id,
                  projectName: project.name,
                  categoryId: category.id,
                  categoryName: category.name,
                },
              ];

              return { taskComboBox: newTaskComboBox };
            });
          });
        });

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

  taskComboBox: [],
  setTaskComboBox: (taskComboBox: TaskComboBox[]) => set({ taskComboBox }),

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
        return null
      }

      const workspaces = data.workspaces as Workspace[];

      if (workspaces) {
        set({ workspaces });
        return workspaces;
      }

      return null;
    }
    catch (error) {
      console.error("Error fetching workspace data:", error);
      return null;
    } finally {
      set({ loading: false });
    }
  }
}));
