"use client";

import {
  ChevronRight,
  Folder,
  Forward,
  LucideIcon,
  MoreHorizontal,
  Plus,
  Trash2,
} from "lucide-react";

import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { toast } from "sonner";

export interface Project {
  id: string;
  title: string;
  icon?: LucideIcon;
}

export default function NavProjects({ projects }: { projects: Project[] }) {
  const { isMobile } = useSidebar();
  const router = useRouter();
  const [showProjects, setShowProjects] = useState<boolean>(true);
  const [showProjectForm, setShowProjectForm] = useState<boolean>(false);
  const [projectName, setProjectName] = useState<string>("");

  async function createProject(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!projectName) {
      return toast.error("Project title is required");
    }

    const formData = new FormData();
    formData.append("name", projectName);

    const res = await fetch("/api/project/create", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) {
      return toast.error(data.message);
    } else {
      toast.success(data.message);
      setShowProjectForm(false);
      setProjectName("");
    }
  }

  return (
    <Dialog
      open={showProjectForm}
      onOpenChange={() => {
        setShowProjectForm(!showProjectForm);
        setProjectName("");
      }}
    >
      <SidebarGroup>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <span className="flex-1" onClick={() => router.push("/projects")}>
                Projects
              </span>
              <div className="ml-auto flex gap-2 items-center">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div onClick={() => setShowProjectForm(!showProjectForm)}>
                      <Plus size={18} />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>Create Project</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <ChevronRight
                      size={18}
                      className={`${
                        showProjects ? "rotate-90" : ""
                      } transition-all duration-200`}
                      onClick={() => setShowProjects(!showProjects)}
                    />
                  </TooltipTrigger>
                  <TooltipContent>Toggle Projects List</TooltipContent>
                </Tooltip>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {showProjects &&
            projects.map((project) => (
              <SidebarMenuItem key={project.id}>
                <SidebarMenuButton asChild>
                  <Link href={`/projects/${project.id}`}>
                    {project.icon && <project.icon />}
                    <span>{project.title}</span>
                  </Link>
                </SidebarMenuButton>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild className="focus-visible:ring-0">
                    <SidebarMenuAction showOnHover>
                      <MoreHorizontal />
                      <span className="sr-only">More</span>
                    </SidebarMenuAction>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-48 rounded-lg"
                    side={isMobile ? "bottom" : "right"}
                    align={isMobile ? "end" : "start"}
                  >
                    <DropdownMenuItem
                      onClick={() => router.push(`/projects/${project.id}`)}
                    >
                      <Folder className="text-muted-foreground" />
                      <span>View Project</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Forward className="text-muted-foreground" />
                      <span>Share Project</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Trash2 className="text-muted-foreground" />
                      <span>Delete Project</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            ))}
          {projects.length > 3 && (
            <SidebarMenuItem>
              <SidebarMenuButton className="text-sidebar-foreground/70">
                <MoreHorizontal className="text-sidebar-foreground/70" />
                <span>More</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarGroup>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Project</DialogTitle>
        </DialogHeader>
        <form onSubmit={createProject} className="space-y-4 flex flex-col">
          <Label>
            <span className="sr-only">Enter Task Title</span>
            <Input
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Project Name"
              type="text"
              className="text-gray-900"
            />
          </Label>
          <Button type="submit">
            <span>Create Project</span>
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
