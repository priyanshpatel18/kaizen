"use client";

import { extractClosestEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import { getReorderDestinationIndex } from "@atlaskit/pragmatic-drag-and-drop-hitbox/util/get-reorder-destination-index";
import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { reorder } from "@atlaskit/pragmatic-drag-and-drop/reorder";
import {
  Dispatch,
  ReactNode,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from "react";
// @ts-ignore
import { useProjectDetails } from "@/hooks/useProjectDetails";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import CategoryColumn from "./CategoryColumn";

const DATA: ColumnProps[] = [
  {
    id: "ae534b11-d8e6-413e-8112-542275e1a1cd",
    title: "TODO",
    cards: [
      { id: "1", content: "Understand the concepts" },
      { id: "2", content: "Ask for help" },
      { id: "3", content: "Apply what I've learned" },
    ],
  },
  {
    id: "b1e56c11-c555-490f-a1d0-64e7b2b8c524",
    title: "IN PROGRESS",
    cards: [
      { id: "4", content: "Watch the video" },
      { id: "5", content: "Clear your doubts" },
      { id: "6", content: "Master the concepts" },
    ],
  },
  {
    id: "c2c4a3e2-9b99-4110-9154-62ee6d193b76",
    title: "COMPLETED",
    cards: [
      { id: "7", content: "Review the notes" },
      { id: "8", content: "Prepare for the exam" },
    ],
  },
];

interface HandleDropProps {
  source: {
    data: {
      type: string;
      cardId?: string;
      columnId?: string;
    };
    element: ReactNode;
  };
  location: any;
}

interface CardProps {
  id: string;
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
  cardId: string;
}

interface MoveCardProps {
  movedCardIndexInSourceColumn: number;
  sourceColumnId: string;
  destinationColumnId: string;
  movedCardIndexInDestinationColumn?: number;
}

export interface ProjectState {
  id: string;
  name: string;
  userId: string;
  categories: ProjectCategory[];
}

interface ProjectCategory {
  id: string;
  title: string;
  projectId: string;
  tasks: Tasks[];
}

interface Tasks {
  id: string;
  title: string;
  description?: string;
  priority: number;
  isCompleted: boolean;
  categoryId: string;
}

export default function Project() {
  const [data, setData] = useState(DATA);
  const { projects } = useProjectDetails();
  const [projectsData, setProjectsData] = useState<ProjectState[] | null>(null);
  const [selectedProject, setSelectedProject] = useState<ProjectState | null>(
    null
  );

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
    ({ columnId, startIndex, finishIndex, cardId }: ReorderCardProps) => {
      // Ensure the startIndex and finishIndex are different; no need to reorder if they’re the same
      if (startIndex === finishIndex) return;

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
          changeCardPosition(columnId, columnId, cardId, finishIndex);
        }

        setSelectedProject((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            categories: newData || [],
          };
        });

        setProjectsData((prev) => {
          return (
            prev?.map((project) => {
              if (project.id === selectedProject?.id) {
                return {
                  ...project,
                  categories: newData || [],
                };
              }
              return project;
            }) || []
          );
        });
      }
    },
    [projectsData]
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
        const sourceColumnData = selectedProject?.categories.find(
          (category) => category.id === sourceColumnId
        );

        // Get the index of the card in the source column
        const indexOfSource = sourceColumnData?.tasks.findIndex(
          (task) => task.id === draggedCardId
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
                selectedProject?.categories.findIndex(
                  (col) => col.id === destinationColumnId
                )! - 1,
              closestEdgeOfTarget: null,
              axis: "vertical",
            });

            reorderCard({
              columnId: sourceColumnId,
              startIndex: indexOfSource!,
              finishIndex: destinationIndex,
              cardId: draggedCardId,
            });
            return;
          }

          const destinationIndex = getReorderDestinationIndex({
            startIndex: indexOfSource!,
            indexOfTarget:
              selectedProject?.categories.findIndex(
                (col) => col.id === destinationColumnId
              )! - 1,
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
          const destinationColumn = selectedProject?.categories.find(
            (col) => col.id === destinationColumnId
          );

          if (destinationColumn) {
            // Find the index of the target card within the destination column's cards
            const indexOfTarget = destinationColumn.tasks.findIndex(
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
                cardId: draggedCardId,
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
    [projectsData, reorderCard]
  );

  async function changeCardPosition(
    sourceColumnId: string,
    destinationColumnId: string,
    taskId: string,
    newPosition: number
  ) {
    const projectId = selectedProject?.id;
    if (!projectId) {
      return toast.error("Something went wrong");
    }

    try {
      const res = await fetch("/api/task/update-position", {
        method: "POST",
        body: JSON.stringify({
          projectId,
          sourceColumnId,
          destinationColumnId,
          taskId,
          newPosition,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        return toast.error(data.message);
      }
    } catch (error) {
      return toast.error("Something went wrong");
    }
  }

  useEffect(() => {
    return monitorForElements({
      // @ts-ignore
      onDrop: handleDrop,
    });
  }, [handleDrop]);

  useEffect(() => {
    if (projects) {
      setProjectsData(projects);
      setSelectedProject(projects[0]);
    }
  }, [projects]);

  return (
    <div className="w-full p-6 select-none bg-gray-950 flex flex-col min-h-screen gap-4 text-white">
      <div className="flex gap-10 items-start">
        <FormComponent
          projectsData={projectsData}
          setProjectsData={setProjectsData}
        />
        <div className="flex gap-4">
          {projectsData?.map((project) => {
            return (
              <h1
                className="border-muted-foreground hover:border-border border-[1px] px-3 py-1 rounded cursor-pointer"
                key={project.id}
                onClick={() => setSelectedProject(project)}
              >
                {project.name}
              </h1>
            );
          })}
        </div>
      </div>

      <div className="flex gap-10 flex-1">
        {selectedProject?.categories.map((category) => {
          return (
            <CategoryColumn
              key={category.id}
              title={category.title}
              tasks={category.tasks}
              id={category.id}
              projectsData={projectsData}
              setProjectsData={setProjectsData}
              projectId={selectedProject?.id}
            />
          );
        })}
      </div>
    </div>
  );
}

interface FormProps {
  projectsData: ProjectState[] | null;
  setProjectsData: Dispatch<SetStateAction<ProjectState[] | null>>;
}

function FormComponent({ projectsData, setProjectsData }: FormProps) {
  const [columnTitle, setColumnTitle] = useState<string>("");
  const [projectTitle, setProjectTitle] = useState<string>("");
  const [projectExists, setProjectExists] = useState<boolean>(false);

  async function createProject(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!projectTitle) {
      return toast.error("Project title is required");
    }

    const formData = new FormData();
    formData.append("name", projectTitle);

    try {
      const res = await fetch("/api/project/create-project", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message);
      } else {
        toast.success(data.message);
        setProjectTitle("");
        if (projectsData) {
          setProjectsData([...projectsData, data.project]);
          return;
        }
        setProjectsData([data.project]);
      }
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className="flex items-center gap-6">
      {projectExists ? (
        <form className="flex flex-col gap-4 p-4 rounded-lg shadow-md border-muted-foreground border-[1px]">
          <h1>Create Category</h1>
          <Input
            type="text"
            placeholder="Enter Category"
            value={columnTitle}
            onChange={(e) => setColumnTitle(e.target.value)}
            className="bg-gray-900 text-gray-200 border-muted-foreground focus:border-border"
          />
          <Button
            type="submit"
            variant="secondary"
            className="px-4 py-2 text-gray-200 bg-indigo-600 rounded-md hover:bg-indigo-700 transition"
          >
            Create Category
          </Button>
        </form>
      ) : (
        <form
          className="flex flex-col gap-4 p-4 rounded-lg shadow-md border-muted-foreground border-[1px]"
          onSubmit={createProject}
        >
          <h1>Create Project</h1>
          <Input
            type="text"
            placeholder="Enter Category"
            value={projectTitle}
            onChange={(e) => setProjectTitle(e.target.value)}
            className="bg-gray-900 text-gray-200 border-muted-foreground focus:border-border"
          />
          <Button
            type="submit"
            variant="secondary"
            className="px-4 py-2 text-gray-200 bg-indigo-600 rounded-md hover:bg-indigo-700 transition"
          >
            Create Project
          </Button>
        </form>
      )}
    </div>
  );
}
