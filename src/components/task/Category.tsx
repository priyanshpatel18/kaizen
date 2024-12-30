import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Category as CategoryType } from "@/store/category";
import { Project } from "@/store/project";
import { Task as TaskType, useTaskStore } from "@/store/task";
import { SetStateAction, useEffect, useRef, useState } from "react";
import invariant from "tiny-invariant";

import { DropIndicator } from "@atlaskit/pragmatic-drag-and-drop-react-drop-indicator/box";
import { attachClosestEdge, extractClosestEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import { draggable, dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { usePathname } from "next/navigation";
import Task from "./Task";
import { UpdateProps } from "../templates/BoardTemplate";

interface ColumnProps {
  setTaskInput: React.Dispatch<React.SetStateAction<TaskType | undefined>>;
  setShowTaskForm: React.Dispatch<React.SetStateAction<boolean>>;
  setAction: React.Dispatch<React.SetStateAction<"create" | "update" | undefined>>;
  view: "list" | "board";
  project?: Project | null;
  category?: CategoryType;
  setProps: React.Dispatch<SetStateAction<UpdateProps | undefined>>;
}

export default function Category({
  project,
  setTaskInput,
  setShowTaskForm,
  setAction,
  category,
  view,
  setProps,
}: ColumnProps) {
  const categoryRef = useRef<HTMLDivElement>(null);
  const [isReordering, setIsReordering] = useState<boolean>(false);
  const [closestEdge, setClosestEdge] = useState(null);

  const pathname = usePathname();
  const { tasks: storeTasks } = useTaskStore();
  const [tasks, setTasks] = useState<TaskType[]>([]);

  useEffect(() => {
    if (pathname === "/today") {
      const todayEnd = new Date();
      const todayStart = new Date();
      todayEnd.setHours(23, 59, 59, 999);
      todayStart.setHours(0, 0, 0, 0);

      const filteredTasks = storeTasks.filter((t) => {
        const dueDateObj = typeof t.dueDate === "string" ? new Date(t.dueDate) : t.dueDate;
        return todayStart <= dueDateObj && dueDateObj <= todayEnd;
      });
      setTasks(filteredTasks);
      return;
    }

    const taskMap = new Map(storeTasks.map((task) => [task.id, task]));
    const getFilteredTasks = (taskIds: string[] | undefined): TaskType[] => {
      if (!taskIds) return [];
      return taskIds.map((id) => taskMap.get(id)).filter((task): task is TaskType => !!task);
    };

    const filteredTasks = getFilteredTasks(category?.taskIds);

    setTasks(filteredTasks);
  }, [category, storeTasks]);

  useEffect(() => {
    if (isReordering) {
      document.body.style.cursor = "grabbing";
    } else {
      document.body.style.cursor = "default";
    }
  }, [isReordering]);

  useEffect(() => {
    if (category) {
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
    }
  }, []);

  if (view === "board" && category) {
    return (
      <div key={category.id} className="flex h-full w-full max-w-64 flex-col gap-2 rounded-md p-2">
        {closestEdge && <DropIndicator edge={closestEdge} gap="10px" />}
        <span className={`h-3} text-sm font-semibold`}>{category.isDefault ? "(No Category)" : category.name}</span>
        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-2" ref={categoryRef}>
            {tasks.map((task) => {
              if (task.categoryId === category.id) {
                return (
                  <Task
                    key={task.id}
                    task={task}
                    setTaskInput={setTaskInput}
                    setShowDialog={setShowTaskForm}
                    view="board"
                    setAction={setAction}
                  />
                );
              }
              return null;
            })}
          </div>
          <Button
            onClick={() => {
              setProps(undefined);
              setTaskInput(undefined);
              setAction("create");
              setShowTaskForm(true);
            }}
            variant="outline"
          >
            Add Task
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {closestEdge && <DropIndicator edge={closestEdge} gap="10px" />}
      {project && category ? (
        <div key={category.id} className="flex flex-col gap-4">
          {!category.isDefault && <h2 className="text-xl font-semibold">{category.name}</h2>}
          <div className="flex flex-col" ref={categoryRef}>
            {tasks.map((task) => {
              if (task.categoryId === category.id) {
                return (
                  <div key={task.id} className="flex flex-col">
                    <Task
                      key={task.id}
                      task={task}
                      setTaskInput={setTaskInput}
                      setShowDialog={setShowTaskForm}
                      setAction={setAction}
                      view="list"
                    />
                    <Separator />
                  </div>
                );
              }
            })}
          </div>
          <Button
            onClick={() => {
              setProps(undefined);
              setTaskInput(undefined);
              setAction("create");
              setShowTaskForm(true);
            }}
            className="self-start"
            variant="outline"
          >
            Add Task
          </Button>
          <div className="relative cursor-pointer opacity-0 transition-opacity duration-300 hover:opacity-100">
            <Separator />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-gray-600">
              Add Category
            </span>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div>
            {tasks.map((task) => {
              return (
                <div key={task.id} className="flex flex-col">
                  <Task
                    key={task.id}
                    task={task}
                    setTaskInput={setTaskInput}
                    setShowDialog={setShowTaskForm}
                    setAction={setAction}
                    view="list"
                  />
                  <Separator />
                </div>
              );
            })}
          </div>
          <Button
            onClick={() => {
              setProps(undefined);
              setTaskInput(undefined);
              setAction("create");
              setShowTaskForm(true);
            }}
            className="self-start"
            variant="outline"
          >
            Add Task
          </Button>
        </div>
      )}
    </div>
  );
}
