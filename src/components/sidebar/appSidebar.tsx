import { useCategoryStore } from "@/store/category";
import { useProjectStore } from "@/store/project";
import { useTaskStore } from "@/store/task";
import { useWorkspaceStore } from "@/store/workspace";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import CalendarIcon from "@/components/svg/CalendarIcon";
import HashIcon from "@/components/svg/HashIcon";
import InboxIcon from "@/components/svg/InboxIcon";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export interface SessionUser {
  id: string;
  email: string;
  token: string;
}

export default function AppSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { projects } = useProjectStore();

  const [profilePicture, setProfilePicture] = useState<string | undefined>(undefined);
  const [name, setName] = useState<string | undefined>(undefined);

  const { data: session } = useSession();

  useEffect(() => {
    if (session?.user) {
      if (!localStorage.getItem("profilePicture") && session.user.image) {
        localStorage.setItem("profilePicture", session.user.image);
      }

      if (!localStorage.getItem("name") && session.user.name) {
        localStorage.setItem("name", session.user.name);
      }
    }
  }, [session]);

  const loadProfileData = () => {
    const storedProfilePicture = localStorage.getItem("profilePicture")?.replace(/"/g, "");
    const storedName = localStorage.getItem("name")?.replace(/"/g, "");

    if (!storedName) {
      router.push("/onboard/profile");
    }

    setProfilePicture(storedProfilePicture || undefined);
    setName(storedName || undefined);
  };

  useEffect(() => {
    loadProfileData();
  }, []);

  useEffect(() => {
    const handleStorageChange = () => {
      loadProfileData();
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // All Stores
  const taskStore = useTaskStore();
  const categoryStore = useCategoryStore();
  const projectStore = useProjectStore();
  const workspaceStore = useWorkspaceStore();
  // const commonStore = useStore();

  useEffect(() => {
    if (workspaceStore.workspaces.length > 0) {
      return;
    }

    workspaceStore.fetchAllData({
      setTasks: taskStore.setTasks,
      setCategories: categoryStore.setCategories,
      setProjects: projectStore.setProjects,
      setWorkspaces: workspaceStore.setWorkspaces,
    });
  }, [workspaceStore.workspaces]);

  return (
    <main className="flex w-[15%] flex-col gap-2 border-[1px] border-r-border p-2">
      <SidebarItem>
        <Avatar className="relative flex h-10 w-10 items-center justify-center rounded-full border-2 border-black p-[0.5px]">
          <div className="h-8 w-8 overflow-hidden rounded-full">
            <AvatarImage
              src={profilePicture || undefined}
              alt={name || "profile"}
              className="h-full w-full object-cover"
            />
          </div>
          <AvatarFallback className="absolute inset-0 flex items-center justify-center rounded-full bg-gray-200 text-lg font-bold text-black">
            {name?.charAt(0) || "U"}
          </AvatarFallback>
        </Avatar>

        <div className="grid flex-1 text-left text-xl">
          <span className="font-arial select-none truncate font-semibold">{name}</span>
        </div>
      </SidebarItem>

      <Separator />

      <div className="flex flex-col gap-1">
        <Link href={"/app/inbox"}>
          <SidebarItem className={`${pathname === "/app/inbox" && "bg-accent"}`}>
            <InboxIcon color="#292D32" active={pathname === "/app/inbox"} />
            <span className={`${pathname === "/app/inbox" ? "font-semibold" : ""}`}>Inbox</span>
          </SidebarItem>
        </Link>
        <Link href={"/app/today"}>
          <SidebarItem className={`${pathname === "/app/today" && "bg-accent"}`}>
            <CalendarIcon color="#292D32" active={pathname === "/app/today"} />
            <span className={`${pathname === "/app/today" ? "font-semibold" : ""}`}>Today</span>
          </SidebarItem>
        </Link>
      </div>

      <Separator />

      <div className="flex flex-col gap-1">
        <Link href={"/app/projects"} className="select-none truncate text-lg font-semibold">
          <SidebarItem className="rounded-md">My Projects</SidebarItem>
        </Link>
        <div className="flex w-full flex-col">
          {projects.length > 0 ? (
            projects.map((project) => {
              if (project.isDefault) return;

              return (
                <Tooltip key={project.id}>
                  <TooltipTrigger>
                    <SidebarItem>
                      <HashIcon className="h-4 w-4" />
                      <span className="text-sm leading-3">{project.name}</span>
                    </SidebarItem>
                  </TooltipTrigger>
                  <TooltipContent>{project.name}</TooltipContent>
                </Tooltip>
              );
            })
          ) : (
            <div></div>
          )}
        </div>
      </div>
    </main>
  );
}

function SidebarItem({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`${className} 300ms flex cursor-pointer items-center gap-2 rounded-md p-2 py-[6px] transition-all hover:bg-accent`}
    >
      {children}
    </div>
  );
}
