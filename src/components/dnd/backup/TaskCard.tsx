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
import { DropIndicator } from "@atlaskit/pragmatic-drag-and-drop-react-drop-indicator/box";
import invariant from "tiny-invariant";

interface TaskProps {
  id: string;
  title: string;
  description?: string;
  priority?: number;
  isCompleted?: boolean;
  categoryId: string;
}

export default function TaskCard({ id, title }: TaskProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [closestEdge, setClosestEdge] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const cardEl = cardRef.current;
    invariant(cardEl);

    return combine(
      // Add draggable to make the card draggable
      draggable({
        element: cardEl,
        getInitialData: () => ({ type: "card", cardId: id }),
        onDragStart: () => setIsDragging(true),
        onDrop: () => setIsDragging(false),
      }),
      // Add dropTargetForElements to make the card a drop target
      dropTargetForElements({
        element: cardEl,
        getData: ({ input, element, source }) => {
          // To attach card data to a drop target
          const data = { type: "card", cardId: id };

          if (source.data.type === "card") {
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
          if (args.source.data.cardId !== id) {
            // Update the closest edge when the draggable item enters the drop zone
            setClosestEdge(
              extractClosestEdge(args.self.data) as SetStateAction<null>
            );
          }
        },
        onDrag: (args) => {
          // Continuously update the closest edge while dragging over the drop zone
          if (args.source.data.cardId !== id) {
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
  }, [id]);

  return (
    <div
      className={`
        ${isDragging && "border-black opacity-30"} 
        rounded-lg p-6 relative cursor-pointer flex gap-4 items-center border-border border-2
      `}
      ref={cardRef}
    >
      {/* <p className="text-xs">{id}</p> */}
      <p>{title}</p>

      {closestEdge && <DropIndicator edge={closestEdge} gap="20px" />}
    </div>
  );
}
