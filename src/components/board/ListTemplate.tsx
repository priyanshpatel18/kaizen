"use client";

import { useState } from "react";
import CreateTaskForm from "@/components/forms/CreateTaskForm";
import Task from "@/components/task/Task";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

export default function ListTemplate() {
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
            <h1 className="select-none truncate text-3xl font-black">Inbox</h1>
            <Separator className="mt-2" />
          </header>
          <section className="flex flex-col gap-4">
            <div className="flex flex-col">
              <Task title="Task Title" />
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
