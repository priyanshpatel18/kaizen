"use client";

import TaskForm from "@/components/forms/TaskForm";
import { Dialog } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useStore } from "@/store";
import { Category as CategoryType, useCategoryStore } from "@/store/category";
import { Project, useProjectStore } from "@/store/project";
import { Task } from "@/store/task";
import { usePathname } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import Category from "./Category";
import DragAndDropFunctions from "./DragAndDropFunctions";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { toast } from "sonner";
import { Icons } from "../icons";
import UpdateStoreData from "@/lib/UpdateStoreData";

interface BoardProps {
  heading: string;
  projectId?: string;
}

export interface UpdateProps {
  data: CategoryType | Task;
  action: "create" | "update" | "delete";
  type: "task" | "category";
}

export default function Board({ heading, projectId }: BoardProps) {
  const pathname = usePathname();
  const { viewOptions } = useStore();
  const [currentView, setCurrentView] = useState<"list" | "board">("list");

  useEffect(() => {
    setCurrentView(viewOptions.find((option) => option.route === pathname)?.view || "list");
  }, [viewOptions]);

  const [showTaskForm, setShowTaskForm] = useState<boolean>(false);
  const [taskInput, setTaskInput] = useState<Task | undefined>(undefined);
  const [action, setAction] = useState<"create" | "update" | undefined>(undefined);
  const [props, setProps] = useState<UpdateProps | undefined>(undefined);

  const [showCreateCategory, setShowCreateCategory] = useState<boolean>(false);
  const [categoryName, setCategoryName] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { projects } = useProjectStore();

  const [project, setProject] = useState<Project | null>(null);
  const { categories } = useCategoryStore();

  useEffect(() => {
    if (projectId) {
      const project = projects.find((p) => p.id === projectId);

      if (project) setProject(project);
      return;
    }
    if (pathname === "/app/inbox") {
      const project = projects.find((p) => p.isDefault === true && p.name === "Inbox");

      if (project) setProject(project);
    }
  }, [projects, projectId, pathname]);

  async function createCategory(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setProps(undefined);

    if (!categoryName.trim()) {
      return toast.error("Category name cannot be empty");
    }

    try {
      if (!projectId) {
        return toast.error("Project not found");
      }
      setIsLoading(true);

      const formData = new FormData();
      formData.append("name", categoryName);
      formData.append("projectId", projectId);

      const res = await fetch("/api/category/create", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message);
      } else {
        setProps({
          data: data.category,
          action: "create",
          type: "category",
        });
        toast.success(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong, Refresh and try again");
    } finally {
      setShowCreateCategory(false);
      setCategoryName("");
      setIsLoading(false);
    }
  }

  return (
    <Dialog
      open={showTaskForm}
      onOpenChange={() => {
        setShowTaskForm(!showTaskForm);
      }}
    >
      {project && <DragAndDropFunctions />}
      {props && <UpdateStoreData data={props.data} action={props.action} type={props.type} />}

      <div className={`flex h-screen w-full flex-col ${currentView === "list" && "items-center overflow-auto"}`}>
        <div className={`flex h-full w-full ${currentView === "list" && "max-w-3xl"} flex-col`}>
          <header className={`flex flex-col ${currentView === "list" ? "py-16" : "p-12"} pb-0`}>
            <h1 className="select-none truncate text-3xl font-black">{heading}</h1>
            {currentView === "list" && <Separator className="mt-2" />}
          </header>
          <section
            className={`flex flex-1 gap-4 ${currentView === "board" ? "flex-row overflow-auto p-8" : "flex-col"}`}
          >
            <div className={`flex gap-4 ${currentView === "list" ? "flex-col" : "flex-row"}`}>
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
                        view={currentView}
                        setProps={setProps}
                        isLoading={isLoading}
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
                    view={currentView}
                    setProps={setProps}
                    isLoading={isLoading}
                  />
                </div>
              )}
            </div>
            <div className={`${currentView === "list" ? "w-full" : "w-64"}`}>
              {project &&
                (showCreateCategory ? (
                  <form onSubmit={createCategory} className="flex flex-col gap-2">
                    <Input
                      value={categoryName}
                      onChange={(e) => {
                        setCategoryName(e.target.value);
                      }}
                      className="w-full"
                      placeholder="Category name"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <Button type="submit" disabled={categoryName === "" || isLoading} className="flex items-center">
                        {isLoading && <Icons.spinner className="animate-spin" />}
                        Create Category
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setCategoryName("");
                          setShowCreateCategory(false);
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                ) : currentView === "list" ? (
                  <div
                    className="relative cursor-pointer py-5 opacity-0 transition-opacity duration-200 ease-in hover:opacity-100"
                    onClick={() => setShowCreateCategory(true)}
                  >
                    <Separator />
                    <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-gray-600">
                      Add Category
                    </span>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setShowCreateCategory(true);
                    }}
                  >
                    Add Category
                  </Button>
                ))}
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
        project={project}
      />
    </Dialog>
  );
}
