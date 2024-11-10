import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";
import { useProjects } from "@/hooks/useProjects";
import { useStore } from "@/store";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import CreateTask from "./CreateTask";
import NavProjects from "./NavProjects";
import NavUser from "./NavUser";
import SidebarTriggerComponent from "./SidebarTrigger";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  token: string;
  profilePicture: string | undefined;
}

export default function AppSidebar() {
  const session = useSession();
  const user = session.data?.user as SessionUser;
  const router = useRouter();
  const { state, isMobile } = useSidebar();

  const { projects: fetchedProjects } = useProjects();
  const store = useStore();
  const allProjects = store.projects || fetchedProjects || [];

  useEffect(() => {
    if (fetchedProjects && fetchedProjects !== store.projects) {
      store.setProjects(fetchedProjects);
    }
  }, [fetchedProjects, store]);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenuButton asChild>
          <div
            className={`flex ${
              !isMobile && "flex-row-reverse"
            } items-center justify-between`}
          >
            {!isMobile && <SidebarTriggerComponent state={state} />}
            <span className="cursor-pointer" onClick={() => router.push("/")}>
              kaizen
            </span>
          </div>
        </SidebarMenuButton>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="group-data-[collapsible=icon]:hidden">
          <CreateTask />
          <NavProjects projects={allProjects} />
          {/* <NavWorkspaces /> */}
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarGroup className="group-data-[collapsible=icon]:hidden">
          <NavUser user={user} />
        </SidebarGroup>
      </SidebarFooter>
    </Sidebar>
  );
}
