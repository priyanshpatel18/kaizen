"use client";

import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Workspace } from "@/store";
import { Plus } from "lucide-react";
import { useState } from "react";
import CreateTaskForm from "../forms/CreateTaskForm";
import { SidebarMenu, SidebarMenuButton } from "../ui/sidebar";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

interface IProps {
  workspaces: Workspace[] | null;
}

export default function CreateTask({ workspaces }: IProps) {
  const [showCreateTask, setShowCreateTask] = useState<boolean>(false);

  return (
    <Dialog
      open={showCreateTask}
      onOpenChange={() => {
        setShowCreateTask(!showCreateTask);
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
        workspaces={workspaces}
        setShowDialog={setShowCreateTask}
      />
    </Dialog>
  );
}
