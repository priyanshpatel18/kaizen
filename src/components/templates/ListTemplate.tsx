"use client";

import TaskForm from "@/components/forms/TaskForm";
import { Dialog } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useCategoryStore } from "@/store/category";
import { Project, useProjectStore } from "@/store/project";
import { Task as TaskType } from "@/store/task";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Category from "../task/Category";
import { UpdateProps } from "./BoardTemplate";
import DragAndDropFunctions from "../task/DragAndDropFunctions";

interface ListTemplateProps {
  heading: string;
}

export default function ListTemplate({ heading }: ListTemplateProps) {
  const [showTaskForm, setShowTaskForm] = useState<boolean>(false);
  const [taskInput, setTaskInput] = useState<TaskType | undefined>(undefined);
  const [action, setAction] = useState<"create" | "update" | undefined>(undefined);
  const [props, setProps] = useState<UpdateProps | undefined>(undefined);

  const { projects } = useProjectStore();

  const [project, setProject] = useState<Project | null>(null);
  const { categories } = useCategoryStore();

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

      <div className="flex w-full flex-1 flex-col items-center py-16">
        <div className="flex w-full max-w-3xl flex-col gap-6 px-4">
          <header className="flex flex-col">
            <h1 className="select-none truncate text-3xl font-black">{heading}</h1>
            <Separator className="mt-2" />
          </header>
          <section className="flex flex-col gap-4">
            <div className="flex flex-col gap-4">
              {project ? (
                categories.map((category) => {
                  if (category.projectId === project.id) {
                    return (
                      <Category
                        key={category.id}
                        category={category}
                        project={project}
                        setTaskInput={setTaskInput}
                        setShowTaskForm={setShowTaskForm}
                        setAction={setAction}
                        view="list"
                        setProps={setProps}
                      />
                    );
                  }
                })
              ) : (
                <div className="flex flex-col gap-4">
                  <Category
                    project={project}
                    setTaskInput={setTaskInput}
                    setShowTaskForm={setShowTaskForm}
                    setAction={setAction}
                    view="list"
                    setProps={setProps}
                  />
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      <TaskForm
        props={props}
        setProps={setProps}
        setShowDialog={setShowTaskForm}
        action={action}
        taskInput={taskInput}
      />
    </Dialog>
  );
}
