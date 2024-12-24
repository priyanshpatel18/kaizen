"use client";

import CreateTaskForm from "@/components/forms/CreateTaskForm";
import EditIcon from "@/components/svg/EditIcon";
import OptionIcon from "@/components/svg/OptionIcon";
import CompleteTaskButton from "@/components/task/CompleteTaskButton";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useState } from "react";

export default function Inbox() {
  const [showCreateTask, setShowCreateTask] = useState<boolean>(false);

  return (
    <Dialog
      open={showCreateTask}
      onOpenChange={() => {
        setShowCreateTask(!showCreateTask);
      }}
    >
      <div className="flex w-full flex-1 flex-col items-center py-16">
        <div className="flex w-full max-w-3xl flex-col gap-6 px-4">
          <header className="flex flex-col">
            <h1 className="select-none truncate text-3xl font-black">Today</h1>
            <Separator className="mt-2" />
          </header>
          <section className="flex flex-col gap-4">
            <div className="flex flex-col">
              <div className="group relative flex cursor-pointer select-none items-center justify-between">
                <div className="flex items-center gap-2">
                  <CompleteTaskButton />
                  <span>Task Title</span>
                </div>
                <div className="flex items-center gap-2">
                  <Tooltip>
                    <TooltipTrigger>
                      <EditIcon
                        className="h-6 rounded-sm p-0.5 opacity-0 hover:bg-accent group-hover:opacity-100"
                        onClick={() => setShowCreateTask(true)}
                      />
                    </TooltipTrigger>
                    <TooltipContent>Edit task</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger>
                      <OptionIcon className="h-6 rounded-sm p-0.5 opacity-0 hover:bg-accent group-hover:opacity-100" />
                    </TooltipTrigger>
                    <TooltipContent>More actions</TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </div>

            <Separator />

            <Button onClick={() => setShowCreateTask(true)} className="self-start" variant="outline">
              Add Task
            </Button>
          </section>
        </div>
      </div>

      <CreateTaskForm setShowDialog={setShowCreateTask} />
    </Dialog>
  );
}
