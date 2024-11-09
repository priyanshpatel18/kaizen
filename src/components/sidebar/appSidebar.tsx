import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenuButton,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Frame, Map, PieChart } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import CreateTask from "./CreateTask";
import NavProjects from "./NavProjects";
import NavUser from "./NavUser";
import NavWorkspaces from "./NavWorkspaces";
import SidebarTriggerComponent from "./SidebarTrigger";
import { useProjects } from "@/hooks/useProjects";
import { useStore } from "@/store";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  token: string;
  profilePicture: string | undefined;
}

const projects = [
  {
    id: "1",
    title: "Design Engineering",
    icon: Frame,
  },
  {
    id: "2",
    title: "Sales and Marketing",
    icon: PieChart,
  },
  {
    id: "3",
    title: "Travel",
    icon: Map,
  },
];

const workspaces = [
  {
    id: "1",
    title: "Design Engineering",
    icon: Frame,
    projects: projects,
  },
  {
    id: "2",
    title: "Sales and Marketing",
    icon: PieChart,
    projects: projects,
  },
  {
    id: "3",
    title: "Travel",
    icon: Map,
    projects: projects,
  },
];

export default function AppSidebar() {
  const session = useSession();
  const [user, setUser] = useState<SessionUser | undefined>(undefined);
  const router = useRouter();
  const { state, isMobile } = useSidebar();

  const { projects: fetchedProjects } = useProjects();
  const store = useStore();
  const allProjects = store.projects || fetchedProjects || [];

  useEffect(() => {
    if (session) {
      const sessionUser = session.data?.user as SessionUser;
      setUser(sessionUser);
    }
  }, [session]);

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
