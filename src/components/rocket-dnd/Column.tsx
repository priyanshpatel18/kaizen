"use client";

import { Card } from "@/components/ui/card";
import TaskCard from "./TaskCard";
import { dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { useEffect, useRef, useState } from "react";
import invariant from "tiny-invariant";

interface Card {
  id: number;
  content: string;
}

interface ColumnProps {
  cards: Card[];
  title: string;
  id: string;
}

export default function Column({ cards, title, id }: ColumnProps) {
  const columnRef = useRef<HTMLDivElement>(null);
  const [isDraggedOver, setIsDraggedOver] = useState(false);

  useEffect(() => {
    const columnEl = columnRef.current;
    invariant(columnEl);

    return dropTargetForElements({
      element: columnRef.current,
      onDragStart: () => setIsDraggedOver(true),
      onDragEnter: () => setIsDraggedOver(true),
      onDragLeave: () => setIsDraggedOver(false),
      onDrop: () => setIsDraggedOver(false),
      getData: () => ({ type: "column", columnId: id }),
      getIsSticky: () => true,
    });
  }, [id]);

  return (
    <div
      className={`bg-white rounded-lg shadow-md p-4 w-64 
        ${isDraggedOver &&   ""}`}
      ref={columnRef}
    >
      <h1 className="text-lg font-bold mb-4">{title}</h1>
      <div className="space-y-2">
        {cards.map((card) => (
          <TaskCard key={card.id} id={card.id} content={card.content} />
        ))}
      </div>
    </div>
  );
}
