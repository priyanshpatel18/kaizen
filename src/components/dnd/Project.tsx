"use client";

import { useProjects } from "@/hooks/useProjects";
import { Project as ProjectState, useStore } from "@/store";
import { extractClosestEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import { getReorderDestinationIndex } from "@atlaskit/pragmatic-drag-and-drop-hitbox/util/get-reorder-destination-index";
import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { reorder } from "@atlaskit/pragmatic-drag-and-drop/reorder";
import { ReactNode, useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import CategoryComponent from "./Category";

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

interface ReorderColumnProps {
  sourceIndex: number | undefined;
  destinationIndex: number | undefined;
  sourceColumnId: string;
  destinationColumnId: string;
}

interface ReorderCardProps {
  columnId: string;
  startIndex: number;
  finishIndex: number;
  taskId: string;
}

interface MoveCardProps {
  movedCardIndexInSourceColumn: number;
  sourceColumnId: string;
  destinationColumnId: string;
  movedCardIndexInDestinationColumn?: number;
}

interface IProps {
  projects?: ProjectState[] | null;
  selectedProject?: ProjectState | null;
}

export default function Project({}: IProps) {
  const { projects } = useProjects();
  const [projectsData, setProjectsData] = useState<ProjectState[] | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null
  );
  const store = useStore();

  const selectedProject = projectsData?.find(
    (project) => project.id === selectedProjectId
  );

  const reorderColumn = useCallback(
    ({
      sourceIndex,
      destinationIndex,
      sourceColumnId,
      destinationColumnId,
    }: ReorderColumnProps) => {
      if (sourceIndex === undefined || destinationIndex === undefined) return;

      const selectedProject = projectsData?.find(
        (project) => project.id === selectedProjectId
      );

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

      changePosition(
        sourceColumnId,
        destinationColumnId,
        destinationIndex,
        true
      );

      // Update the project in the projectsData state
      const updatedProjects =
        projectsData?.map((project) => {
          if (project.id === selectedProjectId) {
            return updatedProject;
          }
          return project;
        }) || [];

      setProjectsData(updatedProjects);
      store.setProjects(updatedProjects);
    },
    [projectsData]
  );

  const moveCard = useCallback(
    async ({
      movedCardIndexInSourceColumn,
      sourceColumnId,
      destinationColumnId,
      movedCardIndexInDestinationColumn = 0,
    }: MoveCardProps) => {
      // Ensure source and destination columns exist
      const selectedProject = projectsData?.find(
        (project) => project.id === selectedProjectId
      );

      const sourceColumnData = selectedProject?.categories.find(
        (column) => column.id === sourceColumnId
      );
      const destinationColumnData = selectedProject?.categories.find(
        (column) => column.id === destinationColumnId
      );

      if (!sourceColumnData || !destinationColumnData) {
        console.error("Invalid source or destination column ID");
        return;
      }

      // Ensure the card index in source column is valid
      if (
        movedCardIndexInSourceColumn < 0 ||
        movedCardIndexInSourceColumn >= sourceColumnData.tasks.length
      ) {
        console.error("Invalid card index in source column");
        return;
      }

      // Extract the card to move
      const cardToMove = sourceColumnData.tasks[movedCardIndexInSourceColumn];

      // Remove the card from the source column
      const updatedSourceCards = [...sourceColumnData.tasks];
      updatedSourceCards.splice(movedCardIndexInSourceColumn, 1);

      // Insert the card into the destination column at the specified index
      const updatedDestinationCards = [...destinationColumnData.tasks];
      const destinationIndex = Math.min(
        movedCardIndexInDestinationColumn,
        updatedDestinationCards.length
      );
      updatedDestinationCards.splice(destinationIndex, 0, cardToMove);

      // Update the state with the modified source and destination columns
      const newData = selectedProject?.categories.map((column) => {
        if (column.id === sourceColumnId) {
          return {
            ...column,
            tasks: updatedSourceCards,
          };
        }
        if (column.id === destinationColumnId) {
          return {
            ...column,
            tasks: updatedDestinationCards,
          };
        }
        return column;
      });

      const isLast = destinationColumnData.tasks.length === destinationIndex;

      if (newData) {
        changePosition(
          sourceColumnId,
          destinationColumnId,
          isLast ? destinationIndex - 1 : destinationIndex,
          false,
          cardToMove.id
        );
      }

      const newProjectData = projectsData?.map((project) => {
        if (project.id === selectedProjectId) {
          return {
            ...project,
            categories: newData || [],
          };
        }
        return project;
      });

      setProjectsData(newProjectData || null);
      newProjectData && store.setProjects(newProjectData || null);
    },
    [projectsData, selectedProjectId]
  );

  const reorderCard = useCallback(
    async ({ columnId, startIndex, finishIndex, taskId }: ReorderCardProps) => {
      // Ensure the startIndex and finishIndex are different; no need to reorder if they’re the same
      if (startIndex === finishIndex) return;

      const selectedProject = projectsData?.find(
        (project) => project.id === selectedProjectId
      );

      // Find the source column by ID
      const sourceColumnData = selectedProject?.categories.find(
        (column) => column.id === columnId
      );

      if (sourceColumnData) {
        const updatedItems = reorder({
          list: sourceColumnData.tasks,
          startIndex,
          finishIndex,
        });

        const updatedSourceColumn = {
          ...sourceColumnData,
          tasks: updatedItems,
        };

        // Logic to update the state
        const newData = selectedProject?.categories.map((column) => {
          if (column.id === columnId) {
            return updatedSourceColumn;
          }
          return column;
        });

        // Send request to database
        if (selectedProject?.categories.find((col) => col.id === columnId)) {
          changePosition(columnId, columnId, finishIndex, false, taskId);
        }

        const updatedProjects =
          projectsData?.map((project) => {
            if (project.id === selectedProjectId) {
              return {
                ...project,
                categories: newData || [],
              };
            }
            return project;
          }) || [];

        setProjectsData(updatedProjects);
        updatedProjects && store.setProjects(updatedProjects);
      }
    },
    [projectsData]
  );
 
  const handleDrop = useCallback(
    ({ source, location }: HandleDropProps) => {
      // Early return if there are no drop targets in the current location
      const destination = location.current.dropTargets.length;
      if (!destination) return;

      const selectedProject = projectsData?.find(
        (project) => project.id === selectedProjectId
      );

      if (source.data.type === "task" && source.data.taskId) {
        // Retrieve the ID of the card being dragged
        const draggedCardId = source.data.taskId;

        // Get the source column from the initial drop targets
        const [, sourceColumnRecord] = location.initial.dropTargets;

        // Retrieve the ID of the source column
        const sourceColumnId = sourceColumnRecord.data.categoryId;

        // Get the data of the source column
        const sourceColumnData = selectedProject?.categories.find(
          (category) => category.id === sourceColumnId
        );

        // Get the index of the card in the source column
        const indexOfSource = sourceColumnData?.tasks.findIndex(
          (task) => task.id === draggedCardId
        );

        if (location.current.dropTargets.length === 1) {
          // Tasks are dropped in the different column
          const [destinationColumnRecord] = location.current.dropTargets;

          // Retrieve the ID of the destination column
          const destinationColumnId = destinationColumnRecord.data.categoryId;

          // Check if the source and destination columns are the same
          if (sourceColumnId === destinationColumnId) {
            const destinationIndex = getReorderDestinationIndex({
              startIndex: indexOfSource!,
              indexOfTarget:
                selectedProject?.categories.findIndex(
                  (category) => category.id === destinationColumnId
                )! - 1,
              closestEdgeOfTarget: null,
              axis: "vertical",
            });

            reorderCard({
              columnId: sourceColumnId,
              startIndex: indexOfSource!,
              finishIndex: destinationIndex,
              taskId: draggedCardId,
            });
            return;
          }

          const destinationColumn = selectedProject?.categories.find(
            (col) => col.id === destinationColumnId
          );

          // Dropped in the empty space in the column
          const destinationIndex = getReorderDestinationIndex({
            startIndex: indexOfSource!,
            indexOfTarget: Number(destinationColumn?.tasks.length) || -1,
            closestEdgeOfTarget: null,
            axis: "vertical",
          });

          moveCard({
            movedCardIndexInSourceColumn: indexOfSource!,
            sourceColumnId,
            destinationColumnId,
            movedCardIndexInDestinationColumn: destinationIndex,
          });
        }
        if (location.current.dropTargets.length === 2) {
          const [destinationCardRecord, destinationColumnRecord] =
            location.current.dropTargets;

          // Retrieve the ID of the destination column
          const destinationColumnId = destinationColumnRecord.data.categoryId;

          // Retrieve the destination column data using the destination column ID
          const destinationColumn = selectedProject?.categories.find(
            (col) => col.id === destinationColumnId
          );

          if (destinationColumn) {
            // Find the index of the target card within the destination column's cards
            const indexOfTarget = destinationColumn.tasks.findIndex(
              (card) => card.id === destinationCardRecord.data.taskId
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
                taskId: draggedCardId,
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

      if (source.data.type === "category" && source.data.categoryId) {
        const sourceIndex = selectedProject?.categories.findIndex(
          (col) => col.id === source.data.categoryId
        );

        const destinationIndex = selectedProject?.categories.findIndex(
          (col) => col.id === location.current.dropTargets[0].data.categoryId
        );

        if (sourceIndex !== -1 && destinationIndex !== -1) {
          reorderColumn({
            sourceIndex,
            destinationIndex,
            sourceColumnId: source.data.categoryId,
            destinationColumnId:
              location.current.dropTargets[0].data.categoryId,
          });
        }
      }
    },
    [projectsData, reorderCard]
  );

  async function changePosition(
    sourceColumnId: string,
    destinationColumnId: string,
    newPosition: number,
    isCategoryUpdated?: boolean,
    taskId?: string
  ) {
    if (!selectedProjectId) {
      return toast.error("Something went wrong");
    }

    try {
      const res = await fetch(
        `/api/${isCategoryUpdated ? "category" : "task"}/update-position`,
        {
          method: "PUT",
          body: JSON.stringify({
            projectId: selectedProjectId,
            sourceColumnId,
            destinationColumnId,
            taskId,
            newPosition,
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message);
        return null;
      } else {
        return data;
      }
    } catch (error) {
      toast.error("Something went wrong");
      return null;
    }
  }

  useEffect(() => {
    return monitorForElements({
      // @ts-ignore
      onDrop: handleDrop,
    });
  }, [handleDrop]);

  useEffect(() => {
    if (projects && projects?.length > 0) {
      setProjectsData(projects);
      setSelectedProjectId(projects[0].id);
    }
  }, [projects]);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-semibold">{selectedProject?.name}</h1>
      <div className="flex gap-6">
        {selectedProject?.categories.map((category) => {
          return (
            <CategoryComponent
              key={category.id}
              category={category}
              project={selectedProject}
            />
          );
        })}
      </div>
    </div>
  );
}
