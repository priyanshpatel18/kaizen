import UpdateStoreData, { MultiStoreUpdate, UpdateDataProps } from "@/lib/UpdateStoreData";
import { Category, useCategoryStore } from "@/store/category";
import { useTaskStore } from "@/store/task";
import { extractClosestEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import { getReorderDestinationIndex } from "@atlaskit/pragmatic-drag-and-drop-hitbox/util/get-reorder-destination-index";
import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { reorder } from "@atlaskit/pragmatic-drag-and-drop/reorder";
import { ReactNode, useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

interface ReorderTaskProps {
  categoryId: string;
  startIndex: number;
  finishIndex: number;
  taskId: string;
}

interface MoveTaskProps {
  sourceIndex: number;
  sourceCategoryId: string;
  targetIndex: number;
  targetCategoryId: string;
}

interface HandleDropProps {
  source: {
    data: {
      type: "task" | "category";
      taskId?: string;
      categoryId?: string;
    };
    element: ReactNode;
  };
  location: any;
}

interface IProps {
  pathname?: string;
}

export default function DragAndDropFunctions({ pathname }: IProps) {
  const { categories } = useCategoryStore();
  const [props, setProps] = useState<UpdateDataProps | undefined>(undefined);
  const { tasks } = useTaskStore();

  function getUpdatedTaskPosition(taskId: string, category: Category) {
    const taskIndex = category.taskIds.findIndex((task: string) => task === taskId);
    const preTaskId = category.taskIds[taskIndex - 1] || null;
    const postTaskId = category.taskIds[taskIndex + 1] || null;

    const preTask = tasks.find((task) => task.id === preTaskId);
    const postTask = tasks.find((task) => task.id === postTaskId);

    const [preTaskPosition, postTaskPosition] = [preTask?.position, postTask?.position];

    if (!preTaskPosition && !postTaskPosition) {
      return (category.taskIds.length + 1) * 1000;
    } else if (!preTaskPosition && postTaskPosition) {
      return postTaskPosition / 2;
    } else if (preTaskPosition && !postTaskPosition) {
      return (preTaskPosition * 2 + 1000) / 2;
    } else if (preTaskPosition && postTaskPosition) {
      return (preTaskPosition + postTaskPosition) / 2;
    }
    return 0;
  }

  const reorderTask = useCallback(
    async ({ categoryId, startIndex, finishIndex, taskId }: ReorderTaskProps) => {
      // Ensure the startIndex and finishIndex are different; no need to reorder if they’re the same
      if (startIndex === finishIndex) return;

      // Find the source category by ID
      const sourceCategoryData = categories.find((category) => category.id === categoryId);

      if (sourceCategoryData) {
        // Reorder the items
        const updatedItems = reorder({
          list: sourceCategoryData.taskIds,
          startIndex,
          finishIndex,
        });

        // Update the source category
        const updatedSourceCategory: Category = {
          ...sourceCategoryData,
          taskIds: updatedItems,
        };

        // Update the store
        setProps({
          data: updatedSourceCategory,
          action: "update",
          type: "category",
        });

        const task = tasks.find((task) => task.id === taskId);
        const updatedPosition = getUpdatedTaskPosition(taskId, updatedSourceCategory);

        if (task && updatedPosition !== 0 && updatedPosition !== task?.position) {
          const newTask = { ...task, position: updatedPosition, categoryId: updatedSourceCategory.id };

          setProps({
            data: newTask,
            action: "update",
            type: "task",
          });

          if (pathname !== "/app/today") {
            updatePosition("task", taskId, {
              position: updatedPosition,
              categoryId: updatedSourceCategory.id,
            });
          }
        }
      }
    },
    [categories]
  );

  const moveTask = useCallback(
    ({ sourceIndex, sourceCategoryId, targetIndex, targetCategoryId }: MoveTaskProps) => {
      setProps(undefined);

      const sourceCategoryData = categories.find((category) => category.id === sourceCategoryId);
      const destinationCategoryData = categories.find((category) => category.id === targetCategoryId);

      if (!sourceCategoryData || !destinationCategoryData) {
        console.error("Invalid source or destination column ID");
        return;
      }

      // Ensure the task index in source category is valid
      if (sourceIndex < 0 || sourceIndex >= sourceCategoryData.taskIds.length) {
        console.error("Invalid card index in source column");
        return;
      }

      // Extract the task ID from the source category
      const movedTaskId = sourceCategoryData.taskIds[sourceIndex];

      // Remove the task from the source category
      const updatedSourceCategory: Category = {
        ...sourceCategoryData,
        taskIds: sourceCategoryData.taskIds.filter((taskId) => taskId !== movedTaskId),
      };

      // Add the task to the destination category
      const updatedDestinationCategory = {
        ...destinationCategoryData,
        taskIds: [
          ...destinationCategoryData.taskIds.slice(0, targetIndex),
          movedTaskId,
          ...destinationCategoryData.taskIds.slice(targetIndex),
        ],
      };

      const task = tasks.find((task) => task.id === movedTaskId);
      const updatedPosition = getUpdatedTaskPosition(movedTaskId, updatedDestinationCategory);

      if (task && updatedPosition !== 0 && updatedPosition !== task?.position) {
        const newTask = { ...task, position: updatedPosition, categoryId: updatedDestinationCategory.id };

        const updates: MultiStoreUpdate[] = [
          { type: "category", data: updatedSourceCategory, action: "update" },
          { type: "category", data: updatedDestinationCategory, action: "update" },
          { type: "task", data: newTask, action: "update" },
        ];

        setProps({
          data: updates,
          action: undefined,
          type: "multi",
        });

        if (pathname !== "/app/today") {
          updatePosition("task", movedTaskId, {
            position: updatedPosition,
            categoryId: newTask.categoryId,
          });
        }
      }
    },
    [categories, pathname, tasks]
  );

  const handleDrop = useCallback(
    ({ source, location }: HandleDropProps) => {
      // Early return if there are no drop targets in the current location
      const destination = location.current.dropTargets.length;
      if (!destination) return;

      if (source.data.type === "task" && source.data.taskId) {
        // Retrieve the ID of the task being dragged
        const draggedTaskId = source.data.taskId;

        // Get the source category the initial drop targets
        const [, sourceCategoryRecord] = location.initial.dropTargets;

        // Retrieve the ID of the source category
        const sourceCategoryId = sourceCategoryRecord.data.categoryId;

        // Get the data of the source category
        const sourceCategoryData = categories.find((category) => category.id === sourceCategoryId);

        // Get the index of the task in the source category
        const indexOfSource = sourceCategoryData?.taskIds.findIndex((task) => task === draggedTaskId);

        // Tasks are dropped in different category
        if (location.current.dropTargets.length === 1) {
          // Tasks are dropped in the different column
          const [destinationCategoryRecord] = location.current.dropTargets;

          // Retrieve the ID of the destination category
          const destinationCategoryId = destinationCategoryRecord.data.categoryId;

          // Retrieve the destination category data using the destination category ID
          const destinationCategory = categories.find((col) => col.id === destinationCategoryId);

          const destinationIndex = getReorderDestinationIndex({
            startIndex: indexOfSource!,
            indexOfTarget: Number(destinationCategory?.taskIds.length) || -1,
            closestEdgeOfTarget: null,
            axis: "vertical",
          });

          moveTask({
            sourceIndex: indexOfSource!,
            sourceCategoryId,
            targetIndex: destinationIndex,
            targetCategoryId: destinationCategoryId,
          });
        }

        // Tasks are dropped in same category
        if (location.current.dropTargets.length === 2) {
          const [destinationTaskRecord, destinationCategoryRecord] = location.current.dropTargets;

          // Retrieve the ID of the destination category
          const destinationCategoryId = destinationCategoryRecord.data.categoryId;

          // Retrieve the destination category data using the destination category ID
          const destinationCategory = categories.find((col) => col.id === destinationCategoryId);

          if (destinationCategory) {
            // Find the index of the target task within the destination category's tasks
            const indexOfTarget = destinationCategory.taskIds.findIndex(
              (task) => task === destinationTaskRecord.data.taskId
            );

            // Determine the closest edge of the target task: top or bottom
            const closestEdgeOfTarget = extractClosestEdge(destinationTaskRecord.data);

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

            const destinationIndex = closestEdgeOfTarget === "bottom" ? indexOfTarget + 1 : indexOfTarget;

            moveTask({
              sourceIndex: indexOfSource!,
              sourceCategoryId,
              targetIndex: destinationIndex,
              targetCategoryId: destinationCategoryId,
            });
          }
        }
      }
    },
    [reorderTask, categories]
  );

  useEffect(() => {
    setProps(undefined);

    return monitorForElements({
      // @ts-ignore
      onDrop: handleDrop,
    });
  }, [handleDrop]);

  async function updatePosition(type: "task" | "category", id: string, updateValue: object) {
    try {
      const response = await fetch(`/api/${type}/update`, {
        method: "PUT",
        body: JSON.stringify({
          id,
          updateValue,
        }),
      });

      const data = await response.json();

      if (!response.ok) toast.error(data.message);
    } catch (error) {
      console.log(error);
    }
  }

  return props && <UpdateStoreData data={props.data} action={props.action} type={props.type} />;
}
