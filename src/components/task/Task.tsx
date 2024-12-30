"use client";

import BinIcon from "@/components/svg/BinIcon";
import EditIcon from "@/components/svg/EditIcon";
import FlagIcon from "@/components/svg/FlagIcon";
import OptionIcon from "@/components/svg/OptionIcon";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import UpdateStoreData from "@/lib/UpdateStoreData";
import { Task as TaskType } from "@/store/task";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import CompleteTaskButton from "./CompleteTaskButton";

import { attachClosestEdge, extractClosestEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import { draggable, dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import invariant from "tiny-invariant";
import { DropIndicator } from "@atlaskit/pragmatic-drag-and-drop-react-drop-indicator/box";

interface TaskProps {
  task: TaskType;
  taskInput?: TaskType | undefined;
  setTaskInput?: Dispatch<SetStateAction<TaskType | undefined>>;
  setShowDialog?: Dispatch<SetStateAction<boolean>>;
  setAction: Dispatch<SetStateAction<"create" | "update" | undefined>>;
  view: "list" | "board";
}

interface UpdateProps {
  task: TaskType;
  action: "create" | "update" | "delete";
}

export default function Task({ task, setTaskInput, setShowDialog, setAction, view }: TaskProps) {
  const [showMoreActions, setShowMoreActions] = useState<boolean>(false);
  const [props, setProps] = useState<UpdateProps | undefined>(undefined);
  // DND States
  const taskRef = useRef<HTMLDivElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [closestEdge, setClosestEdge] = useState(null);

  const flags = ["#de0a26", "#ffae42", "#1035ac", "#292D32"];

  useEffect(() => {
    setProps(undefined);
    const taskEl = taskRef.current;
    invariant(taskEl);

    return combine(
      // Add draggable to make the card draggable
      draggable({
        element: taskEl,
        getInitialData: () => ({ type: "task", taskId: task.id }),
        onDragStart: () => setIsDragging(true),
        onDrop: () => setIsDragging(false),
      }),
      // Add dropTargetForElements to make the card a drop target
      dropTargetForElements({
        element: taskEl,
        getData: ({ input, element, source }) => {
          // To attach card data to a drop target
          const data = { type: "task", taskId: task.id };

          if (source.data.type === "task") {
            return attachClosestEdge(data, {
              input,
              element,
              allowedEdges: ["top", "bottom"],
            });
          }

          return data;
        },
        onDragEnter: (args) => {
          if (args.source.data.taskId !== task.id) {
            // Update the closest edge when the draggable item enters the drop zone
            setClosestEdge(extractClosestEdge(args.self.data) as SetStateAction<null>);
          }
        },
        onDrag: (args) => {
          // Continuously update the closest edge while dragging over the drop zone
          if (args.source.data.taskId !== task.id) {
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
  }, [task.id]);

  async function completeTask() {
    try {
      const response = await fetch("/api/task/update", {
        method: "PUT",
        body: JSON.stringify({
          id: task.id,
          updateValue: {
            isCompleted: true,
          },
        }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.task) {
          toast("Task Completed🎉", {
            action: {
              label: "Undo",
              onClick: () => console.log(task.id),
            },
            duration: 3500,
          });
          return task;
        }
      } else {
        toast.error(data.message);
        return undefined;
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
      return undefined;
    }
  }

  async function handlePriority(priority: number) {
    if (task.priority === priority) {
      toast.success("Everything is up to date");
      setShowMoreActions(!showMoreActions);
      return;
    }

    try {
      const response = await fetch("/api/task/update", {
        method: "PUT",
        body: JSON.stringify({
          id: task.id,
          updateValue: {
            priority,
          },
        }),
      });

      const { task: resTask, message } = await response.json();

      if (response.ok) {
        if (resTask) {
          toast.success(message);
          setProps({
            task: resTask,
            action: "update",
          });
        }
      } else {
        toast.error(message);
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    } finally {
      setShowMoreActions(false);
    }
  }

  async function deleteTask() {
    try {
      const response = await fetch("/api/task/delete", {
        method: "DELETE",
        body: JSON.stringify({
          id: task.id,
        }),
      });

      const { task: resTask, message } = await response.json();
      if (response.ok) {
        if (resTask) {
          toast.success(message);
          setProps({
            task: resTask,
            action: "delete",
          });
        }
      } else {
        toast.error(message);
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    }
  }

  if (view === "board") {
    return (
      <div
        ref={taskRef}
        key={task.id}
        className={`relative flex w-full cursor-pointer select-none items-center justify-between gap-2 rounded-md border-[1px] p-2 ${isDragging ? "border-black bg-accent" : "border-border"}`}
      >
        <CompleteTaskButton task={task} completeTask={completeTask} />
        <div className="flex w-full flex-col">
          <span className="truncate font-medium">{task.title}</span>
          <span className="w-[70%] overflow-hidden truncate text-ellipsis text-xs text-muted-foreground">
            {task.description}
          </span>
        </div>
        {closestEdge && <DropIndicator edge={closestEdge} gap="10px" />}
      </div>
    );
  }

  return (
    <DropdownMenu
      open={showMoreActions}
      onOpenChange={(open) => {
        setShowMoreActions(open);
      }}
      modal={true}
    >
      {props && <UpdateStoreData data={props.task} action={props.action} type="task" />}

      <div
        ref={taskRef}
        className={`group relative flex cursor-pointer select-none items-center justify-between rounded px-2 py-5 ${isDragging && "bg-accent"}`}
      >
        {closestEdge && <DropIndicator edge={closestEdge} gap="1px" />}
        <div className="flex items-center gap-2">
          <CompleteTaskButton task={task} completeTask={completeTask} />
          <span>{task.title}</span>
        </div>
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger
              onClick={() => {
                if (setTaskInput && setShowDialog) {
                  setTaskInput(task);
                  setAction("update");
                  setShowDialog(true);
                }
              }}
            >
              <EditIcon className="h-6 rounded-sm p-0.5 opacity-0 hover:bg-accent group-hover:opacity-100" />
            </TooltipTrigger>
            <TooltipContent>Edit task</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild className="outline-none">
              <DropdownMenuTrigger>
                <OptionIcon
                  className={`h-6 rounded-sm p-0.5 opacity-0 hover:bg-accent ${showMoreActions && "opacity-100"} group-hover:opacity-100`}
                />
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>More actions</TooltipContent>
          </Tooltip>
        </div>
      </div>

      <DropdownMenuContent>
        <DropdownMenuItem className="cursor-pointer">
          <EditIcon className="h-6" />
          <span>Edit</span>
        </DropdownMenuItem>
        <Separator />
        <DropdownMenuLabel>
          <span className="text-xs font-semibold">Due Date</span>
        </DropdownMenuLabel>
        <Separator />
        <DropdownMenuLabel className="-mb-1">
          <span className="text-xs font-semibold">Priority</span>
        </DropdownMenuLabel>
        <div className="flex gap-1 px-1 pb-1">
          {flags.map((flag, index) => {
            return (
              <Tooltip key={index}>
                <TooltipTrigger>
                  <FlagIcon
                    className="h-7 rounded p-1 hover:bg-accent"
                    color={flag}
                    fill={index + 1 !== flags.length}
                    onClick={() => handlePriority(index + 1)}
                  />
                </TooltipTrigger>
                <TooltipContent>Priority {index + 1}</TooltipContent>
              </Tooltip>
            );
          })}
        </div>
        <Separator />
        <DropdownMenuItem className="cursor-pointer" onClick={deleteTask}>
          <BinIcon color="#de0a26" />
          <span className="text-sm text-[#de0a26]">Delete</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
