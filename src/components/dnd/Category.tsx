"use client";

import { Category, Option, Project } from "@/store";
import { attachClosestEdge, extractClosestEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import { DropIndicator } from "@atlaskit/pragmatic-drag-and-drop-react-drop-indicator/box";
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import { draggable, dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { SetStateAction, useEffect, useRef, useState } from "react";
import invariant from "tiny-invariant";
import CreateTaskForm from "../forms/CreateTaskForm";
import { Button } from "../ui/button";
import { Dialog, DialogTrigger } from "../ui/dialog";
import { ScrollArea } from "../ui/scroll-area";
import TaskCard from "./Task";

interface CategoryProps {
  category: Category;
  project: Project | null;
}

export default function CategoryComponent({ category, project }: CategoryProps) {
  const categoryRef = useRef<HTMLDivElement>(null);
  const [isReordering, setIsReordering] = useState<boolean>(false);
  const [closestEdge, setClosestEdge] = useState(null);
  const [showDialog, setShowDialog] = useState<boolean>(false);

  const [taskOption, setTaskOption] = useState<Option | null>(null);

  useEffect(() => {
    const categoryEl = categoryRef.current;
    invariant(categoryEl);

    return combine(
      // Make the category draggable
      draggable({
        element: categoryEl,
        getInitialData: () => ({ type: "category", categoryId: category.id }),
        onDragStart: () => setIsReordering(true),
        onDrop: () => setIsReordering(false),
      }),
      // Make the category a drop target
      dropTargetForElements({
        element: categoryEl,
        getData: ({ input, element, source }) => {
          // To attach card data to a drop target
          const data = { type: "category", categoryId: category.id };

          if (source.data.type === "category") {
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
          if (args.source.data.categoryId !== category.id) {
            // Update the closest edge when the draggable item enters the drop zone
            setClosestEdge(extractClosestEdge(args.self.data) as SetStateAction<null>);
          }
        },
        onDrag: (args) => {
          // Continuously update the closest edge while dragging over the drop zone
          if (args.source.data.categoryId !== category.id) {
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
  }, [category.id]);

  return (
    <div
      className={`flex flex-col rounded-lg hover:border-border ${isReordering && "opacity-30"} relative`}
      ref={categoryRef}
    >
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <h2 className="text-md font-montserrat mb-2 font-semibold">{category.name}</h2>
        <div className="flex items-start gap-6">
          <div className="flex flex-col gap-2">
            <ScrollArea className="max-h-fit overflow-y-auto">
              <div className="flex flex-col gap-2">
                {category.tasks.map((task, index) => (
                  <TaskCard key={index} task={task} taskId={task.id} title={task.title} />
                ))}
              </div>
            </ScrollArea>
            <Button
              variant="outline"
              onClick={() => {
                setTaskOption({
                  label: `${project?.name} # ${category.name}`,
                  value: `${project?.id} # ${category.id}`,
                });
              }}
              className="w-[200px] focus:border-none focus:ring-0"
              asChild
            >
              <DialogTrigger className="flex items-center justify-center gap-2">
                <span>Add Task</span>
              </DialogTrigger>
            </Button>
          </div>
        </div>
        {closestEdge && <DropIndicator edge={closestEdge} gap="24px" />}
        <CreateTaskForm taskOption={taskOption} project={project} setShowDialog={setShowDialog} />
      </Dialog>
    </div>
  );
}
