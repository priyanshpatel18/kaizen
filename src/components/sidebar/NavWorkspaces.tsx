"use client";

import {
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
} from "@/components/ui/sidebar";
import { useStore, Workspace } from "@/store";
import { Ellipsis, FilePlus, Folder, FolderPlus, Forward, Hash, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import CreateProjectForm from "../forms/CreateProjectForm";
import CreateWorkspaceForm from "../forms/CreateWorkspaceForm";
import { Dialog } from "../ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

export default function NavWorkspaces({
  workspaces,
}: {
  workspaces: Workspace[] | null;
}) {
  // const [showProjects, setShowProjects] = useState<boolean>(false);
  const router = useRouter();

  const [showProjectForm, setShowProjectForm] = useState<boolean>(false);
  const [showWorkspaceForm, setShowWorkspaceForm] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);

  const [defaultWorkspace, setDefaultWorkspace] = useState<Workspace | null>(
    null
  );
  const store = useStore();

  useEffect(() => {
    if (store.workspaces) {
      const defaultWorkspace = store.workspaces.find(
        (workspace) => workspace.isDefault
      );
      if (defaultWorkspace) {
        setDefaultWorkspace(defaultWorkspace);
      }
    }
  }, [store.workspaces]);

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <SidebarMenu>
        {defaultWorkspace && (
          <SidebarMenuItem>
            <SidebarMenuButton>
              <Folder />
              <span className="flex-1" onClick={() => router.push("/projects")}>
                {defaultWorkspace.name}
              </span>
              <div className="ml-auto flex gap-2 items-center">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      onClick={() => {
                        setShowWorkspaceForm(false);
                        setShowProjectForm(true);
                        setShowDialog(true);
                      }}
                    >
                      <FilePlus size={18} />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>Create Project</TooltipContent>
                </Tooltip>
              </div>
            </SidebarMenuButton>
            <SidebarMenuSub>
              {defaultWorkspace.projects.map((project) => {
                return (
                  <SidebarMenuItem key={project.id}>
                    <SidebarMenuButton
                      onClick={() => router.push(`/projects/${project.id}`)}
                      className="flex items-center"
                    >
                      <Hash className="text-primary/50" />
                      {project.name}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenuSub>
          </SidebarMenuItem>
        )}

        <SidebarMenuItem>
          <SidebarMenuButton>
            <span className="flex-1" onClick={() => router.push("/projects")}>
              Workspaces
            </span>
            <div className="ml-auto flex gap-2 items-center">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    onClick={() => {
                      setShowProjectForm(false);
                      setShowWorkspaceForm(true);
                      setShowDialog(true);
                    }}
                  >
                    <FolderPlus size={18} />
                  </div>
                </TooltipTrigger>
                <TooltipContent>Create Workspace</TooltipContent>
              </Tooltip>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>

        <SidebarMenuSub>
          {workspaces?.map((workspace) => {
            if (workspace.isDefault || workspace.id === defaultWorkspace?.id) {
              return null;
            }

            return (
              <SidebarMenuItem
                key={workspace.id}
                className="flex justify-between items-center"
              >
                <SidebarMenuButton>
                  <Folder />
                  <div>{workspace.name}</div>
                </SidebarMenuButton>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild className="focus-visible:ring-0">
                    <SidebarMenuAction showOnHover>
                      <Ellipsis />
                      <span className="sr-only">More</span>
                    </SidebarMenuAction>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="dropTrigger">
                    <DropdownMenuItem className="cursor-pointer">
                      <Folder className="text-muted-foreground" />
                      <span>View Workspace</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer">
                      <Forward className="text-muted-foreground" />
                      <span>Share Workspace</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="cursor-pointer">
                      <Trash2 className="text-muted-foreground" />
                      <span>Delete Workspace</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenuSub>
      </SidebarMenu>

      {showWorkspaceForm && (
        <CreateWorkspaceForm
          workspaces={workspaces}
          setShowWorkspaceForm={setShowWorkspaceForm}
        />
      )}

      {showProjectForm && (
        <CreateProjectForm
          workspaces={workspaces}
          selectedWorkspaceId={defaultWorkspace?.id}
          setShowProjectForm={setShowProjectForm}
        />
      )}
    </Dialog>
  );
}
