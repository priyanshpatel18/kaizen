"use client";

import { Category, Option, Project as ProjectState, useStore } from "@/store";
import { extractClosestEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import { getReorderDestinationIndex } from "@atlaskit/pragmatic-drag-and-drop-hitbox/util/get-reorder-destination-index";
import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { reorder } from "@atlaskit/pragmatic-drag-and-drop/reorder";
import { Dispatch, FormEvent, ReactNode, SetStateAction, useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
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
  project: ProjectState | null;
  setProject: Dispatch<SetStateAction<ProjectState | null>>;
  currentState: Option | null;
  setCurrentState: Dispatch<SetStateAction<Option | null>>;
  workspaceId: string | null;
}

export default function Project({ project, setProject, workspaceId }: IProps) {
  const [showCategoryInput, setShowCategoryInput] = useState<boolean>(false);
  const [categoryName, setCategoryName] = useState<string>("");
  const store = useStore();

  // CANNOT CHECK
  const reorderColumn = useCallback(
    // ({ sourceIndex, destinationIndex, sourceColumnId, destinationColumnId }: ReorderColumnProps) => {
    ({ sourceIndex, destinationIndex }: ReorderColumnProps) => {
      if (sourceIndex === undefined || destinationIndex === undefined) return;

      if (!project) return;

      const updatedCategories = reorder({
        list: project.categories,
        startIndex: sourceIndex,
        finishIndex: destinationIndex,
      });

      const updatedProject = {
        ...project,
        categories: updatedCategories,
      };

      // changePosition(
      //   sourceColumnId,
      //   destinationColumnId,
      //   destinationIndex,
      //   true
      // );

      // Update the project state
      setProject(updatedProject);
    },
    [project]
  );

  const moveCard = useCallback(
    async ({
      movedCardIndexInSourceColumn,
      sourceColumnId,
      destinationColumnId,
      movedCardIndexInDestinationColumn = 0,
    }: MoveCardProps) => {
      // Ensure source and destination columns exist
      if (!project) return;

      const sourceColumnData = project?.categories.find((column) => column.id === sourceColumnId);
      const destinationColumnData = project?.categories.find((column) => column.id === destinationColumnId);

      if (!sourceColumnData || !destinationColumnData) {
        console.error("Invalid source or destination column ID");
        return;
      }

      // Ensure the card index in source column is valid
      if (movedCardIndexInSourceColumn < 0 || movedCardIndexInSourceColumn >= sourceColumnData.tasks.length) {
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
      const destinationIndex = Math.min(movedCardIndexInDestinationColumn, updatedDestinationCards.length);
      updatedDestinationCards.splice(destinationIndex, 0, cardToMove);

      // Update the state with the modified source and destination columns
      const newData = project?.categories.map((column) => {
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

      setProject({
        ...project,
        categories: newData || [],
      });
      const updatedWorkspaces = store.workspaces?.map((ws) => {
        if (ws.id === workspaceId) {
          const newProjects = ws.projects.map((p) => {
            if (p.id === project?.id) {
              return {
                ...project,
                categories: newData || [],
              };
            }
            return p;
          });

          return {
            ...ws,
            projects: newProjects,
          };
        }
        return ws;
      });
      store.setWorkspaces(updatedWorkspaces || []);

      if (newData) {
        changePosition(sourceColumnId, destinationColumnId, destinationIndex, false, cardToMove.id);
      }
    },
    [project]
  );

  // CHECKED
  const reorderCard = useCallback(
    async ({ columnId, startIndex, finishIndex, taskId }: ReorderCardProps) => {
      // Ensure the startIndex and finishIndex are different; no need to reorder if they’re the same
      if (startIndex === finishIndex) return;

      // Find the source column by ID
      const sourceColumnData = project?.categories.find((column) => column.id === columnId);

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

        const newData = project?.categories.map((col) => {
          if (col.id === columnId) {
            return updatedSourceColumn;
          }
          return col;
        });

        setProject({
          ...project,
          categories: newData || [],
        });
        const updatedWorkspaces = store.workspaces?.map((ws) => {
          if (ws.id === workspaceId) {
            const newProjects = ws.projects.map((p) => {
              if (p.id === project?.id) {
                return {
                  ...project,
                  categories: newData || [],
                };
              }
              return p;
            });

            return {
              ...ws,
              projects: newProjects,
            };
          }
          return ws;
        });
        store.setWorkspaces(updatedWorkspaces || []);

        // Send request to database
        if (project?.categories.find((col) => col.id === columnId)) {
          changePosition(columnId, columnId, finishIndex, false, taskId);
        }
      }
    },
    [project]
  );

  const handleDrop = useCallback(
    ({ source, location }: HandleDropProps) => {
      // Early return if there are no drop targets in the current location
      const destination = location.current.dropTargets.length;
      if (!destination || !project) return;

      if (source.data.type === "task" && source.data.taskId) {
        // Retrieve the ID of the card being dragged
        const draggedCardId = source.data.taskId;

        // Get the source column from the initial drop targets
        const [, sourceColumnRecord] = location.initial.dropTargets;

        // Retrieve the ID of the source column
        const sourceColumnId = sourceColumnRecord.data.categoryId;

        // Get the data of the source column
        const sourceColumnData = project?.categories.find((category) => category.id === sourceColumnId);

        // Get the index of the card in the source column
        const indexOfSource = sourceColumnData?.tasks.findIndex((task) => task.id === draggedCardId);

        if (location.current.dropTargets.length === 1) {
          // Tasks are dropped in the different column
          const [destinationColumnRecord] = location.current.dropTargets;

          // Retrieve the ID of the destination column
          const destinationColumnId = destinationColumnRecord.data.categoryId;

          // Check if the source and destination columns are the same
          if (sourceColumnId === destinationColumnId) {
            const destinationIndex = getReorderDestinationIndex({
              startIndex: indexOfSource!,
              indexOfTarget: project?.categories.findIndex((category) => category.id === destinationColumnId) - 1,
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

          const destinationColumn = project?.categories.find((col) => col.id === destinationColumnId);

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
          const [destinationCardRecord, destinationColumnRecord] = location.current.dropTargets;

          // Retrieve the ID of the destination column
          const destinationColumnId = destinationColumnRecord.data.categoryId;

          // Retrieve the destination column data using the destination column ID
          const destinationColumn = project?.categories.find((col) => col.id === destinationColumnId);

          if (destinationColumn) {
            // Find the index of the target card within the destination column's cards
            const indexOfTarget = destinationColumn.tasks.findIndex(
              (card) => card.id === destinationCardRecord.data.taskId
            );

            // Determine the closest edge of the target card: top or bottom
            const closestEdgeOfTarget = extractClosestEdge(destinationCardRecord.data);

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

            const destinationIndex = closestEdgeOfTarget === "bottom" ? indexOfTarget + 1 : indexOfTarget;

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
        const sourceIndex = project?.categories.findIndex((col) => col.id === source.data.categoryId);

        const destinationIndex = project?.categories.findIndex(
          (col) => col.id === location.current.dropTargets[0].data.categoryId
        );

        if (sourceIndex !== -1 && destinationIndex !== -1) {
          reorderColumn({
            sourceIndex,
            destinationIndex,
            sourceColumnId: source.data.categoryId,
            destinationColumnId: location.current.dropTargets[0].data.categoryId,
          });
        }
      }
    },
    [project, reorderCard]
  );

  async function changePosition(
    sourceColumnId: string,
    destinationColumnId: string,
    newPosition: number,
    isCategoryUpdated?: boolean,
    taskId?: string
  ) {
    if (!project?.id) {
      return toast.error("Something went wrong");
    }

    try {
      const res = await fetch(`/api/${isCategoryUpdated ? "category" : "task"}/update-position`, {
        method: "PUT",
        body: JSON.stringify({
          projectId: project.id,
          sourceCategoryId: sourceColumnId,
          destinationCategoryId: destinationColumnId,
          taskId,
          newPosition,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message);
        return null;
      } else {
        return data;
      }
    } catch (error) {
      console.error(error);
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

  async function createCategory(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!project || !project.id) {
      return toast.error("Project not found");
    }
    if (!categoryName) {
      return toast.error("Category name is required");
    }

    const formData = new FormData();
    formData.append("name", categoryName);
    formData.append("projectId", project.id);

    try {
      const res = await fetch("/api/category/create", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        return toast.error(data.message);
      } else {
        toast.success(data.message);
        setShowCategoryInput(false);
        setCategoryName("");

        if (data.category as Category) {
          setProject({
            ...project,
            categories: [...project.categories, data.category as Category],
          });
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    } finally {
      setShowCategoryInput(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-semibold">{project?.name}</h1>
      <div className="flex gap-6">
        {project?.categories.map((category) => {
          return <CategoryComponent key={category.id} category={category} project={project} />;
        })}
        {showCategoryInput ? (
          <form className="flex flex-col gap-2" onSubmit={createCategory}>
            <Input
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              className="w-[300px]"
              placeholder="Category Name"
              type="text"
              required
              autoFocus
            />
            <div className="flex gap-2">
              <Button type="submit" className="w-[200px]">
                Add Category
              </Button>
              <div
                className="border-muted-background flex cursor-pointer items-center rounded-md border-2 px-4 hover:bg-accent"
                onClick={() => setShowCategoryInput(false)}
              >
                Cancel
              </div>
            </div>
          </form>
        ) : (
          <Button variant="outline" onClick={() => setShowCategoryInput(!showCategoryInput)} className="w-[200px]">
            Add Category
          </Button>
        )}
      </div>
    </div>
  );
}
