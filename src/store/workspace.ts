import { Category } from "@/store/category";
import { Project } from "@/store/project";
import { Task } from "@/store/task";
import { User } from "@/store/user";
import { toast } from "sonner";
import { create } from "zustand";

export interface Workspace {
  id: string;
  name: string;
  isDefault: boolean;
  projects: Project[];
  user: User;
}

interface FetchProps {
  setTasks: (tasks: Task[]) => void;
  setCategories: (categories: Category[]) => void;
  setProjects: (projects: Project[]) => void;
  setWorkspaces: (workspaces: Workspace[]) => void;
}
interface WorkspaceState {
  workspaces: Workspace[];
  setWorkspaces: (workspaces: Workspace[]) => void;

  fetchWorkspaceData: () => Promise<Workspace[] | null>;

  fetchAllData: ({ setTasks, setCategories, setProjects, setWorkspaces }: FetchProps) => void;
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  workspaces: [],
  setWorkspaces: (workspaces: Workspace[]) => set({ workspaces }),

  fetchWorkspaceData: async () => {
    try {
      const response = await fetch("/api/workspace/get-workspaces", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        console.error("Failed to fetch workspaces:", response.statusText);
        return null;
      }

      const { workspaces } = await response.json();

      if (!workspaces) {
        return null;
      }

      set({ workspaces });

      return workspaces;
    } catch (error) {
      console.log(error);
      return null;
    }
  },

  fetchAllData: async ({ setTasks, setCategories, setProjects, setWorkspaces }) => {
    try {
      const response = await fetch("/api/workspace/get-workspaces", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        toast.error("Something went wrong, Refresh the page");
        console.error("Failed to fetch workspaces:", response.statusText);
        return;
      }

      const { workspaces } = await response.json();

      if (!workspaces) {
        toast.error("Failed to fetch data, Please Refresh the page");
        return;
      }

      const allProjects: Project[] = [];
      const allCategories: Category[] = [];
      const allTasks: Task[] = [];

      workspaces.forEach((ws: Workspace) => {
        ws.projects.forEach((project) => {
          allProjects.push(project);

          project.categories.forEach((category) => {
            allCategories.push(category);

            category.tasks.forEach((task) => {
              allTasks.push(task);
            });
          });
        });
      });

      setTasks(allTasks);
      setCategories(allCategories);
      setProjects(allProjects);
      setWorkspaces(workspaces);
    } catch (error) {
      console.log(error);
    }
  },
}));
