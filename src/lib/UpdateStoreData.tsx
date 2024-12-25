import { Category, useCategoryStore } from "@/store/category";
import { Project, useProjectStore } from "@/store/project";
import { Task, useTaskStore } from "@/store/task";
import { Workspace, useWorkspaceStore } from "@/store/workspace";
import { useEffect } from "react";

interface UseUpdateDataProps {
  data: Task | Category | Project | Workspace | undefined;
  type: "task" | "category" | "project" | "workspace";
  action: "create" | "update" | "delete";
}

export default function UpdateStoreData({ data, type, action }: UseUpdateDataProps) {
  const { tasks, setTasks } = useTaskStore();
  const { categories, setCategories } = useCategoryStore();
  const { projects, setProjects } = useProjectStore();
  const { workspaces, setWorkspaces } = useWorkspaceStore();

  function updateData() {
    switch (type) {
      case "task":
        if (isTask(data)) {
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
        if (isCategory(data)) {
          handleCategoryAction(data, action, {
            categories,
            projects,
            workspaces,
            setCategories,
            setProjects,
            setWorkspaces,
          });
        } else {
          console.error("Data is not a valid Category");
        }
        break;

      case "project":
        if (isProject(data)) {
          handleProjectAction(data, action, { projects, workspaces, setProjects, setWorkspaces });
        } else {
          console.error("Data is not a valid Project");
        }
        break;

      case "workspace":
        if (isWorkspace(data)) {
          handleWorkspaceAction(data, action, { workspaces, setWorkspaces });
        } else {
          console.error("Data is not a valid Workspace");
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
  const { tasks, categories, projects, workspaces, setTasks, setCategories, setProjects, setWorkspaces } = stores;

  switch (action) {
    case "create":
      try {
        const newTasks = [...tasks, data];
        setTasks(newTasks);

        const updatedCategories = updateNestedEntity(
          categories,
          (category) => category.id === data.categoryId,
          (category) => ({
            ...category,
            taskIds: [...category.taskIds, data.id],
          })
        );
        setCategories(updatedCategories);

        updateProjectAndWorkspaceAfterCategoryUpdate(
          data.categoryId,
          updatedCategories,
          projects,
          workspaces,
          setProjects,
          setWorkspaces
        );
        return true;
      } catch (error) {
        console.error("Error handling task create action:", error);
        return false;
      }

    case "update":
      try {
        const modifiedTasks = updateNestedEntity(
          tasks,
          (task) => task.id === data.id,
          () => data
        );
        setTasks(modifiedTasks);
        return true;
      } catch (error) {
        console.error("Error handling task update action:", error);
        return false;
      }

    case "delete":
      try {
        const remainingTasks = tasks.filter((task) => task.id !== data.id);
        setTasks(remainingTasks);

        const updatedCategoriesAfterTaskDeletion = updateNestedEntity(
          categories,
          (category) => category.id === data.categoryId,
          (category) => ({
            ...category,
            taskIds: category.taskIds.filter((id) => id !== data.id),
          })
        );
        setCategories(updatedCategoriesAfterTaskDeletion);

        updateProjectAndWorkspaceAfterCategoryUpdate(
          data.categoryId,
          updatedCategoriesAfterTaskDeletion,
          projects,
          workspaces,
          setProjects,
          setWorkspaces
        );
        return true;
      } catch (error) {
        console.error("Error handling task delete action:", error);
        return false;
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
    workspaces: Workspace[];
    setCategories: (categories: Category[]) => void;
    setProjects: (projects: Project[]) => void;
    setWorkspaces: (workspaces: Workspace[]) => void;
  }
): boolean {
  const { categories, projects, workspaces, setCategories, setProjects, setWorkspaces } = stores;

  switch (action) {
    case "create":
      try {
        const newCategories = [...categories, data];
        setCategories(newCategories);

        updateProjectAndWorkspaceAfterCategoryUpdate(
          data.id,
          newCategories,
          projects,
          workspaces,
          setProjects,
          setWorkspaces
        );
        return true;
      } catch (error) {
        console.error("Error handling category create action:", error);
        return false;
      }

    case "update":
      try {
        const modifiedCategories = updateNestedEntity(
          categories,
          (category) => category.id === data.id,
          () => data
        );
        setCategories(modifiedCategories);
        return true;
      } catch (error) {
        console.error("Error handling category update action:", error);
        return false;
      }

    case "delete":
      try {
        const remainingCategories = categories.filter((category) => category.id !== data.id);
        setCategories(remainingCategories);

        updateProjectAndWorkspaceAfterCategoryUpdate(
          data.id,
          remainingCategories,
          projects,
          workspaces,
          setProjects,
          setWorkspaces
        );
        return true;
      } catch (error) {
        console.error("Error handling category delete action:", error);
        return false;
      }
  }
}

// ======= Handle Project Actions =======
function handleProjectAction(
  data: Project,
  action: "create" | "update" | "delete",
  stores: {
    projects: Project[];
    workspaces: Workspace[];
    setProjects: (projects: Project[]) => void;
    setWorkspaces: (workspaces: Workspace[]) => void;
  }
): boolean {
  const { projects, workspaces, setProjects, setWorkspaces } = stores;

  switch (action) {
    case "create":
      try {
        const newProjects = [...projects, data];
        setProjects(newProjects);

        updateWorkspaceAfterProjectUpdate(data.workspaceId, newProjects, workspaces, setWorkspaces);
        return true;
      } catch (error) {
        console.error("Error handling project create action:", error);
        return false;
      }

    case "update":
      try {
        const modifiedProjects = updateNestedEntity(
          projects,
          (project) => project.id === data.id,
          () => data
        );
        setProjects(modifiedProjects);
        return true;
      } catch (error) {
        console.error("Error handling project update action:", error);
        return false;
      }

    case "delete":
      try {
        const remainingProjects = projects.filter((project) => project.id !== data.id);
        setProjects(remainingProjects);

        updateWorkspaceAfterProjectUpdate(data.workspaceId, remainingProjects, workspaces, setWorkspaces);
        return true;
      } catch (error) {
        console.error("Error handling project delete action:", error);
        return false;
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
): boolean {
  const { workspaces, setWorkspaces } = stores;

  switch (action) {
    case "create":
      try {
        setWorkspaces([...workspaces, data]);
        return true;
      } catch (error) {
        console.error("Error handling workspace create action:", error);
        return false;
      }

    case "update":
      try {
        const modifiedWorkspaces = updateNestedEntity(
          workspaces,
          (workspace) => workspace.id === data.id,
          () => data
        );
        setWorkspaces(modifiedWorkspaces);
        return true;
      } catch (error) {
        console.error("Error handling workspace update action:", error);
        return false;
      }

    case "delete":
      try {
        const remainingWorkspaces = workspaces.filter((workspace) => workspace.id !== data.id);
        setWorkspaces(remainingWorkspaces);
        return true;
      } catch (error) {
        console.error("Error handling workspace delete action:", error);
        return false;
      }
  }
}

// ======= Utility Functions =======
function updateNestedEntity<T>(entities: T[], condition: (entity: T) => boolean, updater: (entity: T) => T): T[] {
  return entities.map((entity) => (condition(entity) ? updater(entity) : entity));
}

function updateProjectAndWorkspaceAfterCategoryUpdate(
  categoryId: string,
  updatedCategories: Category[],
  projects: Project[],
  workspaces: Workspace[],
  setProjects: (projects: Project[]) => void,
  setWorkspaces: (workspaces: Workspace[]) => void
) {
  const category = updatedCategories.find((c) => c.id === categoryId);
  const updatedProjects = updateNestedEntity(
    projects,
    (project) => project.id === category?.projectId,
    (project) => ({
      ...project,
      categories: updatedCategories,
    })
  );
  setProjects(updatedProjects);

  const project = updatedProjects.find((p) => p.id === category?.projectId);
  const updatedWorkspaces = updateNestedEntity(
    workspaces,
    (workspace) => workspace.id === project?.workspaceId,
    (workspace) => ({
      ...workspace,
      projects: updatedProjects,
    })
  );
  setWorkspaces(updatedWorkspaces);
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
  return data && typeof data.id === "string" && typeof data.user === "object";
}
