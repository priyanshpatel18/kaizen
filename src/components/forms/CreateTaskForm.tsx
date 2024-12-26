"use client";

import { Button } from "@/components/ui/button";
import { Command, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import UpdateStoreData from "@/lib/UpdateStoreData";
import { cn } from "@/lib/utils";
import { Option, Project, Workspace } from "@/store";
import { Task } from "@/store/task";
import { useCategoryStore } from "@/store/category";
import { useProjectStore } from "@/store/project";
import { Check, ChevronsUpDown } from "lucide-react";
import { Dispatch, FormEvent, SetStateAction, useEffect, useState } from "react";
import { toast } from "sonner";

interface IProps {
  workspaces?: Workspace[] | null;
  setShowDialog: Dispatch<SetStateAction<boolean>>;
  taskOption?: Option | null;
  project?: Project | null;
}

interface UpdateProps {
  task: Task;
  action: "create" | "update";
}

export default function CreateTaskForm({ setShowDialog }: IProps) {
  const [taskTitle, setTaskTitle] = useState<string>("");
  const [taskDescription, setTaskDescription] = useState<string>("");
  const [list, setList] = useState<Option[]>([]);
  const [currentState, setCurrentState] = useState<Option | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { categories: storeCategories } = useCategoryStore();
  const { projects: storeProjects } = useProjectStore();

  const [props, setProps] = useState<UpdateProps | undefined>(undefined);

  useEffect(() => {
    setTaskTitle("");

    if (storeProjects && storeCategories) {
      const options: Option[] = storeProjects.flatMap((p) => {
        return storeCategories
          .filter((c) => p.categoryIds.includes(c.id))
          .map((c) => ({
            value: `${p.id} # ${c.id}`,
            label: `${p.name}${c.isDefault ? "" : ` # ${c.name}`}`,
          }));
      });
      setList(options);
    }
  }, [storeProjects]);

  async function createTask(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);

    if (!taskTitle) {
      setIsLoading(false);
      return toast.error("Task title is required");
    }
    if (!currentState) {
      setIsLoading(false);
      return toast.error("Select a Category to create a task");
    }

    try {
      const formData = new FormData();
      formData.append("title", taskTitle);
      formData.append("categoryId", currentState.value.split("#")[1].trim());
      if (taskDescription) {
        formData.append("description", taskDescription);
      }

      setProps(undefined);

      const res = await fetch("/api/task/create", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message);
      } else {
        toast.success(data.message);

        const task = data.task as Task;
        console.log(task);

        if (typeof task.title === "string") {
          setProps({
            task,
            action: "create",
          });
        }

        setTaskTitle("");
        setTaskDescription("");
        setShowDialog(false);
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    } finally {
      setIsLoading(true);
    }
  }

  return (
    <DialogContent>
      {props && <UpdateStoreData data={props.task} type="task" action={props.action} />}

      <DialogHeader>
        <DialogTitle>Create Task</DialogTitle>
      </DialogHeader>
      <form onSubmit={createTask} className="flex flex-col space-y-4">
        <Label>
          <span className="sr-only">Enter Task Title</span>
          <Input
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
            placeholder="Title"
            type="text"
            className="text-gray-900"
          />
        </Label>
        <Label>
          <span className="sr-only">Enter Task Title</span>
          <Input
            value={taskDescription}
            onChange={(e) => setTaskDescription(e.target.value)}
            placeholder="Description (Optional)"
            type="text"
            className="text-gray-900"
          />
        </Label>
        <ComboBox list={list} currentState={currentState} setCurrentState={setCurrentState} />
        <Button disabled={isLoading} type="submit">
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
}

function ComboBox({ list, currentState, setCurrentState }: ComboBoxProps) {
  const [open, setOpen] = useState<boolean>(false);

  const handleSelect = (newValue: string) => {
    const selected = list.find((item) => item.value === newValue);
    if (selected) {
      setCurrentState(selected);
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="w-1/2 justify-between">
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
                <CommandItem key={index} onSelect={() => handleSelect(v.value)} className="cursor-pointer">
                  <Check
                    className={cn("mr-2 h-4 w-4", currentState?.value === v?.value ? "opacity-100" : "opacity-0")}
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
