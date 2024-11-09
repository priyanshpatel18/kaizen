"use client";

import {
  Dialog,
  DialogTrigger
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { FormEvent, useState } from "react";
import { toast } from "sonner";
import { SidebarMenu, SidebarMenuButton } from "../ui/sidebar";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import CreateTaskForm from "./CreateTaskForm";

export interface Data {
  label: string;
  value: string;
}

export default function CreateTask() {
  const [taskTitle, setTaskTitle] = useState<string>("");
  const [showCreateTask, setShowCreateTask] = useState<boolean>(false);
  const [currentState, setCurrentState] = useState<Data | null>(null);

  async function createTask(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!taskTitle || !currentState) {
      return toast.error("Task title is required");
    }

    try {
      const formData = new FormData();
      formData.append("title", taskTitle);
      formData.append("categoryId", currentState.value.split("#")[1]);

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
        setShowCreateTask(false);
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    }
  }

  return (
    <Dialog
      open={showCreateTask}
      onOpenChange={() => {
        setShowCreateTask(!showCreateTask);
        setTaskTitle("");
      }}
    >
      <SidebarMenu>
        <SidebarMenuButton onClick={() => setShowCreateTask(!showCreateTask)}>
          <DialogTrigger className="flex items-center w-full gap-2" asChild>
            <div>
              <span>Create Task</span>
            </div>
          </DialogTrigger>
          <Tooltip>
            <TooltipTrigger asChild>
              <Plus />
            </TooltipTrigger>
            <TooltipContent>Create Task</TooltipContent>
          </Tooltip>
        </SidebarMenuButton>
      </SidebarMenu>

      <CreateTaskForm
        currentState={currentState}
        setCurrentState={setCurrentState}
        setShowDialog={setShowCreateTask}
      />
    </Dialog>
  );
}
