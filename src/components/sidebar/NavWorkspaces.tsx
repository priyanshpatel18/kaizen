"use client";

import { Plus } from "lucide-react";

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
} from "@/components/ui/sidebar";
import { useStore, Workspace } from "@/store";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Dialog } from "../ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import CreateProjectForm from "./CreateProjectForm";

export default function NavWorkspaces({
  workspaces,
}: {
  workspaces: Workspace[] | null;
}) {
  const [showProjects, setShowProjects] = useState<boolean>(false);
  const router = useRouter();
  const defaultWorkspace = workspaces?.find((workspace) => workspace.isDefault);

  const [showProjectForm, setShowProjectForm] = useState<boolean>(false);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<
    string | undefined
  >(undefined);
  const store = useStore();

  useEffect(() => {
    if (store.workspaces) {
      const defaultWorkspace = store.workspaces.find(
        (workspace) => workspace.isDefault
      );
      setSelectedWorkspaceId(defaultWorkspace?.id);
    }
  }, [store.workspaces]);

  return (
    <Dialog
      open={showProjectForm}
      onOpenChange={() => {
        setShowProjectForm(!showProjectForm);
      }}
    >
      <SidebarMenu>
        {defaultWorkspace && (
          <SidebarMenuItem>
            <SidebarMenuButton>
              <span className="flex-1">{defaultWorkspace.name}</span>
              <div className="ml-auto flex gap-2 items-center">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div onClick={() => setShowProjectForm(true)}>
                      <Plus size={18} />
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
                    <SidebarMenuButton>{project.name}</SidebarMenuButton>
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
                  <div onClick={() => setShowProjectForm(!showProjectForm)}>
                    <Plus size={18} />
                  </div>
                </TooltipTrigger>
                <TooltipContent>Create Workspace</TooltipContent>
              </Tooltip>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>

        <SidebarMenuSub>
          {workspaces?.map((workspace) => {
            if (workspace.isDefault || workspace.id === selectedWorkspaceId) {
              return null;
            }

            return (
              <SidebarMenuItem key={workspace.id}>
                <SidebarMenuButton>
                  <div>{workspace.name}</div>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenuSub>
      </SidebarMenu>

      <CreateProjectForm
        workspaces={workspaces}
        selectedWorkspaceId={selectedWorkspaceId}
        setShowProjectForm={setShowProjectForm}
      />
    </Dialog>
  );
}
