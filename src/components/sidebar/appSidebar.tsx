import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";
import { useStore, Workspace } from "@/store";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import CreateTask from "./CreateTask";
import NavUser from "./NavUser";
import NavWorkspaces from "./NavWorkspaces";
import SidebarTriggerComponent from "./SidebarTrigger";

export interface SessionUser {
  id: string;
  email: string;
  token: string;
}

export default function AppSidebar() {
  const session = useSession();
  const user = session.data?.user as SessionUser;
  const router = useRouter();
  const { state, isMobile } = useSidebar();

  const store = useStore();
  const [workspaces, setWorkspaces] = useState<Workspace[] | null>(null);

  useEffect(() => {
    if (store.workspaces.length > 0) {
      setWorkspaces(store.workspaces);
      return;
    }

    const fetchWorkspaces = async () => {
      const workspaces = await store.fetchWorkspaceData();
      setWorkspaces(workspaces);
    };

    fetchWorkspaces();
  }, [store.workspaces]);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenuButton asChild>
          <div className={`flex ${!isMobile && "flex-row-reverse"} items-center justify-between`}>
            {!isMobile && <SidebarTriggerComponent state={state} />}
            <span className="cursor-pointer" onClick={() => router.push("/")}>
              kaizen
            </span>
          </div>
        </SidebarMenuButton>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="group-data-[collapsible=icon]:hidden">
          <CreateTask workspaces={workspaces} />
          {/* <NavProjects projects={allProjects} /> */}
          <NavWorkspaces workspaces={workspaces} />
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
