"use client";

import { cn } from "@/lib/utils";
import { Option, Project, useStore, Workspace } from "@/store";
import { DialogTitle } from "@radix-ui/react-dialog";
import { Check, ChevronsUpDown } from "lucide-react";
import { Dispatch, FormEvent, SetStateAction, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Command, CommandGroup, CommandInput, CommandItem, CommandList } from "../ui/command";
import { DialogContent, DialogHeader } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

interface IProps {
  workspaces: Workspace[] | null;
  selectedWorkspaceId: string | undefined;
  setShowProjectForm: Dispatch<SetStateAction<boolean>>;
}

export default function CreateProjectForm({ workspaces, selectedWorkspaceId, setShowProjectForm }: IProps) {
  const [projectName, setProjectName] = useState<string>("");
  const store = useStore();
  const [currentState, setCurrentState] = useState<Option | null>(null);
  const [list, setList] = useState<Option[]>([]);
  useEffect(() => {
    setProjectName("");

    if (workspaces && workspaces.length > 0) {
      const options: Option[] = workspaces.map((ws) => {
        if (ws.id === selectedWorkspaceId) {
          setCurrentState({
            label: ws.name,
            value: ws.id,
          });
        }
        return {
          label: ws.name,
          value: ws.id,
        };
      });

      setList(options);
    }
  }, [workspaces, selectedWorkspaceId]);

  async function createProject(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!projectName) {
      return toast.error("Project title is required");
    }

    const formData = new FormData();
    formData.append("name", projectName);
    if (!currentState?.value) {
      return toast.error("Something went wrong, please refresh the page and try again");
    }
    formData.append("workspaceId", currentState.value);

    const res = await fetch("/api/project/create", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (!res.ok) {
      return toast.error(data.message);
    } else {
      toast.success(data.message);

      const newProject = data.project as Project;

      if (newProject) {
        const updatedWorkspace = workspaces?.map((ws) => {
          if (ws.id === newProject?.workspaceId) {
            return {
              ...ws,
              projects: [...ws.projects, newProject],
            };
          }
          return ws;
        });

        store.setWorkspaces(updatedWorkspace as Workspace[]);
      }
      // router.push(`/projects/${data.project.id}`);
    }
    setProjectName("");
    setShowProjectForm(false);
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Create Project</DialogTitle>
      </DialogHeader>

      <form onSubmit={createProject} className="flex flex-col space-y-4">
        <Label>
          <span className="sr-only">Enter Project Name</span>
          <Input
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="Project Name"
            type="text"
            className="text-gray-900"
          />
        </Label>

        <WorkspaceComboBox currentState={currentState} setCurrentState={setCurrentState} list={list} />

        <Button type="submit">
          <span>Create Project</span>
        </Button>
      </form>
    </DialogContent>
  );
}

interface CBProps {
  list: Option[];
  currentState: Option | null;
  setCurrentState: Dispatch<SetStateAction<Option | null>>;
}

function WorkspaceComboBox({ currentState, list, setCurrentState }: CBProps) {
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
        <Button variant="outline" role="combobox" className="w-1/2 justify-between">
          {currentState?.label || "Select an option"}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Search for Workspaces" />
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
