"use client";

import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Option, Project, Task, useStore, Workspace } from "@/store";
import { Check, ChevronsUpDown } from "lucide-react";
import {
  Dispatch,
  FormEvent,
  SetStateAction,
  useEffect,
  useState,
} from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

interface IProps {
  workspaces?: Workspace[] | null;
  setShowDialog: Dispatch<SetStateAction<boolean>>;
  project?: Project | null;
  taskOption?: Option | null;
}

export default function CreateTaskForm({
  workspaces,
  setShowDialog,
  project,
  taskOption,
}: IProps) {
  const [taskTitle, setTaskTitle] = useState<string>("");
  const [list, setList] = useState<Option[]>([]);
  const store = useStore();
  const [currentState, setCurrentState] = useState<Option | null>(null);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | null>(
    null
  );

  useEffect(() => {
    setTaskTitle("");

    if (workspaces && workspaces.length > 0) {
      const options: Option[] = workspaces.flatMap((ws) => {
        const projects = ws.projects.flatMap((project) => {
          const categories = project.categories.flatMap((category) => {
            return {
              value: `${project.id} # ${category.id}`,
              label: `${project.name} # ${category.name}`,
            };
          });

          return categories;
        });
        return projects;
      });

      setList(options);
    } else if (project) {
      const options: Option[] = project.categories.flatMap((category) => {
        return {
          value: `${project.id} # ${category.id}`,
          label: `${project.name} # ${category.name}`,
        };
      });
      setList(options);
      taskOption && setCurrentState(taskOption);
    }
  }, [workspaces, taskOption]);

  async function createTask(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!taskTitle) {
      return toast.error("Task title is required");
    }
    if (!currentState) {
      return toast.error("Select a Category to create a task");
    }

    try {
      const formData = new FormData();
      formData.append("title", taskTitle);
      formData.append("categoryId", currentState.value.split("#")[1].trim());

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

        const task = data.task as Task;

        if (task) {
          const newData = store.workspaces?.map((ws) => {
            const newProjects = ws.projects.map((p) => {
              if (p.id === project?.id) {
                if (project) {
                  return {
                    ...project,
                    categories:
                      project?.categories.map((c) => {
                        if (c.id === task.categoryId) {
                          c.tasks?.push(task);
                        }
                        return c;
                      }) || [],
                  };
                }
              }

              const newCategories = p.categories.map((c) => {
                if (c.id === task.categoryId) {
                  c.tasks?.push(task);
                }
                return c;
              });
              return {
                ...p,
                categories: newCategories,
              };
            });

            return {
              ...ws,
              projects: newProjects,
            };
          });

          store.setWorkspaces(newData);
        }
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
          list={list}
          currentState={currentState}
          setCurrentState={setCurrentState}
          workspaces={workspaces}
          setSelectedWorkspaceId={setSelectedWorkspaceId}
        />
        <Button>
          <span>Create Task</span>
        </Button>
      </form>
    </DialogContent>
  );
}

interface ComboBoxProps {
  list: Option[];
  currentState: Option | null;
  setCurrentState: Dispatch<SetStateAction<Option | null>>;
  workspaces?: Workspace[] | null;
  setSelectedWorkspaceId: Dispatch<SetStateAction<string | null>>;
}

function ComboBox({
  list,
  currentState,
  setCurrentState,
  workspaces,
  setSelectedWorkspaceId,
}: ComboBoxProps) {
  const [open, setOpen] = useState<boolean>(false);

  const handleSelect = (newValue: string) => {
    const selected = list.find((item) => item.value === newValue);
    if (selected) {
      setCurrentState(selected);
      setOpen(false);

      const projectId = selected.value.split("#")[0].trim();
      const project = workspaces
        ?.flatMap((ws) => ws.projects)
        .find((p) => p.id === projectId);
      project && setSelectedWorkspaceId(project.workspaceId || null);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-1/2 justify-between"
        >
          {currentState?.label || "Select an option"}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Search project name" />
          <CommandList>
            <CommandGroup>
              {list.map((v, index) => (
                <CommandItem
                  key={index}
                  onSelect={() => handleSelect(v.value)}
                  className="cursor-pointer"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      currentState?.value === v?.value
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                  {v.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
