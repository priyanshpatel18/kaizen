import { Project, useStore } from "@/store";
import { extractClosestEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import { getReorderDestinationIndex } from "@atlaskit/pragmatic-drag-and-drop-hitbox/util/get-reorder-destination-index";
import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { reorder } from "@atlaskit/pragmatic-drag-and-drop/reorder";
import { ReactNode, useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import CategoryComponent from "../Category";

interface HandleDropProps {
  source: {
    data: {
      type: string;
      taskId?: string;
      categoryId?: string;
    };
    element: ReactNode;
  };
  location: any;
}

interface ReorderTaskProps {
  categoryId: string;
  startIndex: number;
  finishIndex: number;
  taskId: string;
}

interface MoveTaskProps {
  sourceIndex: number;
  sourceCategoryId: string;
  destinationIndex: number;
  destinationCategoryId: string;
}

interface ReorderCategoryProps {
  sourceIndex: number | undefined;
  destinationIndex: number | undefined;
  sourceCategoryId: string;
  destinationCategoryId: string;
}

interface IProps {
  selectedProject: Project | null;
}

export default function Main({ selectedProject }: IProps) {
  const store = useStore();
  const [projects, setProjects] = useState<Project[] | null>(null);

  const reorderCategory = useCallback(
    async ({
      sourceIndex,
      destinationIndex,
      sourceCategoryId,
      destinationCategoryId,
    }: ReorderCategoryProps) => {
      if (sourceIndex === undefined || destinationIndex === undefined) return;

      if (!selectedProject) {
        console.error("Invalid project ID");
        return;
      }

      const updatedCategories = reorder({
        list: selectedProject.categories,
        startIndex: sourceIndex,
        finishIndex: destinationIndex,
      });

      const updatedProject = {
        ...selectedProject,
        categories: updatedCategories,
      };

      // Send request to database
      
      // Update the project in the projectsData state
      const updatedProjects = projects?.map((project) => {
        if (project.id === selectedProject.id) {
          return updatedProject;
        }
        return project;
      });

      setProjects(updatedProjects || []);
      store.setProjects(updatedProjects || []);
    },
    [store.projects]
  );

  const moveTask = useCallback(
    async ({
      sourceIndex,
      sourceCategoryId,
      destinationIndex,
      destinationCategoryId,
    }: MoveTaskProps) => {
      // Ensure source and destination categories exist
      if (!selectedProject) return;

      const sourceCategoryData = selectedProject?.categories.find(
        (category) => category.id === sourceCategoryId
      );
      const destinationCategoryData = selectedProject?.categories.find(
        (category) => category.id === destinationCategoryId
      );

      if (!sourceCategoryData || !destinationCategoryData) {
        console.error("Invalid source or destination category ID");
        return;
      }

      // Ensure the task index in source category is valid
      if (sourceIndex < 0 || sourceIndex >= sourceCategoryData.tasks.length) {
        console.error("Invalid source task index");
        return;
      }

      // Extract the task to move
      const task = sourceCategoryData.tasks[sourceIndex];

      // Remove the task from the source category
      const updatedSourceTasks = [
        ...sourceCategoryData.tasks.splice(sourceIndex, 1),
      ];

      // Insert the task into the destination category at the specified index
      const updatedDestinationTasks = [
        ...destinationCategoryData.tasks.splice(destinationIndex, 0, task),
      ];

      // Update the state with the modified source and destination categories
      const newData = selectedProject?.categories.map((category) => {
        if (category.id === sourceCategoryId) {
          return {
            ...category,
            tasks: updatedSourceTasks,
          };
        }
        if (category.id === destinationCategoryId) {
          return {
            ...category,
            tasks: updatedDestinationTasks,
          };
        }
        return category;
      });

      const isLast = destinationCategoryData.tasks.length === destinationIndex;

      if (newData) {
        // Send request to database
      }

      const updatedProjects = projects?.map((project) => {
        if (project.id === selectedProject.id) {
          return {
            ...project,
            categories: newData || [],
          };
        }
        return project;
      });

      setProjects(updatedProjects || []);
      store.setProjects(updatedProjects || []);
    },
    [store.projects, selectedProject]
  );

  const reorderTask = useCallback(
    ({ categoryId, startIndex, finishIndex, taskId }: ReorderTaskProps) => {
      // Ensure the startIndex and finishIndex are different; no need to reorder if they’re the same
      if (startIndex === finishIndex) return;

      // Find the source category by ID
      const sourceCategoryData = selectedProject?.categories.find(
        (category) => category.id === categoryId
      );

      if (sourceCategoryData) {
        const updatedItems = reorder({
          list: sourceCategoryData.tasks,
          startIndex,
          finishIndex,
        });

        const updatedSourceCategory = {
          ...sourceCategoryData,
          tasks: updatedItems,
        };

        // Logic to update the state
        const newData = selectedProject?.categories.map((category) => {
          if (category.id === categoryId) {
            return updatedSourceCategory;
          }
          return category;
        });

        // Send request to database
        if (
          selectedProject?.categories.find(
            (category) => category.id === categoryId
          )
        ) {
          // Send request to database
        }

        const updatedProjects = projects?.map((project) => {
          if (project.id === selectedProject?.id) {
            return {
              ...project,
              categories: newData || [],
            };
          }
          return project;
        });

        setProjects(updatedProjects || []);
        // store.setProjects(updatedProjects || []);
      }
    },
    [store.projects]
  );

  const handleDrop = useCallback(
    ({ source, location }: HandleDropProps) => {
      // Early return if there are no drop targets in the current location
      const destination = location.current.dropTargets.length;
      if (!destination || !selectedProject) return;

      if (source.data.type === "task" && source.data.taskId) {
        // Retrieve the ID of the task being dragged
        const draggedTaskId = source.data.taskId;

        // Get the source category from the initial drop targets
        const [, sourceCategoryRecord] = location.initial.dropTargets;

        // Retrieve the ID of the source category
        const sourceCategoryId = sourceCategoryRecord.data.categoryId;

        // Get the data of the source category
        const sourceCategoryData = selectedProject?.categories.find(
          (category) => category.id === sourceCategoryId
        );

        // Get the index of the task in the source category
        const indexOfSource = sourceCategoryData?.tasks.findIndex(
          (task) => task.id === draggedTaskId
        );

        if (location.current.dropTargets.length === 1) {
          // Tasks are dropped in the different categories
          const [destinationCategoryRecord] = location.current.dropTargets;

          // Retrieve the ID of the destination category
          const destinationCategoryId =
            destinationCategoryRecord.data.categoryId;

          // Check if the source and destination categories are the same
          if (sourceCategoryId === destinationCategoryId) {
            const destinationIndex = getReorderDestinationIndex({
              startIndex: indexOfSource!,
              indexOfTarget:
                selectedProject?.categories.findIndex(
                  (category) => category.id === destinationCategoryId
                )! - 1,
              closestEdgeOfTarget: null,
              axis: "vertical",
            });

            reorderTask({
              categoryId: sourceCategoryId,
              startIndex: indexOfSource!,
              finishIndex: destinationIndex,
              taskId: draggedTaskId,
            });
            return;
          }

          const destinationCategory = selectedProject?.categories.find(
            (category) => category.id === destinationCategoryId
          );

          // Dropped in the empty space in the category
          const destinationIndex = getReorderDestinationIndex({
            startIndex: indexOfSource!,
            indexOfTarget: Number(destinationCategory?.tasks.length) || -1,
            closestEdgeOfTarget: null,
            axis: "vertical",
          });

          moveTask({
            sourceIndex: indexOfSource!,
            sourceCategoryId,
            destinationIndex,
            destinationCategoryId,
          });
        }
        if (location.current.dropTargets.length === 2) {
          const [destinationTaskRecord, destinationCategoryRecord] =
            location.current.dropTargets;

          // Retrieve the ID of the destination category
          const destinationCategoryId =
            destinationCategoryRecord.data.categoryId;

          // Retrieve the destination category data using the destination category ID
          const destinationCategory = selectedProject?.categories.find(
            (category) => category.id === destinationCategoryId
          );

          if (destinationCategory) {
            // Find the index of the target task within the destination category's tasks
            const indexOfTarget = destinationCategory.tasks.findIndex(
              (task) => task.id === destinationTaskRecord.data.taskId
            );

            // Determine the closest edge of the target task: top or bottom
            const closestEdgeOfTarget = extractClosestEdge(
              destinationCategoryRecord.data
            );
            if (sourceCategoryId === destinationCategoryId) {
              const destinationIndex = getReorderDestinationIndex({
                startIndex: indexOfSource!,
                indexOfTarget,
                closestEdgeOfTarget,
                axis: "vertical",
              });

              reorderTask({
                categoryId: sourceCategoryId,
                startIndex: indexOfSource!,
                finishIndex: destinationIndex,
                taskId: draggedTaskId,
              });
              return;
            }

            const destinationIndex =
              closestEdgeOfTarget === "bottom"
                ? indexOfTarget + 1
                : indexOfTarget;

            moveTask({
              sourceIndex: indexOfSource!,
              sourceCategoryId,
              destinationIndex,
              destinationCategoryId,
            });
          }
        }
      }

      if (source.data.type === "category" && source.data.categoryId) {
        const sourceIndex = selectedProject?.categories.findIndex(
          (category) => category.id === source.data.categoryId
        );

        const destinationIndex = selectedProject?.categories.findIndex(
          (category) =>
            category.id === location.current.dropTargets[0].data.categoryId
        );

        if (sourceIndex !== -1 && destinationIndex !== -1) {
          reorderCategory({
            sourceIndex,
            destinationIndex,
            sourceCategoryId: source.data.categoryId,
            destinationCategoryId:
              location.current.dropTargets[0].data.categoryId,
          });
        }
      }
    },
    [selectedProject, reorderTask]
  );

  async function changePosition(
    sourceCategoryId: string,
    destinationCategoryId: string,
    newPosition: number,
    isCategoryUpdated?: boolean,
    taskId?: string
  ) {
    if (!selectedProject) {
      return toast.error("Something went wrong");
    }

    try {
      const res = await fetch(
        `/api/${isCategoryUpdated ? "category" : "task"}/update-position`,
        {
          method: "PUT",
          body: JSON.stringify({
            projectId: selectedProject.id,
            sourceCategoryId,
            destinationCategoryId,
            taskId,
            newPosition,
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        return toast.error(data.message);
      }
    } catch (error) {
      return toast.error("Something went wrong");
    }
  }

  useEffect(() => {
    return monitorForElements({
      // @ts-ignore
      onDrop: handleDrop,
    });
  }, [handleDrop]);

  useEffect(() => {
    if (store.projects.length > 0) {
      setProjects(store.projects);
    }
  }, [store.projects]);

  return (
    <div>
      <div className="flex gap-6">
        {selectedProject &&
          selectedProject.categories.map((category, index) => (
            <CategoryComponent
              key={index}
              category={category}
              project={selectedProject}
            />
          ))}
      </div>
    </div>
  );
}
