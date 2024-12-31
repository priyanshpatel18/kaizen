import UpdateStoreData from "@/lib/UpdateStoreData";
import { Category, useCategoryStore } from "@/store/category";
import { useTaskStore } from "@/store/task";
import { extractClosestEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import { getReorderDestinationIndex } from "@atlaskit/pragmatic-drag-and-drop-hitbox/util/get-reorder-destination-index";
import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { reorder } from "@atlaskit/pragmatic-drag-and-drop/reorder";
import { ReactNode, useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { UpdateProps } from "./Board";

interface ReorderCardProps {
  categoryId: string;
  startIndex: number;
  finishIndex: number;
  taskId: string;
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
  const [props, setProps] = useState<UpdateProps | undefined>(undefined);
  const { tasks } = useTaskStore();

  const reorderCard = useCallback(
    async ({ categoryId, startIndex, finishIndex, taskId }: ReorderCardProps) => {
      // Ensure the startIndex and finishIndex are different; no need to reorder if they’re the same
      if (startIndex === finishIndex) return;

      // Find the source column by ID
      const sourceCategoryData = categories.find((category) => category.id === categoryId);

      if (sourceCategoryData) {
        const updatedItems = reorder({
          list: sourceCategoryData.taskIds,
          startIndex,
          finishIndex,
        });

        const updatedSourceCategory: Category = {
          ...sourceCategoryData,
          taskIds: updatedItems,
        };

        setProps({
          data: updatedSourceCategory,
          action: "update",
          type: "category",
        });

        const taskIndex = updatedSourceCategory.taskIds.findIndex((task: string) => task === taskId);
        const preTaskId = updatedSourceCategory.taskIds[taskIndex - 1] || null;
        const postTaskId = updatedSourceCategory.taskIds[taskIndex + 1] || null;

        const preTask = tasks.find((task) => task.id === preTaskId);
        const postTask = tasks.find((task) => task.id === postTaskId);
        const task = tasks.find((task) => task.id === taskId);

        const [preTaskPosition, postTaskPosition] = [preTask?.position, postTask?.position];
        console.log(preTaskPosition, postTaskPosition);

        let updatedPosition = 0;
        if (!preTaskPosition && !postTaskPosition) {
          updatedPosition = (updatedSourceCategory.taskIds.length + 1) * 1000;
        } else if (!preTaskPosition && postTaskPosition) {
          updatedPosition = postTaskPosition / 2;
        } else if (preTaskPosition && !postTaskPosition) {
          updatedPosition = (preTaskPosition * 2 + 1000) / 2;
        } else if (preTaskPosition && postTaskPosition) {
          updatedPosition = (preTaskPosition + postTaskPosition) / 2;
        }

        if (task && updatedPosition !== 0 && updatedPosition !== task?.position) {
          const newTask = { ...task, position: updatedPosition, categoryId: updatedSourceCategory.id };

          setProps({
            data: newTask,
            action: "update",
            type: "task",
          });
          if (pathname === "/app/today") {
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

  const handleDrop = useCallback(
    ({ source, location }: HandleDropProps) => {
      // Early return if there are no drop targets in the current location
      const destination = location.current.dropTargets.length;
      if (!destination) return;

      if (source.data.type === "task" && source.data.taskId) {
        // Retrieve the ID of the task being dragged
        const draggedTaskId = source.data.taskId;

        // Get the source column category the initial drop targets
        const [, sourceCategoryRecord] = location.initial.dropTargets;

        // Retrieve the ID of the source category
        const sourceCategoryId = sourceCategoryRecord.data.categoryId;

        // Get the data of the source category
        const sourceCategoryData = categories.find((category) => category.id === sourceCategoryId);

        // Get the index of the task in the source category
        const indexOfSource = sourceCategoryData?.taskIds.findIndex((task) => task === draggedTaskId);

        // Tasks are dropped in different category
        if (location.current.dropTargets.length === 1) {
        }

        // Tasks are dropped in same category
        if (location.current.dropTargets.length === 2) {
          const [destinationTaskRecord, destinationCategoryRecord] = location.current.dropTargets;

          // Retrieve the ID of the destination category
          const destinationCategoryId = destinationCategoryRecord.data.categoryId;

          // Retrieve the destination category data using the destination category ID
          const destinationCategory = categories.find((col) => col.id === destinationCategoryId);

          if (destinationCategory) {
            // Find the index of the target task within the destination category's cards
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

              reorderCard({
                categoryId: sourceCategoryId,
                startIndex: indexOfSource!,
                finishIndex: destinationIndex,
                taskId: draggedTaskId,
              });
              return;
            }
          }
        }
      }
    },
    [reorderCard, categories]
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
