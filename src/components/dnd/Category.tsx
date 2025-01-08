import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Category as CategoryType } from "@/store/category";
import { Project } from "@/store/project";
import { Task as TaskType, useTaskStore } from "@/store/task";
import { SetStateAction, useEffect, useRef, useState } from "react";
import invariant from "tiny-invariant";

import { attachClosestEdge, extractClosestEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import { DropIndicator } from "@atlaskit/pragmatic-drag-and-drop-react-drop-indicator/box";
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import { draggable, dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { usePathname } from "next/navigation";
import { Icons } from "../others/icons";
import { Input } from "../ui/input";
import { UpdateProps } from "./Board";
import Task from "./Task";

interface ColumnProps {
  setTaskInput: React.Dispatch<React.SetStateAction<TaskType | undefined>>;
  setShowTaskForm: React.Dispatch<React.SetStateAction<boolean>>;
  setAction: React.Dispatch<React.SetStateAction<"create" | "update" | undefined>>;
  view: "list" | "board";
  project?: Project | null;
  category?: CategoryType;
  setProps: React.Dispatch<SetStateAction<UpdateProps | undefined>>;
  isLoading: boolean;
}

export default function Category({
  project,
  setTaskInput,
  setShowTaskForm,
  setAction,
  category,
  view,
  setProps,
  isLoading,
}: ColumnProps) {
  const categoryRef = useRef<HTMLDivElement>(null);
  const [isReordering, setIsReordering] = useState<boolean>(false);
  const [closestEdge, setClosestEdge] = useState(null);
  const todayEnd = new Date();
  const todayStart = new Date();
  const [showCreateCategory, setShowCreateCategory] = useState<boolean>(false);
  const [categoryName, setCategoryName] = useState<string>("");

  const pathname = usePathname();
  const { tasks: storeTasks } = useTaskStore();
  const [tasks, setTasks] = useState<TaskType[]>([]);

  useEffect(() => {
    if (pathname === "/app/today") {
      todayEnd.setHours(23, 59, 59, 999);
      todayStart.setHours(0, 0, 0, 0);

      const filteredTasks = storeTasks
        .filter((t) => {
          const dueDateObj = typeof t.dueDate === "string" ? new Date(t.dueDate) : t.dueDate;
          return todayStart <= dueDateObj && dueDateObj <= todayEnd;
        })
        .sort((a, b) => a.priority - b.priority);
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

  if (view === "board") {
    return (
      <div className="flex h-full w-64 flex-col gap-2 rounded-md p-2">
        {closestEdge && <DropIndicator edge={closestEdge} gap="10px" />}
        <span className={`h-3} text-sm font-semibold`}>
          {pathname === "/app/today"
            ? todayStart.getDate() + " " + todayStart.toLocaleString("default", { month: "long" })
            : category?.isDefault
              ? "(No Category)"
              : category?.name}
        </span>
        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-2" ref={categoryRef}>
            {category
              ? tasks.map((task) => {
                  if (task.categoryId === category?.id) {
                    return (
                      <Task
                        key={task.id}
                        task={task}
                        setTaskInput={setTaskInput}
                        setShowDialog={setShowTaskForm}
                        view="board"
                        setAction={setAction}
                        category={category}
                      />
                    );
                  }
                  return null;
                })
              : tasks.map((task) => {
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
                })}
          </div>
          <Button
            onClick={() => {
              setProps(undefined);
              setTaskInput(undefined);
              setAction("create");
              setShowTaskForm(true);
            }}
            disabled={isLoading}
            variant="outline"
          >
            Add Task
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-4">
      {closestEdge && <DropIndicator edge={closestEdge} gap="10px" />}
      {project && category ? (
        <div key={category.id} className="flex flex-col gap-4">
          {!category.isDefault && (
            <h2 className="text-xl font-semibold">
              {category.name}
              <Separator />
            </h2>
          )}
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
            disabled={isLoading}
            className="mx-5 self-start"
            variant="outline"
          >
            Add Task
          </Button>
          <div>
            {showCreateCategory ? (
              <div className="flex flex-col gap-2">
                <Input
                  value={categoryName}
                  onChange={(e) => {
                    setCategoryName(e.target.value);
                  }}
                  className="w-full"
                  placeholder="Category name"
                  autoFocus
                />
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      setProps(undefined);
                    }}
                    disabled={categoryName === "" || isLoading}
                  >
                    {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                    Create Category
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setCategoryName("");
                      setShowCreateCategory(false);
                    }}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <></>
            )}
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
