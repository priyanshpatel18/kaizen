import { Category, useCategoryStore } from "@/store/category";
import { Project, useProjectStore } from "@/store/project";
import { Task, useTaskStore } from "@/store/task";
import { Workspace, useWorkspaceStore } from "@/store/workspace";
import { useEffect } from "react";

export type MultiStoreUpdate = {
  type: "task" | "category" | "project" | "workspace";
  action: "create" | "update" | "delete";
  data: Task | Category | Project | Workspace;
};

export interface UpdateDataProps {
  data: Task | Category | Project | Workspace | MultiStoreUpdate[] | undefined;
  type: "task" | "category" | "project" | "workspace" | "multi";
  action: "create" | "update" | "delete" | undefined;
}

export default function UpdateStoreData({ data, type, action }: UpdateDataProps) {
  const { tasks, setTasks } = useTaskStore();
  const { categories, setCategories } = useCategoryStore();
  const { projects, setProjects } = useProjectStore();
  const { workspaces, setWorkspaces } = useWorkspaceStore();

  function updateData() {
    switch (type) {
      case "task":
        if (isTask(data) && action) {
          handleTaskAction(data, action, {
            tasks,
            categories,
            projects,
            workspaces,
            setTasks,
            setCategories,
            setProjects,
            setWorkspaces,
          });
        } else {
          console.error("Data is not a valid Task");
        }
        break;

      case "category":
        if (isCategory(data) && action) {
          handleCategoryAction(data, action, {
            categories,
            projects,
            setCategories,
            setProjects,
          });
        } else {
          console.error("Data is not a valid Category");
        }
        break;

      case "project":
        if (isProject(data) && action) {
          handleProjectAction(data, action, {
            projects,
            workspaces,
            setProjects,
            setWorkspaces,
            categories,
            setCategories,
          });
        } else {
          console.error("Data is not a valid Project");
        }
        break;

      case "workspace":
        if (isWorkspace(data) && action) {
          handleWorkspaceAction(data, action, { workspaces, setWorkspaces });
        } else {
          console.error("Data is not a valid Workspace");
        }
        break;

      case "multi":
        if (Array.isArray(data)) {
          handleMultipleUpdates(data, {
            tasks,
            categories,
            projects,
            workspaces,
            setTasks,
            setCategories,
            setProjects,
            setWorkspaces,
          });
        } else {
          console.error("Data is not multi update data");
        }
        break;

      default:
        console.error("Invalid type provided");
        break;
    }
  }

  useEffect(() => {
    if (data === undefined) {
      return;
    }
    updateData();
  }, [data, action]);

  return <></>;
}

// ======= Handle Task Actions =======
function handleTaskAction(
  data: Task,
  action: "create" | "update" | "delete",
  stores: {
    tasks: Task[];
    categories: Category[];
    projects: Project[];
    workspaces: Workspace[];
    setTasks: (tasks: Task[]) => void;
    setCategories: (categories: Category[]) => void;
    setProjects: (projects: Project[]) => void;
    setWorkspaces: (workspaces: Workspace[]) => void;
  }
) {
  const { tasks, categories, setTasks, setCategories } = stores;

  // Fetching ProjectId to store in the Task State
  const category = categories.find((c) => c.id === data.categoryId);
  const projectId = category ? category.projectId : null;

  if (!projectId) {
    console.error("Unable to set projectId: Missing both projectId and valid category.");
    return;
  }

  // Adding ProjectId to data
  const taskWithProjectId: Task = { ...data, projectId };

  switch (action) {
    case "create":
      try {
        const newTasks: Task[] = [...tasks, taskWithProjectId];
        setTasks(newTasks);

        const updatedCategories = updateNestedEntity(
          categories,
          (category) => category.id === taskWithProjectId.categoryId,
          (category) => ({
            ...category,
            taskIds: [...(category.taskIds || []), taskWithProjectId.id],
          })
        );

        setCategories(updatedCategories);
        break;
      } catch (error) {
        console.error("Error handling task create action:", error);
      }
    case "update":
      try {
        const updatedTasks = tasks.map((task) =>
          task.id === taskWithProjectId.id ? { ...task, ...taskWithProjectId } : task
        );

        const sortedCategories = categories.map((category) => ({
          ...category,
          taskIds: sortTaskIds(category.taskIds, updatedTasks),
        }));

        setCategories(sortedCategories);
        setTasks(updatedTasks);
        break;
      } catch (error) {
        console.error("Error handling task update action:", error);
        break;
      }

    case "delete":
      try {
        const remainingTasks = tasks.filter((task) => task.id !== taskWithProjectId.id);
        setTasks(remainingTasks);

        const updatedCategoriesAfterTaskDeletion = updateNestedEntity(
          categories,
          (category) => category.id === taskWithProjectId.categoryId,
          (category) => ({
            ...category,
            taskIds: category.taskIds.filter((id) => id !== taskWithProjectId.id),
          })
        );
        setCategories(updatedCategoriesAfterTaskDeletion);
        break;
      } catch (error) {
        console.error("Error handling task delete action:", error);
        break;
      }
  }
}

