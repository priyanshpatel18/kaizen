"use client";

import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useStore } from "@/store";
import { Dispatch, FormEvent, SetStateAction, useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import ComboBox from "./ComboBox";
import { Data } from "./CreateTask";

interface IProps {
  currentState: Data | null;
  setCurrentState: Dispatch<SetStateAction<Data | null>>;
  setShowDialog?: Dispatch<SetStateAction<boolean>>;
}

export default function CreateTaskForm({
  currentState,
  setCurrentState,
  setShowDialog,
}: IProps) {
  const [taskTitle, setTaskTitle] = useState<string>("");
  const store = useStore();

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

        const project = store.projects.find(
          (project) => project.id === currentState.value.split("#")[0].trim()
        );
        const category = project?.categories.find(
          (category) => category.id === currentState.value.split("#")[1].trim()
        );

        const task = data.task;
        category?.tasks?.push(task);

        store.setProjects(
          store.projects.map((project) => {
            if (project.id === currentState.value.split("#")[0].trim()) {
              return {
                ...project,
                categories: project.categories.map((category) => {
                  if (category.id === currentState.value.split("#")[1].trim()) {
                    return {
                      ...category,
                      tasks: [...category.tasks, task],
                    };
                  }
                  return category;
                }),
              };
            }
            return project;
          })
        );

        setShowDialog && setShowDialog(false);
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    }
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Create Task</DialogTitle>
      </DialogHeader>
      <form onSubmit={createTask} className="space-y-4 flex flex-col">
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
        <ComboBox
          currentState={currentState}
          setCurrentState={setCurrentState}
        />
        <Button>
          <span>Create Task</span>
        </Button>
      </form>
    </DialogContent>
  );
}
