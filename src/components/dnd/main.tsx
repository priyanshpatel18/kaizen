import { Project, useStore } from "@/store";
import { ReactNode, useCallback, useEffect, useState } from "react";
import CategoryComponent from "./Category";
import { extractClosestEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import { getReorderDestinationIndex } from "@atlaskit/pragmatic-drag-and-drop-hitbox/util/get-reorder-destination-index";
import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { reorder } from "@atlaskit/pragmatic-drag-and-drop/reorder";

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

interface IProps {
  selectedProject: Project | null;
}

export default function Main({ selectedProject }: IProps) {
  const store = useStore();
  const [projects, setProjects] = useState<Project[]>(store.projects);

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
        console.error("Invalid category IDs");
        return;
      }

      if (
        destinationIndex < 0 ||
        destinationIndex >= sourceCategoryData.tasks.length
      ) {
        console.error("Invalid card index in source column");
        return;
      }

      const task = sourceCategoryData.tasks[sourceIndex];

      const updatedSourceTasks = [
        ...sourceCategoryData.tasks.splice(sourceIndex, 1),
      ];

      const updatedDestinationTasks = [
        ...destinationCategoryData.tasks.splice(destinationIndex, 0, task),
      ];

      const newData = selectedProject.categories.map((category) => {
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

      const newProjectData = projects.map((project) => {
        if (project.id === selectedProject.id) {
          return {
            ...project,
            categories: newData || [],
          };
        }
        return project;
      });

      setProjects(newProjectData);
      store.setProjects(newProjectData);
    },
    [projects]
  );

  const reorderTask = useCallback(
    async ({ categoryId, startIndex, finishIndex }: ReorderTaskProps) => {
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

        const newData = selectedProject?.categories.map((category) => {
          if (category.id === updatedSourceCategory.id) {
            return updatedSourceCategory;
          }
          return category;
        });

        // Send request to database

        const updatedProjects = projects.map((project) => {
          if (project.id === selectedProject?.id) {
            return {
              ...project,
              categories: newData || [],
            };
          }
          return project;
        });

        setProjects(updatedProjects as Project[]);
        store.setProjects(updatedProjects as Project[]);
      }
    },
    [projects]
  );

  const handleDrop = useCallback(
    ({ location, source }: HandleDropProps) => {
      // Early return if there are no drop targets in the current location
      const destination = location.current.dropTargets.length;
      if (!destination) return;

      if (source.data.type === "task" && source.data.taskId) {
        // Retrieve the ID of the task being dragged
        const draggedTaskId = source.data.taskId;

        // Get the source from the initial drop targets
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

        // ALL SOURCE DATA EXTRACTED

        if (location.current.dropTargets.length === 1) {
          const [destinationCategoryRecord] = location.current.dropTargets;

          // Retrieve the ID of the destination category
          const destinationCategoryId =
            destinationCategoryRecord.data.categoryId;

          // Get the data of the destination category
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
              categoryId: destinationCategoryId,
              startIndex: indexOfSource!,
              finishIndex: destinationIndex,
              taskId: draggedTaskId,
            });
            return;
          }

          const destinationCategory = selectedProject?.categories.find(
            (category) => category.id === destinationCategoryId
          );

          const destinationIndex = getReorderDestinationIndex({
            startIndex: indexOfSource!,
            indexOfTarget: Number(destinationCategory?.tasks.length) || -1,
            closestEdgeOfTarget: null,
            axis: "vertical",
          });

          moveTask({
            sourceIndex: indexOfSource!,
            sourceCategoryId: sourceCategoryId,
            destinationIndex: destinationIndex,
            destinationCategoryId: destinationCategoryId,
          });
        }
        if (location.current.dropTargets.length === 2) {
          const [destinationTaskRecord, destinationCategoryRecord] =
            location.current.dropTargets;

          // Retrieve the ID of the destination
          const destinationCategoryId =
            destinationCategoryRecord.data.categoryId;

          // Retrieve the destination column data using the destination category ID
          const destinationCategory = selectedProject?.categories.find(
            (category) => category.id === destinationCategoryId
          );

          if (destinationCategory) {
            const indexOfTarget = destinationCategory.tasks.findIndex(
              (task) => task.id === destinationTaskRecord.data.taskId
            );

            const closestEdgeOfTarget = extractClosestEdge(
              destinationTaskRecord.data
            );

            if (sourceCategoryId === destinationCategoryId) {
              const destinationIndex = getReorderDestinationIndex({
                startIndex: indexOfSource!,
                indexOfTarget,
                closestEdgeOfTarget,
                axis: "vertical",
              });

              reorderTask({
                categoryId: destinationCategoryId,
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
    },
    [projects, moveTask]
  );

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
