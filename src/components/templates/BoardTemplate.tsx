"use client";

import { Category as Cat, useCategoryStore } from "@/store/category";
import { Project, useProjectStore } from "@/store/project";
import { Task, Task as TaskType } from "@/store/task";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import TaskForm from "../forms/TaskForm";
import Category from "../task/Category";
import DragAndDropFunctions from "../task/DragAndDropFunctions";
import { Dialog } from "../ui/dialog";

interface BoardTemplateProps {
  heading: string;
}

export interface UpdateProps {
  data: Cat | Task;
  action: "create" | "update" | "delete";
  type: "task" | "category";
}

export default function BoardTemplate({ heading }: BoardTemplateProps) {
  const { projects } = useProjectStore();
  const { categories } = useCategoryStore();
  const [showTaskForm, setShowTaskForm] = useState<boolean>(false);
  const [taskInput, setTaskInput] = useState<TaskType | undefined>(undefined);

  const [action, setAction] = useState<"create" | "update" | undefined>(undefined);
  const [project, setProject] = useState<Project | null>(null);
  const [props, setProps] = useState<UpdateProps | undefined>(undefined);

  const pathname = usePathname();

  useEffect(() => {
    if (pathname === "/inbox") {
      const project = projects.find((p) => p.isDefault === true && p.name === "Inbox");

      if (project) setProject(project);
    }
  }, [project, projects]);

  return (
    <Dialog
      open={showTaskForm}
      onOpenChange={() => {
        setShowTaskForm(!showTaskForm);
      }}
    >
      <DragAndDropFunctions />

      <div className="flex h-screen w-full flex-1 flex-col px-8 py-12">
        <header className="flex w-full flex-col">
          <h1 className="select-none truncate text-3xl font-black">{heading}</h1>
        </header>
        <section className="flex flex-1">
          {categories.map((category) => {
            if (category.projectId === project?.id) {
              return (
                <Category
                  key={category.id}
                  category={category}
                  project={project}
                  setTaskInput={setTaskInput}
                  setShowTaskForm={setShowTaskForm}
                  setAction={setAction}
                  view="board"
                  setProps={setProps}
                />
              );
            }
            return null;
          })}
        </section>
      </div>

      <TaskForm
        action={action}
        props={props}
        setProps={setProps}
        setShowDialog={setShowTaskForm}
        taskInput={taskInput}
      />
    </Dialog>
  );
}
