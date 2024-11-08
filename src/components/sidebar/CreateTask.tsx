"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "../ui/sidebar";
import ComboBox from "./ComboBox";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

export default function CreateTask() {
  const [taskTitle, setTaskTitle] = useState<string>("");
  const [showCreateTask, setShowCreateTask] = useState<boolean>(false);
  const [projectCategory, setProjectCategory] = useState<string>("");

  return (
    <Dialog
      open={showCreateTask}
      onOpenChange={() => {
        setShowCreateTask(!showCreateTask);
        setTaskTitle("");
      }}
    >
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton onClick={() => setShowCreateTask(!showCreateTask)}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Plus />
              </TooltipTrigger>
              <TooltipContent>Create Task</TooltipContent>
            </Tooltip>
            <DialogTrigger className="flex items-center w-full gap-2" asChild>
              <div>
                <span>Create Task</span>
              </div>
            </DialogTrigger>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Task</DialogTitle>
        </DialogHeader>
        <form className="space-y-4 flex flex-col">
          <Label>
            <span className="sr-only">Enter Task Title</span>
            <Input
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              placeholder="Task Title"
              type="text"
              className="text-gray-900"
            />
          </Label>
          <ComboBox />
          <Button>
            <span>Create Task</span>
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
