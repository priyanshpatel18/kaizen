"use client";

import {
  attachClosestEdge,
  extractClosestEdge,
} from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import {
  draggable,
  dropTargetForElements,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { SetStateAction, useEffect, useRef, useState } from "react";
// @ts-ignore
import { Task } from "@/store";
import { DropIndicator } from "@atlaskit/pragmatic-drag-and-drop-react-drop-indicator/box";
import invariant from "tiny-invariant";

interface TaskProps {
  task: Task;
  taskId?: string;
  title?: string;
}

export default function TaskCard({ task, taskId, title }: TaskProps) {
  const taskRef = useRef<HTMLDivElement | null>(null);
  const [closestEdge, setClosestEdge] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const taskEl = taskRef.current;
    invariant(taskEl);

    return combine(
      // Add draggable to make the card draggable
      draggable({
        element: taskEl,
        getInitialData: () => ({ type: "task", taskId }),
        onDragStart: () => setIsDragging(true),
        onDrop: () => setIsDragging(false),
      }),
      // Add dropTargetForElements to make the card a drop target
      dropTargetForElements({
        element: taskEl,
        getData: ({ input, element, source }) => {
          // To attach card data to a drop target
          const data = { type: "task", taskId };

          if (source.data.type === "task") {
            return attachClosestEdge(data, {
              input,
              element,
              allowedEdges: ["top", "bottom"],
            });
          }

          return data;
        },
        getIsSticky: () => true,
        onDragEnter: (args) => {
          if (args.source.data.taskId !== taskId) {
            // Update the closest edge when the draggable item enters the drop zone
            setClosestEdge(
              extractClosestEdge(args.self.data) as SetStateAction<null>
            );
          }
        },
        onDrag: (args) => {
          // Continuously update the closest edge while dragging over the drop zone
          if (args.source.data.taskId !== taskId) {
            setClosestEdge(
              extractClosestEdge(args.self.data) as SetStateAction<null>
            );
          }
        },
        onDragLeave: () => {
          // Reset the closest edge when the draggable item leaves the drop zone
          setClosestEdge(null);
        },
        onDrop: () => {
          // Reset the closest edge when the draggable item is dropped
          setClosestEdge(null);
        },
      })
    );
  }, [task.id]);

  return (
    <div
      className={`
        ${isDragging && "border-black opacity-30"} 
        rounded-lg p-2 relative cursor-pointer flex gap-4 items-center border-border border-2 w-[200px]
      `}
      ref={taskRef}
    >
      <p>{title}</p>
      {closestEdge && <DropIndicator edge={closestEdge} gap="19.5px" />}
    </div>
  );
}
