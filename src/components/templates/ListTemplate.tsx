"use client";

import TaskForm from "@/components/forms/TaskForm";
import Task from "@/components/task/Task";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
// import { useCategoryStore } from "@/store/category";
import { Project, useProjectStore } from "@/store/project";
import { Task as TaskType, useTaskStore } from "@/store/task";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

interface ListTemplateProps {
  heading: string;
}

export default function ListTemplate({ heading }: ListTemplateProps) {
  const [showTaskForm, setShowTaskForm] = useState<boolean>(false);
  const [taskInput, setTaskInput] = useState<TaskType | undefined>(undefined);
  const [action, setAction] = useState<"create" | "update" | undefined>(undefined);

  const { tasks: storeTasks } = useTaskStore();
  // const { categories } = useCategoryStore();
  const { projects } = useProjectStore();

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
      <div className="flex w-full flex-1 flex-col items-center py-16">
        <div className="flex w-full max-w-3xl flex-col gap-6 px-4">
          <header className="flex flex-col">
            <h1 className="select-none truncate text-3xl font-black">{heading}</h1>
            <Separator className="mt-2" />
          </header>
          <section className="flex flex-col gap-4">
            <div className="flex flex-col gap-4">
              {project
                ? tasks.map((task) => {
                    if (task.projectId === project.id && task.isCompleted === false) {
                      return (
                        <div key={task.id} className="flex flex-col gap-4">
                          <Task
                            key={task.id}
                            task={task}
                            setTaskInput={setTaskInput}
                            setShowDialog={setShowTaskForm}
                            setAction={setAction}
                            view="list"
                          />
                          <Separator />
                        </div>
                      );
                    }
                  })
                : tasks.map((task) => {
                    return (
                      <div key={task.id} className="flex flex-col gap-4">
                        <Task
                          key={task.id}
                          task={task}
                          setTaskInput={setTaskInput}
                          setShowDialog={setShowTaskForm}
                          setAction={setAction}
                          view="list"
                        />
                        <Separator />
                      </div>
                    );
                  })}
            </div>

            <Button
              onClick={() => {
                setTaskInput(undefined);
                setAction("create");
                setShowTaskForm(true);
              }}
              className="self-start"
              variant="outline"
            >
              Add Task
            </Button>
          </section>
        </div>
      </div>

      <TaskForm setShowDialog={setShowTaskForm} action={action} taskInput={taskInput} />
    </Dialog>
  );
}