// ======= Handle Category Actions =======
function handleCategoryAction(
  data: Category,
  action: "create" | "update" | "delete",
  stores: {
    categories: Category[];
    projects: Project[];
    setCategories: (categories: Category[]) => void;
    setProjects: (projects: Project[]) => void;
  }
) {
  const { categories, projects, setCategories, setProjects } = stores;

  switch (action) {
    case "create":
      try {
        // Add the new category
        const newCategories = [...categories, data];
        setCategories(newCategories);

        // Update the associated project with the new category
        const updatedProjects = updateNestedEntity(
          projects,
          (project) => project.id === data.projectId,
          (project) => ({
            ...project,
            categoryIds: [...(project.categoryIds || []), data.id],
          })
        );
        setProjects(updatedProjects);

        break;
      } catch (error) {
        console.error("Error handling category create action:", error);
        break;
      }

    case "update":
      try {
        // Update only the specific category
        const updatedCategories: Category[] = updateNestedEntity(
          categories,
          (category) => category.id === data.id,
          () => data
        );

        setCategories(updatedCategories);
        break;
      } catch (error) {
        console.error("Error handling category update action:", error);
        break;
      }

    case "delete":
      try {
        // Remove the category
        const remainingCategories = categories.filter((category) => category.id !== data.id);
        setCategories(remainingCategories);

        // Update the associated project by removing the category ID
        const updatedProjects = updateNestedEntity(
          projects,
          (project) => project.id === data.projectId,
          (project) => ({
            ...project,
            categoryIds: project.categoryIds.filter((id) => id !== data.id),
          })
        );
        setProjects(updatedProjects);

        break;
      } catch (error) {
        console.error("Error handling category delete action:", error);
        break;
      }

    default:
      console.error("Invalid action type for category");
      break;
  }
}

// ======= Handle Project Actions =======
function handleProjectAction(
  data: Project,
  action: "create" | "update" | "delete",
  stores: {
    categories: Category[];
    setCategories: (categories: Category[]) => void;
    projects: Project[];
    workspaces: Workspace[];
    setProjects: (projects: Project[]) => void;
    setWorkspaces: (workspaces: Workspace[]) => void;
  }
) {
  const { projects, workspaces, setProjects, setWorkspaces, categories, setCategories } = stores;

  switch (action) {
    case "create":
      try {
        const newProjects = [...projects, data];
        setProjects(newProjects);

        if (data.categories) {
          const updatedCategories = [
            ...categories,
            ...(data.categories.map((c) => ({ ...c, projectId: data.id })) || []),
          ];
          setCategories(updatedCategories);
        }

        updateWorkspaceAfterProjectUpdate(data.workspaceId, newProjects, workspaces, setWorkspaces);
        break;
      } catch (error) {
        console.error("Error handling project create action:", error);
        break;
      }

    case "update":
      try {
        const modifiedProjects = updateNestedEntity(
          projects,
          (project) => project.id === data.id,
          () => data
        );
        setProjects(modifiedProjects);
        break;
      } catch (error) {
        console.error("Error handling project update action:", error);
        break;
      }

    case "delete":
      try {
        const remainingProjects = projects.filter((project) => project.id !== data.id);
        setProjects(remainingProjects);

        updateWorkspaceAfterProjectUpdate(data.workspaceId, remainingProjects, workspaces, setWorkspaces);
        break;
      } catch (error) {
        console.error("Error handling project delete action:", error);
        break;
      }
  }
}

