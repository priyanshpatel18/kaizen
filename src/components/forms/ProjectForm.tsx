"use client";

import { Icons } from "@/components/others/icons";
import { Button } from "@/components/ui/button";
import { Command, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { UpdateDataProps } from "@/lib/UpdateStoreData";
import { cn } from "@/lib/utils";
import { Option } from "@/store";
import { Project } from "@/store/project";
import { useWorkspaceStore } from "@/store/workspace";
import { DialogTitle } from "@radix-ui/react-dialog";
import { Check, ChevronsUpDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { Dispatch, FormEvent, SetStateAction, useEffect, useState } from "react";
import { toast } from "sonner";

interface IProps {
  selectedWorkspaceId: string | undefined;
  setActiveDialog: Dispatch<SetStateAction<"project" | "workspace" | null>>;
  setProps: Dispatch<SetStateAction<UpdateDataProps | undefined>>;
  projectInput: Project | undefined;
  setProjectInput: Dispatch<SetStateAction<Project | undefined>>;
  updateProject: (project: Project, updateValue: object) => void;
  action: "create" | "update" | undefined;
}

export default function ProjectForm({
  selectedWorkspaceId,
  setActiveDialog,
  setProps,
  projectInput,
  setProjectInput,
  action,
}: IProps) {
  const [projectName, setProjectName] = useState<string>(projectInput?.name || "");
  const [currentState, setCurrentState] = useState<Option | null>(null);
  const [list, setList] = useState<Option[]>([]);
  const { workspaces } = useWorkspaceStore();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    setIsLoading(false);

    if (workspaces && workspaces.length > 0) {
      const options: Option[] = workspaces.map((ws) => ({
        label: ws.name,
        value: ws.id,
      }));

      setList(options);

      if (selectedWorkspaceId) {
        const selectedWorkspace = options.find((ws) => ws.value === selectedWorkspaceId);
        if (selectedWorkspace) {
          setCurrentState(selectedWorkspace);
        }
      }
    }
  }, [workspaces, selectedWorkspaceId, projectInput]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!projectName) {
      return toast.error("Project title is required");
    }

    setIsLoading(true);

    try {
      if (action === "create") {
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

          if (setProps)
            setProps({
              data: newProject,
              action: "create",
              type: "project",
            });

          router.push(`/app/projects/${data.project.id}`);
        }
      }
      if (action === "update" && projectInput) {
        const newProject = {
          ...projectInput,
          name: projectName,
          workspaceId: currentState?.value || "",
        };

        setProps({
          data: newProject,
          action: "update",
          type: "project",
        });

        const response = await fetch(`/api/project/update`, {
          method: "PUT",
          body: JSON.stringify({
            id: projectInput.id,
            updateValue: {
              name: projectName,
              workspaceId: currentState?.value || "",
            },
          }),
        });

        const { message, project: resProject } = await response.json();
        if (response.ok && resProject) {
          toast.success(message);
        } else {
          toast.error(message);
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      setProjectName("");
      setActiveDialog(null);
      setIsLoading(false);
    }
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Create Project</DialogTitle>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
        <Label>
          <span className="sr-only">Enter Project Name</span>
          <Input
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="Project Name"
            type="text"
          />
        </Label>

        <WorkspaceComboBox
          setProjectName={setProjectName}
          setIsLoading={setIsLoading}
          currentState={currentState}
          setCurrentState={setCurrentState}
          list={list}
          projectInput={projectInput}
          setProjectInput={setProjectInput}
          action={action}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          <span className="capitalize">{action} Project</span>
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
  projectInput: Project | undefined;
  setProjectInput: Dispatch<SetStateAction<Project | undefined>>;
  action: "create" | "update" | undefined;
}

function WorkspaceComboBox({
  currentState,
  list,
  setCurrentState,
  setProjectName,
  setIsLoading,
  projectInput,
  setProjectInput,
  action,
}: CBProps) {
  const [open, setOpen] = useState<boolean>(false);

  const handleSelect = (newValue: string) => {
    const selected = list.find((item) => item.value === newValue);
    if (selected) {
      setCurrentState(selected);
      setOpen(false);
    }
  };

  useEffect(() => {
    if (projectInput) {
      setProjectName(projectInput.name);
      const workspace = list.find((ws) => ws.value === projectInput.workspaceId);
      if (workspace) {
        setCurrentState({
          label: workspace.label,
          value: workspace.value,
        });
      }
    } else {
      setProjectName("");
    }

    if (action === "create") {
      setProjectInput(undefined);
    }
    setIsLoading(false);
  }, [projectInput]);

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
