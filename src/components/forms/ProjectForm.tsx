"use client";

import { Button } from "@/components/ui/button";
import { Command, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Option } from "@/store";
import { Project } from "@/store/project";
import { useWorkspaceStore } from "@/store/workspace";
import { DialogTitle } from "@radix-ui/react-dialog";
import { Check, ChevronsUpDown } from "lucide-react";
import { Dispatch, FormEvent, SetStateAction, useEffect, useState } from "react";
import { toast } from "sonner";
import { UpdateProps } from "../sidebar/appSidebar";
import { useRouter } from "next/navigation";
import { Icons } from "../icons";

interface IProps {
  selectedWorkspaceId: string | undefined;
  setShowProjectForm: Dispatch<SetStateAction<boolean>>;
  setProps?: Dispatch<SetStateAction<UpdateProps | undefined>>;
}

export default function ProjectForm({ selectedWorkspaceId, setShowProjectForm, setProps }: IProps) {
  const [projectName, setProjectName] = useState<string>("");
  const [currentState, setCurrentState] = useState<Option | null>(null);
  const [list, setList] = useState<Option[]>([]);
  const { workspaces } = useWorkspaceStore();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    setProjectName("");
    setIsLoading(false);

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

    setIsLoading(true);

    try {
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

        if (setProps)
          setProps({
            data: newProject,
            action: "create",
            type: "project",
          });

        router.push(`/app/projects/${data.project.id}`);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setProjectName("");
      setShowProjectForm(false);
      setIsLoading(false);
    }
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

        <WorkspaceComboBox
          setProjectName={setProjectName}
          setIsLoading={setIsLoading}
          currentState={currentState}
          setCurrentState={setCurrentState}
          list={list}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          <span>Create Project</span>
          {isLoading && <Icons.spinner className={`ml-2 h-4 w-4 animate-spin`} />}
        </Button>
      </form>
    </DialogContent>
  );
}

interface CBProps {
  list: Option[];
  currentState: Option | null;
  setCurrentState: Dispatch<SetStateAction<Option | null>>;
  setProjectName: Dispatch<SetStateAction<string>>;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
}

function WorkspaceComboBox({ currentState, list, setCurrentState, setProjectName, setIsLoading }: CBProps) {
  const [open, setOpen] = useState<boolean>(false);

  const handleSelect = (newValue: string) => {
    const selected = list.find((item) => item.value === newValue);
    if (selected) {
      setCurrentState(selected);
      setOpen(false);
    }
  };

  useEffect(() => {
    setProjectName("");
    setIsLoading(false);
  }, []);

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
