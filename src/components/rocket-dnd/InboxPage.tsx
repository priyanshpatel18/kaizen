"use client";

import Column from "@/components/rocket-dnd/Column";
import { BOARD_COLUMNS } from "@/data";
import { getReorderDestinationIndex } from "@atlaskit/pragmatic-drag-and-drop-hitbox/util/get-reorder-destination-index";
import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { reorder } from "@atlaskit/pragmatic-drag-and-drop/reorder";
import { ReactNode, useCallback, useEffect, useState } from "react";
import { extractClosestEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";

interface HandleDropProps {
  source: {
    data: {
      type: string;
      cardId: number;
    };
    element: ReactNode;
  };
  location: any;
}

interface MoveCardProps {
  movedCardIndexInSourceColumn: number;
  sourceColumnId: string;
  destinationColumnId: string;
  movedCardIndexInDestinationColumn: number | null;
}

interface ReorderCardProps {
  columnId: string;
  startIndex: number;
  finishIndex: number;
}

export default function InboxPage() {
  const [columnData, setColumnData] = useState(BOARD_COLUMNS);

  const moveCard = useCallback(
    ({
      movedCardIndexInSourceColumn,
      sourceColumnId,
      destinationColumnId,
      movedCardIndexInDestinationColumn,
    }: MoveCardProps) => {
      // Get data of the source column
      const sourceColumnData = columnData[sourceColumnId];

      // Get data of the destination column
      const destinationColumnData = columnData[destinationColumnId];

      // Identify the card to move
      const cardToMove = sourceColumnData.cards[movedCardIndexInSourceColumn];

      // Remove the moved card from the source column
      const newSourceColumnData = {
        ...sourceColumnData,
        cards: sourceColumnData.cards.filter(
          (card) => card.id !== cardToMove.id
        ),
      };

      // Create a copy of the destination column's cards array
      const newDestinationCards = Array.from(destinationColumnData.cards);

      // Determine the new index in the destination column
      const newIndexInDestination = movedCardIndexInDestinationColumn ?? 0;

      // Insert the moved card into the new index in the destination column
      newDestinationCards.splice(newIndexInDestination, 0, cardToMove);

      // Create new destination column data with the moved card
      const newFinishColumnData = {
        ...destinationColumnData,
        cards: newDestinationCards,
      };

      // Update the state with the new columns data
      setColumnData({
        ...columnData,
        [sourceColumnId]: newSourceColumnData,
        [destinationColumnId]: newFinishColumnData,
      });
    },
    [columnData]
  );

  const reorderCard = useCallback(
    ({ columnId, startIndex, finishIndex }: ReorderCardProps) => {
      const sourceColumnData = columnData[columnId];

      const updatedItems = reorder({
        list: sourceColumnData.cards,
        startIndex,
        finishIndex,
      });

      const updatedSourceColumn = {
        ...sourceColumnData,
        cards: updatedItems,
      };

      setColumnData({
        ...columnData,
        [columnId]: updatedSourceColumn,
      });
    },
    [columnData]
  );

  const handleDrop = useCallback(
    ({ source, location }: HandleDropProps) => {
      // Early return if there are no drop targets in the current location
      const destination = location.current.dropTargets.length;
      if (!destination) {
        return;
      }
      
      // Check if the source of the drag is a card to handle card-specific logic
      if (source.data.type === "card") {
        // Retrieve the ID of the card being dragged
        const draggedCardId = source.data.cardId;

        // Get the source column from the initial drop targets
        const [, sourceColumnRecord] = location.initial.dropTargets;

        // Retrieve the ID of the source column
        const sourceColumnId = sourceColumnRecord.data.columnId;

        // Get the data of the source column
        const sourceColumnData = columnData[sourceColumnId];

        // Get the index of the card being dragged in the source column
        const draggedCardIndex = sourceColumnData.cards.findIndex(
          (card) => card.id === draggedCardId
        );

        if (location.current.dropTargets.length === 1) {
          const [destinationColumnRecord] = location.current.dropTargets;

          const destinationColumnId = destinationColumnRecord.data.columnId;

          if (sourceColumnId === destinationColumnId) {
            const destinationIndex = getReorderDestinationIndex({
              startIndex: draggedCardIndex,
              indexOfTarget: sourceColumnData.cards.length - 1,
              closestEdgeOfTarget: null,
              axis: "vertical",
            });

            reorderCard({
              columnId: sourceColumnData.columnId,
              startIndex: draggedCardIndex,
              finishIndex: destinationIndex,
            });
            return;
          }

          const destinationIndex = getReorderDestinationIndex({
            startIndex: draggedCardIndex,
            indexOfTarget: columnData[destinationColumnId].cards.length - 1,
            closestEdgeOfTarget: null,
            axis: "vertical",
          });

          moveCard({
            movedCardIndexInSourceColumn: draggedCardIndex,
            sourceColumnId,
            destinationColumnId,
            movedCardIndexInDestinationColumn: destinationIndex + 1,
          });
        }

        if (location.current.dropTargets.length === 2) {
          // Destructure and extract the destination card and column data from the drop targets
          const [destinationCardRecord, destinationColumnRecord] =
            location.current.dropTargets;

          // Extract the destination column ID from the destination column data
          const destinationColumnId = destinationColumnRecord.data.columnId;

          // Retrieve the destination column data using the destination column ID
          const destinationColumn = columnData[destinationColumnId];

          // Find the index of the target card within the destination column's cards
          const indexOfTarget = destinationColumn.cards.findIndex(
            (card) => card.id === destinationCardRecord.data.cardId
          );

          // Determine the closest edge of the target card: top or bottom
          const closestEdgeOfTarget = extractClosestEdge(
            destinationCardRecord.data
          );

          // Check if the source and destination columns are the same
          if (sourceColumnId === destinationColumnId) {
            // Calculate the destination index for the card to be reordered within the same column
            const destinationIndex = getReorderDestinationIndex({
              startIndex: draggedCardIndex,
              indexOfTarget,
              closestEdgeOfTarget,
              axis: "vertical",
            });

            // Perform the card reordering within the same column
            reorderCard({
              columnId: sourceColumnId,
              startIndex: draggedCardIndex,
              finishIndex: destinationIndex,
            });

            return;
          }

          const destinationIndex =
            closestEdgeOfTarget === "bottom"
              ? indexOfTarget + 1
              : indexOfTarget;

          moveCard({
            movedCardIndexInSourceColumn: draggedCardIndex,
            sourceColumnId,
            destinationColumnId,
            movedCardIndexInDestinationColumn: destinationIndex,
          });
        }
      }
    },
    [columnData, reorderCard]
  );

  useEffect(() => {
    return monitorForElements({
      // @ts-ignore
      onDrop: handleDrop,
    });
  }, [handleDrop]);

  return (
    <div className="flex space-x-4 p-4 bg-gray-100 min-h-screen">
      {Object.keys(columnData).map((columnId) => (
        <Column key={columnId} {...columnData[columnId]} id={columnId} />
      ))}
    </div>
  );
}
