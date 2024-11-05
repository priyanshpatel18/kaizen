"use client";

import {
  attachClosestEdge,
  extractClosestEdge,
} from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import { getReorderDestinationIndex } from "@atlaskit/pragmatic-drag-and-drop-hitbox/util/get-reorder-destination-index";
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import {
  draggable,
  dropTargetForElements,
  monitorForElements,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { reorder } from "@atlaskit/pragmatic-drag-and-drop/reorder";
import {
  ReactNode,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
// @ts-ignore
import { DropIndicator } from "@atlaskit/pragmatic-drag-and-drop-react-drop-indicator/box";
import invariant from "tiny-invariant";

const DATA: ColumnProps[] = [
  {
    id: "ae534b11-d8e6-413e-8112-542275e1a1cd",
    title: "TODO",
    cards: [
      { id: 1, content: "Understand the concepts" },
      { id: 2, content: "Ask for help" },
      { id: 3, content: "Apply what I've learned" },
    ],
  },
  {
    id: "b1e56c11-c555-490f-a1d0-64e7b2b8c524",
    title: "IN PROGRESS",
    cards: [
      { id: 4, content: "Watch the video" },
      { id: 5, content: "Clear your doubts" },
      { id: 6, content: "Master the concepts" },
    ],
  },
  {
    id: "c2c4a3e2-9b99-4110-9154-62ee6d193b76",
    title: "COMPLETED",
    cards: [
      { id: 7, content: "Review the notes" },
      { id: 8, content: "Prepare for the exam" },
    ],
  },
];

interface HandleDropProps {
  source: {
    data: {
      type: string;
      cardId?: number;
      columnId?: string;
    };
    element: ReactNode;
  };
  location: any;
}

interface CardProps {
  id: number;
  content: string;
}

interface ColumnProps {
  title: string;
  cards: CardProps[];
  id: string;
}

interface ReorderColumnProps {
  sourceIndex: number;
  destinationIndex: number;
}

interface ReorderCardProps {
  columnId: string;
  startIndex: number;
  finishIndex: number;
}

interface MoveCardProps {
  movedCardIndexInSourceColumn: number;
  sourceColumnId: string;
  destinationColumnId: string;
  movedCardIndexInDestinationColumn?: number;
}

interface DropIndicatorProps {
  edge: "top" | "bottom";
  gap: string;
}

export default function TestPage() {
  const [data, setData] = useState(DATA);

  const reorderColumn = useCallback(
    ({ sourceIndex, destinationIndex }: ReorderColumnProps) => {
      setData((prevData) => {
        const newData = [...prevData];
        const [movedColumn] = newData.splice(sourceIndex, 1);
        newData.splice(destinationIndex, 0, movedColumn);
        return newData;
      });
    },
    []
  );

  const moveCard = useCallback(
    ({
      movedCardIndexInSourceColumn,
      sourceColumnId,
      destinationColumnId,
      movedCardIndexInDestinationColumn = 0,
    }: MoveCardProps) => {
      // Ensure source and destination columns exist
      const sourceColumnData = data.find(
        (column) => column.id === sourceColumnId
      );
      const destinationColumnData = data.find(
        (column) => column.id === destinationColumnId
      );

      if (!sourceColumnData || !destinationColumnData) {
        console.error("Invalid source or destination column ID");
        return;
      }

      // Ensure the card index in source column is valid
      if (
        movedCardIndexInSourceColumn < 0 ||
        movedCardIndexInSourceColumn >= sourceColumnData.cards.length
      ) {
        console.error("Invalid card index in source column");
        return;
      }

      // Extract the card to move
      const cardToMove = sourceColumnData.cards[movedCardIndexInSourceColumn];

      // Remove the card from the source column
      const updatedSourceCards = [...sourceColumnData.cards];
      updatedSourceCards.splice(movedCardIndexInSourceColumn, 1);

      // Insert the card into the destination column at the specified index
      const updatedDestinationCards = [...destinationColumnData.cards];
      const destinationIndex = Math.min(
        movedCardIndexInDestinationColumn,
        updatedDestinationCards.length
      );
      updatedDestinationCards.splice(destinationIndex, 0, cardToMove);

      // Update the state with the modified source and destination columns
      const newData = data.map((column) => {
        if (column.id === sourceColumnId) {
          return { ...column, cards: updatedSourceCards };
        }
        if (column.id === destinationColumnId) {
          return { ...column, cards: updatedDestinationCards };
        }
        return column;
      });

      setData(newData);
    },
    [data]
  );

  const reorderCard = useCallback(
    ({ columnId, startIndex, finishIndex }: ReorderCardProps) => {
      // Ensure the startIndex and finishIndex are different; no need to reorder if they’re the same
      if (startIndex === finishIndex) return;
      // Find the source column by ID
      const sourceColumnData = data.find((column) => column.id === columnId);

      if (sourceColumnData) {
        const updatedItems = reorder({
          list: sourceColumnData.cards,
          startIndex,
          finishIndex,
        });

        const updatedSourceColumn = {
          ...sourceColumnData,
          cards: updatedItems,
        };

        const newData = data.map((column) => {
          if (column.id === columnId) {
            return updatedSourceColumn;
          }
          return column;
        });

        setData(newData);
      }
    },
    [data]
  );

  const handleDrop = useCallback(
    ({ source, location }: HandleDropProps) => {
      // Early return if there are no drop targets in the current location
      const destination = location.current.dropTargets.length;
      if (!destination) return;

      if (source.data.type === "card" && source.data.cardId) {
        // Retrieve the ID of the card being dragged
        const draggedCardId = source.data.cardId;

        // Get the source column from the initial drop targets
        const [, sourceColumnRecord] = location.initial.dropTargets;

        // Retrieve the ID of the source column
        const sourceColumnId = sourceColumnRecord.data.columnId;

        // Get the data of the source column
        const sourceColumnData = data.find((col) => col.id === sourceColumnId);

        // Get the index of the card in the source column
        const indexOfSource = sourceColumnData?.cards.findIndex(
          (card) => card.id === draggedCardId
        );

        if (location.current.dropTargets.length === 1) {
          const [destinationColumnRecord] = location.current.dropTargets;

          // Retrieve the ID of the destination column
          const destinationColumnId = destinationColumnRecord.data.columnId;

          // Check if the source and destination columns are the same
          if (sourceColumnId === destinationColumnId) {
            const destinationIndex = getReorderDestinationIndex({
              startIndex: indexOfSource!,
              indexOfTarget:
                data.findIndex((col) => col.id === destinationColumnId) - 1,
              closestEdgeOfTarget: null,
              axis: "vertical",
            });

            reorderCard({
              columnId: sourceColumnId,
              startIndex: indexOfSource!,
              finishIndex: destinationIndex,
            });
            return;
          }

          const destinationIndex = getReorderDestinationIndex({
            startIndex: indexOfSource!,
            indexOfTarget:
              data.find((col) => col.id === destinationColumnId)!.cards.length -
              1,
            closestEdgeOfTarget: null,
            axis: "vertical",
          });

          moveCard({
            movedCardIndexInSourceColumn: indexOfSource!,
            sourceColumnId,
            destinationColumnId,
            movedCardIndexInDestinationColumn: destinationIndex + 1,
          });
        }
        if (location.current.dropTargets.length === 2) {
          const [destinationCardRecord, destinationColumnRecord] =
            location.current.dropTargets;

          // Retrieve the ID of the destination column
          const destinationColumnId = destinationColumnRecord.data.columnId;

          // Retrieve the destination column data using the destination column ID
          const destinationColumn = data.find(
            (col) => col.id === destinationColumnId
          );

          if (destinationColumn) {
            // Find the index of the target card within the destination column's cards
            const indexOfTarget = destinationColumn.cards.findIndex(
              (card) => card.id === destinationCardRecord.data.cardId
            );

            // Determine the closest edge of the target card: top or bottom
            const closestEdgeOfTarget = extractClosestEdge(
              destinationCardRecord.data
            );

            if (sourceColumnId === destinationColumnId) {
              const destinationIndex = getReorderDestinationIndex({
                startIndex: indexOfSource!,
                indexOfTarget,
                closestEdgeOfTarget,
                axis: "vertical",
              });

              reorderCard({
                columnId: sourceColumnId,
                startIndex: indexOfSource!,
                finishIndex: destinationIndex,
              });
              return;
            }

            const destinationIndex =
              closestEdgeOfTarget === "bottom"
                ? indexOfTarget + 1
                : indexOfTarget;

            moveCard({
              movedCardIndexInSourceColumn: indexOfSource!,
              sourceColumnId,
              destinationColumnId,
              movedCardIndexInDestinationColumn: destinationIndex,
            });
          }
        }
      }

      if (source.data.type === "column" && source.data.columnId) {
        const sourceIndex = data.findIndex(
          (col) => col.id === source.data.columnId
        );
        const destinationIndex = data.findIndex(
          (col) => col.id === location.current.dropTargets[0].data.columnId
        );

        if (sourceIndex !== -1 && destinationIndex !== -1) {
          reorderColumn({ sourceIndex, destinationIndex });
        }
      }
    },
    [data, reorderCard]
  );

  useEffect(() => {
    return monitorForElements({
      // @ts-ignore
      onDrop: handleDrop,
    });
  }, [handleDrop]);

  return (
    <div className="w-full p-6 select-none bg-gray-950 flex h-screen gap-10">
      {Object.values(data).map((column) => (
        <Column
          key={column.title}
          title={column.title}
          cards={column.cards}
          id={column.id}
        />
      ))}
    </div>
  );
}

function Column({ cards, title, id }: ColumnProps) {
  const columnRef = useRef<HTMLDivElement>(null);
  const [isReordering, setIsReordering] = useState(false);
  const [closestEdge, setClosestEdge] = useState(null);

  useEffect(() => {
    const columnEl = columnRef.current;
    invariant(columnEl);

    return combine(
      // Make the card draggable
      draggable({
        element: columnEl,
        getInitialData: () => ({ type: "column", columnId: id }),
        onDragStart: () => setIsReordering(true),
        onDrop: () => setIsReordering(false),
      }),
      // Make the column a drop target
      dropTargetForElements({
        element: columnEl,
        getData: ({ input, element }) => {
          // To attach card data to a drop target
          const data = { type: "column", columnId: id };

          return attachClosestEdge(data, {
            input,
            element,
            allowedEdges: ["left", "right"],
          });
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
      className={`min-w-[300px] flex flex-col text-white border-[1px] p-4 border-muted-foreground rounded-lg hover:border-border 
        ${isReordering && "opacity-30"} relative`}
      ref={columnRef}
    >
      <h1 className="text-lg font-bold mb-1">{title}</h1>
      <h3 className="text-xs mb-4">{id}</h3>
      <div className="space-y-2 flex-1">
        {cards.map((card: any) => (
          <Card key={card.id} id={card.id} content={card.content} />
        ))}
      </div>
      {closestEdge && <DropIndicator edge={closestEdge} gap="40px" />}
    </div>
  );
}

function Card({ id, content }: CardProps) {
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
        getData: ({ input, element }) => {
          // To attach card data to a drop target
          const data = { type: "card", cardId: id };

          return attachClosestEdge(data, {
            input,
            element,
            allowedEdges: ["top", "bottom"],
          });
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
      className={`${
        isDragging && "opacity-30"
      } rounded-lg shadow-md p-6 relative cursor-pointer bg-gray-900 hover:bg-gray-800 flex gap-4 items-center justify`}
      ref={cardRef}
    >
      <h1 className="text-lg font-bold">{id}</h1>
      <p>{content}</p>

      {closestEdge && <DropIndicator edge={closestEdge} gap="10px" />}
    </div>
  );
}
