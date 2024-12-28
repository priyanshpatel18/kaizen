"use client";

import { useCategoryStore } from "@/store/category";
import { Project, useProjectStore } from "@/store/project";
import { Task as TaskType, useTaskStore } from "@/store/task";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Task from "../task/Task";
import { Dialog } from "../ui/dialog";
import TaskForm from "../forms/TaskForm";
import { Button } from "../ui/button";

interface BoardTemplateProps {
  heading: string;
}

export default function BoardTemplate({ heading }: BoardTemplateProps) {
  const { projects } = useProjectStore();
  const { tasks: storeTasks } = useTaskStore();
  const { categories } = useCategoryStore();
  const [showTaskForm, setShowTaskForm] = useState<boolean>(false);
  const [taskInput, setTaskInput] = useState<TaskType | undefined>(undefined);

  const [action, setAction] = useState<"create" | "update" | undefined>(undefined);
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<TaskType[]>([]);

  const pathname = usePathname();

  useEffect(() => {
    if (pathname === "/inbox") {
      const project = projects.find((p) => p.isDefault === true && p.name === "Inbox");

      if (project) setProject(project);
    }
  }, [projects]);

  useEffect(() => {
    if (pathname === "/today") {
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);
      const filteredTasks = storeTasks.filter((t) => {
        const dueDateObj = typeof t.dueDate === "string" ? new Date(t.dueDate) : t.dueDate;

        return dueDateObj <= todayEnd && t.isCompleted === false;
      });

      setTasks(filteredTasks);
      return;
    }
    const filteredTasks = storeTasks.filter((t) => {
      if (t.projectId === project?.id && t.isCompleted === false) {
        return t;
      }
    });

    setTasks(filteredTasks);
  }, [storeTasks, project]);

  return (
    <Dialog
      open={showTaskForm}
      onOpenChange={() => {
        setShowTaskForm(!showTaskForm);
      }}
    >
      <div className="flex h-screen w-full flex-1 flex-col px-8 py-12">
        <header className="flex w-full flex-col">
          <h1 className="select-none truncate text-3xl font-black">{heading}</h1>
        </header>
        <section className="flex flex-1">
          {categories.map((category) => {
            if (category.projectId === project?.id) {
              return (
                <div key={category.id} className="flex h-full w-full max-w-64 flex-col gap-2 rounded-md p-2">
                  <span className={`h-3} text-sm font-semibold`}>
                    {category.isDefault ? "(No Category)" : category.name}
                  </span>
                  <div className="flex flex-col gap-2">
                    {tasks.map((task) => {
                      if (task.categoryId === category.id) {
                        return (
                          <Task
                            key={task.id}
                            task={task}
                            setTaskInput={setTaskInput}
                            setShowDialog={setShowTaskForm}
                            view="board"
                            setAction={setAction}
                          />
                        );
                      }
                      return null;
                    })}
                    <Button
                      onClick={() => {
                        setTaskInput(undefined);
                        setAction("create");
                        setShowTaskForm(true);
                      }}
                      variant="outline"
                    >
                      Add Task
                    </Button>
                  </div>
                </div>
              );
            }
            return null;
          })}
        </section>
      </div>

      <TaskForm action={action} setShowDialog={setShowTaskForm} taskInput={taskInput} />
    </Dialog>
  );
}