// ======= Handle Workspace Actions =======
function handleWorkspaceAction(
  data: Workspace,
  action: "create" | "update" | "delete",
  stores: {
    workspaces: Workspace[];
    setWorkspaces: (workspaces: Workspace[]) => void;
  }
) {
  const { workspaces, setWorkspaces } = stores;

  switch (action) {
    case "create":
      try {
        setWorkspaces([...workspaces, { ...data, projectIds: [] }]);
        break;
      } catch (error) {
        console.error("Error handling workspace create action:", error);
        break;
      }

    case "update":
      try {
        const modifiedWorkspaces = updateNestedEntity(
          workspaces,
          (workspace) => workspace.id === data.id,
          () => data
        );
        setWorkspaces(modifiedWorkspaces);
        break;
      } catch (error) {
        console.error("Error handling workspace update action:", error);
        break;
      }

    case "delete":
      try {
        const remainingWorkspaces = workspaces.filter((workspace) => workspace.id !== data.id);
        setWorkspaces(remainingWorkspaces);
        break;
      } catch (error) {
        console.error("Error handling workspace delete action:", error);
        break;
      }
  }
}

function handleMultipleUpdates(
  updates: MultiStoreUpdate[],
  stores: {
    tasks: Task[];
    categories: Category[];
    projects: Project[];
    workspaces: Workspace[];
    setTasks: (tasks: Task[]) => void;
    setCategories: (categories: Category[]) => void;
    setProjects: (projects: Project[]) => void;
    setWorkspaces: (workspaces: Workspace[]) => void;
  }
) {
  const taskUpdates: Task[] = [];
  const categoryUpdates: Category[] = [];

  updates.forEach((update) => {
    switch (update.type) {
      case "task":
        if (isTask(update.data)) {
          taskUpdates.push(update.data);
        }
        break;
      case "category":
        if (isCategory(update.data)) {
          categoryUpdates.push(update.data);
        }
        break;
    }
  });

  if (taskUpdates.length > 0) {
    const updatedTasks = stores.tasks.map((task) => {
      const update = taskUpdates.find((u) => u.id === task.id);
      return update ? { ...task, ...update } : task;
    });
    stores.setTasks(updatedTasks);
  }

  if (categoryUpdates.length > 0) {
    const updatedCategories = stores.categories.map((category) => {
      const update = categoryUpdates.find((u) => u.id === category.id);
      return update ? { ...category, ...update } : category;
    });
    stores.setCategories(updatedCategories);
  }
}

// ======= Utility Functions =======
function updateNestedEntity<T>(entities: T[], condition: (entity: T) => boolean, updater: (entity: T) => T): T[] {
  return entities.map((entity) => (condition(entity) ? updater(entity) : entity));
}

function updateWorkspaceAfterProjectUpdate(
  projectId: string,
  updatedProjects: Project[],
  workspaces: Workspace[],
  setWorkspaces: (workspaces: Workspace[]) => void
) {
  const updatedWorkspaces = updateNestedEntity(
    workspaces,
    (workspace) => workspace.projectIds.some((project) => project === projectId),
    (workspace) => ({
      ...workspace,
      projects: updatedProjects,
    })
  );

  setWorkspaces(updatedWorkspaces);
}

const sortTaskIds = (taskIds: string[], tasks: Task[]): string[] => {
  return taskIds
    .map((id) => tasks.find((task) => task.id === id))
    .filter((task): task is Task => task !== undefined)
    .sort((a, b) => a.position - b.position)
    .map((task) => task.id);
};

// ======= Type Guards =======
function isTask(data: any): data is Task {
  return data && typeof data.id === "string" && typeof data.categoryId === "string";
}

function isCategory(data: any): data is Category {
  return data && typeof data.id === "string" && typeof data.projectId === "string";
}

function isProject(data: any): data is Project {
  return data && typeof data.id === "string" && typeof data.workspaceId === "string";
}

function isWorkspace(data: any): data is Workspace {
  return data && typeof data.id === "string" && typeof data.name === "string";
}
