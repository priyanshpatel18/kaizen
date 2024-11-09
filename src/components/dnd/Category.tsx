import { Category, Project } from "@/store";
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
import { SetStateAction, useEffect, useRef, useState } from "react";
import invariant from "tiny-invariant";
import CreateTaskForm from "../sidebar/CreateTaskForm";
import { Button } from "../ui/button";
import { Dialog, DialogTrigger } from "../ui/dialog";
import TaskCard from "./Task";

interface CategoryProps {
  category: Category;
  project: Project;
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
      // Make the card draggable
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
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <div
        className={`flex flex-col p-2 rounded-lg hover:border-border       
          ${isReordering && "opacity-30"} relative`}
        ref={categoryRef}
      >
        <h2 className="font-montserrat font-semibold text-md mb-2">
          {category.name}
        </h2>
        <div className="space-y-2 p-2">
          {category.tasks.map((task, index) => (
            <TaskCard key={index} task={task} />
          ))}
          <Button
            variant="outline"
            onClick={() => {
              setCurrentState({
                label: `${project.name} # ${category.name}`,
                value: `${project.id} # ${category.id}`,
              });
            }}
            className="w-full"
            asChild
          >
            <DialogTrigger className="flex items-center w-full gap-2 justify-center">
              <span>Add Task</span>
            </DialogTrigger>
          </Button>
        </div>
        {closestEdge && <DropIndicator edge={closestEdge} gap="25px" />}
      </div>
      <CreateTaskForm
        currentState={currentState}
        setCurrentState={setCurrentState}
        setShowDialog={setShowDialog}
      />
    </Dialog>
  );
}
