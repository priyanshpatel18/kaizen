"use client";

import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Workspace } from "@/store";
import { SquarePlus } from "lucide-react";
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
        <SidebarMenuButton onClick={() => setShowCreateTask(!showCreateTask)} className="mb-4 flex items-center">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2">
                <SquarePlus width={"24px"} height={"24px"} />
                <DialogTrigger asChild>
                  <span className="text-base font-semibold">Create Task</span>
                </DialogTrigger>
                <TooltipContent>Create Task</TooltipContent>
              </div>
            </TooltipTrigger>
          </Tooltip>
        </SidebarMenuButton>
      </SidebarMenu>

      <CreateTaskForm workspaces={workspaces} setShowDialog={setShowCreateTask} />
    </Dialog>
  );
}
