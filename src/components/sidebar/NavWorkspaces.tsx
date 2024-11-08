"use client";

import {
  ChevronDown,
  ChevronUp,
  LucideIcon,
  MoreHorizontal,
} from "lucide-react";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { useState } from "react";
import { Project } from "./NavProjects";

interface Workspace {
  id: string;
  title: string;
  icon?: LucideIcon;
  projects: Project[];
}

export default function NavWorkspaces({
  workspaces,
}: {
  workspaces: Workspace[];
}) {
  const [showProjects, setShowProjects] = useState<boolean>(false);

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Workspaces</SidebarGroupLabel>
      <SidebarMenu>
        {workspaces.map((workspace) => (
          <SidebarMenuItem key={workspace.id}>
            <SidebarMenuButton size="lg" className="justify-between border-0">
              <Link
                href={`/workspaces/${workspace.id}`}
                className="flex items-center gap-2"
              >
                {workspace.icon && <workspace.icon />}
                <span>{workspace.title}</span>
              </Link>
              <div className="shrink-0 flex-1 flex justify-end" onClick={() => setShowProjects(!showProjects)}>
                {showProjects ? (
                  <ChevronUp className="size-4" />
                ) : (
                  <ChevronDown className="size-4" />
                )}
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
        <SidebarMenuItem>
          <SidebarMenuButton className="text-sidebar-foreground/70">
            <MoreHorizontal className="text-sidebar-foreground/70" />
            <span>More</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}
