import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { Frame, Map, PieChart } from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import NavProjects from "./NavProjects";
import NavUser from "./NavUser";
import NavWorkspaces from "./NavWorkspaces";
import CreateTask from "./CreateTask";
import { useRouter } from "next/navigation";

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

  useEffect(() => {
    if (session) {
      const sessionUser = session.data?.user as SessionUser;
      setUser(sessionUser);
    }
  }, [session]);

  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenuButton onClick={() => router.push("/")}>
          KAIZEN
        </SidebarMenuButton>
      </SidebarHeader>
      <SidebarContent>
        <CreateTask />
        <NavProjects projects={projects} />
        <NavWorkspaces workspaces={workspaces} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
