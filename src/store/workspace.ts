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
  projectIds: string[];
  projects?: Project[];
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
        ws.projects?.forEach((project: Project) => {
          // Add projects to allProjects
          const projectData: Project = {
            id: project.id,
            name: project.name,
            workspaceId: ws.id,
            isDefault: project.isDefault,
            isFavorite: project.isFavorite,
            categoryIds: project.categories?.map((category) => category.id) || [],
          };
          allProjects.push(projectData);

          project.categories?.forEach((category) => {
            // Add categories to allCategories
            const categoryData: Category = {
              id: category.id,
              name: category.name,
              projectId: project.id,
              position: category.position,
              isDefault: category.isDefault,
              taskIds: category.tasks?.map((task) => task.id) || [],
            };
            allCategories.push(categoryData);

            category.tasks?.forEach((task) => {
              // Add tasks to allTasks
              const taskData: Task = {
                id: task.id,
                title: task.title,
                description: task.description,
                categoryId: category.id,
                priority: task.priority,
                position: task.position,
                dueDate: task.dueDate,
                projectId: project.id,
              };
              allTasks.push(taskData);
            });
          });
        });
      });

      const updatedWorkspaces = workspaces.map((workspace: Workspace) => ({
        ...workspace,
        projectIds: workspace.projects?.map((project: Project) => project.id) || [],
      }));

      // Update the state with the fetched data
      setProjects(allProjects);
      setCategories(allCategories);
      setTasks(allTasks.sort((a, b) => a.position - b.position));
      setWorkspaces(updatedWorkspaces);
    } catch (error) {
      console.log(error);
      toast.error("An error occurred while fetching the data.");
    }
  },
}));
