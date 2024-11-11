"use client";

import { Category, Project, useStore } from "@/store";
import {
  attachClosestEdge,
  extractClosestEdge,
} from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import { DropIndicator } from "@atlaskit/pragmatic-drag-and-drop-react-drop-indicator/box";
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import {
  draggable,
  dropTargetForElements,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import {
  Dispatch,
  FormEvent,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";
import invariant from "tiny-invariant";
import CreateTaskForm from "../sidebar/CreateTaskForm";
import { Button } from "../ui/button";
import { Dialog, DialogTrigger } from "../ui/dialog";
import { Input } from "../ui/input";
import TaskCard from "./Task";

interface CategoryProps {
  category: Category;
  project: Project | undefined;
}

export interface Data {
  label: string;
  value: string;
}

export default function CategoryComponent({
  category,
  project,
}: CategoryProps) {
  const categoryRef = useRef<HTMLDivElement>(null);
  const [isReordering, setIsReordering] = useState<boolean>(false);
  const [closestEdge, setClosestEdge] = useState(null);

  const [currentState, setCurrentState] = useState<Data | null>(null);
  const [showDialog, setShowDialog] = useState<boolean>(false);

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
            setClosestEdge(
              extractClosestEdge(args.self.data) as SetStateAction<null>
            );
          }
        },
        onDrag: (args) => {
          // Continuously update the closest edge while dragging over the drop zone
          if (args.source.data.categoryId !== category.id) {
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
  }, [category.id]);

  return (
    <div
      className={`flex flex-col p-2 rounded-lg hover:border-border       
          ${isReordering && "opacity-30"} relative`}
      ref={categoryRef}
    >
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <h2 className="font-montserrat font-semibold text-md mb-2">
          {category.name}
        </h2>
        <div className="p-2 flex gap-6 items-start">
          <div className="flex flex-col gap-2">
            <div className="flex flex-col max-h-fit gap-2 overflow-y-auto">
              {category.tasks.map((task, index) => (
                <TaskCard
                  key={index}
                  task={task}
                  taskId={task.id}
                  title={task.title}
                />
              ))}
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setCurrentState({
                  label: `${project?.name} # ${category.name}`,
                  value: `${project?.id} # ${category.id}`,
                });
              }}
              className="w-[200px]"
              asChild
            >
              <DialogTrigger className="flex items-center w-full gap-2 justify-center">
                <span>Add Task</span>
              </DialogTrigger>
            </Button>
          </div>
        </div>
        {closestEdge && <DropIndicator edge={closestEdge} gap="24px" />}
        <CreateTaskForm
          currentState={currentState}
          setCurrentState={setCurrentState}
          setShowDialog={setShowDialog}
        />
      </Dialog>
    </div>
  );
}
