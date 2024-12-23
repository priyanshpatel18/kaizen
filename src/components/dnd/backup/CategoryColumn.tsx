"use client";

import { attachClosestEdge, extractClosestEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import { draggable, dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { Dispatch, FormEvent, SetStateAction, useEffect, useRef, useState } from "react";
// @ts-ignore
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Project } from "@/store";
import { DropIndicator } from "@atlaskit/pragmatic-drag-and-drop-react-drop-indicator/box";
import { toast } from "sonner";
import invariant from "tiny-invariant";
import TaskCard from "./TaskCard";

interface ColumnProps {
  name: string;
  id: string;
  projectId?: string;
  projectsData: Project[] | null;
  setProjectsData: Dispatch<SetStateAction<Project[] | null>>;
}

export default function CategoryColumn({ name, id, projectId, projectsData, setProjectsData }: ColumnProps) {
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
        getData: ({ input, element, source }) => {
          // To attach card data to a drop target
          const data = { type: "column", columnId: id };

          if (source.data.type === "column") {
            return attachClosestEdge(data, {
              input,
              element,
              allowedEdges: ["left", "right"],
            });
          }

          return data;
        },
        getIsSticky: () => true,
        onDragEnter: (args) => {
          if (args.source.data.columnId !== id) {
            // Update the closest edge when the draggable item enters the drop zone
            setClosestEdge(extractClosestEdge(args.self.data) as SetStateAction<null>);
          }
        },
        onDrag: (args) => {
          // Continuously update the closest edge while dragging over the drop zone
          if (args.source.data.columnId !== id) {
            setClosestEdge(extractClosestEdge(args.self.data) as SetStateAction<null>);
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

  const [taskTitle, setTaskTitle] = useState<string>("");

  async function createTask(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!taskTitle) return toast.error("Task title is required");

    try {
      const formData = new FormData();
      formData.append("title", taskTitle);
      formData.append("categoryId", id);

      const res = await fetch("/api/task/create", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message);
      } else {
        toast.success(data.message);
        setTaskTitle("");

        // Find the project that matches projectId
        const selectedProject = projectsData?.find((project) => project.id === projectId);

        selectedProject?.categories.forEach((category) => {
          if (category.id === id) {
            category.tasks?.push(data.task);
          }
        });

        if (selectedProject) {
          setProjectsData(
            (prev) =>
              prev?.map((project) => {
                return project.id === projectId ? selectedProject : project;
              }) || null
          );
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    }
  }

  return (
    <div
      className={`flex min-w-[300px] flex-col rounded-lg border-[1px] border-muted-foreground p-4 hover:border-border ${isReordering && "opacity-30"} relative`}
      ref={columnRef}
    >
      <h1 className="mb-1 text-lg font-bold">{name}</h1>
      <h3 className="mb-4 text-xs">{id}</h3>
      <form
        className="mb-4 flex flex-col gap-2 rounded-lg border-[0.5px] border-muted-foreground p-2"
        onSubmit={createTask}
      >
        <Input
          value={taskTitle}
          onChange={(e) => setTaskTitle(e.target.value)}
          placeholder="Task Title"
          type="text"
          className="border-muted-foreground bg-gray-900 text-gray-200 focus:border-border"
        />
        <Button variant="secondary" type="submit">
          Create Task
        </Button>
      </form>
      <div className="flex-1 space-y-2">
        {projectsData?.map((project) => {
          return project.categories.map((category) => {
            if (category.id === id && category.tasks) {
              return category.tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  id={task.id}
                  title={task.title}
                  description={task.description}
                  priority={task.priority}
                  isCompleted={task.isCompleted}
                  categoryId={task.categoryId}
                />
              ));
            }
          });
        })}
      </div>
      {closestEdge && <DropIndicator edge={closestEdge} gap="40px" />}
    </div>
  );
}
