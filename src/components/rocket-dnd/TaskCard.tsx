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
import invariant from "tiny-invariant";
import { Card } from "../ui/card";
import DropIndicator from "./DropIndicator";

interface CardProps {
  id: number;
  content: string;
}

export default function TaskCard({ id, content }: CardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [closestEdge, setClosestEdge] = useState(null);

  useEffect(() => {
    const cardEl = cardRef.current;
    invariant(cardEl);

    // Combine draggable and dropTargetForElements cleanup functions
    // to return a single cleanup function
    return combine(
      draggable({
        element: cardEl,
        getInitialData: () => ({ type: "card", cardId: id }),
        onDragStart: () => setIsDragging(true),
        onDrop: () => setIsDragging(false),
      }),
      // Add dropTargetForElements to make the card a drop target
      dropTargetForElements({
        element: cardEl,
        getData: ({ input, element }) => {
          // To attach card data to a drop target
          const data = { type: "card", cardId: id };

          // Attaches the closest edge (top or bottom) to the data object
          // This data will be used to determine where to drop card relative
          // to the target card.
          return attachClosestEdge(data, {
            input,
            element,
            allowedEdges: ["top", "bottom"],
          });
        },
        getIsSticky: () => true, // To make a drop target "sticky"
        onDragEnter: (args) => {
          if (args.source.data.cardId !== id) {
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
    <Card
      ref={cardRef}
      key={id}
      className={`
         relative p-2 rounded-md shadow-sm cursor-pointer  select-none 
        ${isDragging && "opacity-50 bg-gray-300"}`}
    >
      {content}
      {closestEdge && <DropIndicator edge={closestEdge} gap="8px" />}
    </Card>
  );
}
