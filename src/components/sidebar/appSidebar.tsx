import CalendarIcon from "@/components/svg/CalendarIcon";
import HashIcon from "@/components/svg/HashIcon";
import InboxIcon from "@/components/svg/InboxIcon";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import UpdateStoreData from "@/lib/UpdateStoreData";
import { Category, useCategoryStore } from "@/store/category";
import { Project, useProjectStore } from "@/store/project";
import { Task, useTaskStore } from "@/store/task";
import { useWorkspaceStore, Workspace } from "@/store/workspace";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ProjectForm from "../forms/ProjectForm";
import { Icons } from "../icons";
import { Dialog } from "../ui/dialog";

export interface SessionUser {
  id: string;
  email: string;
  token: string;
}

export interface UpdateProps {
  data: Category | Task | Project | Workspace;
  action: "create" | "update" | "delete";
  type: "task" | "category" | "project" | "workspace";
}

export default function AppSidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const { setTasks } = useTaskStore();
  const { setCategories } = useCategoryStore();
  const { projects, setProjects } = useProjectStore();
  const { workspaces, setWorkspaces, fetchAllData } = useWorkspaceStore();
  const [showProjectForm, setShowProjectForm] = useState<boolean>(false);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | undefined>(undefined);
  const [props, setProps] = useState<UpdateProps | undefined>(undefined);

  const [profilePicture, setProfilePicture] = useState<string | undefined>(undefined);
  const [name, setName] = useState<string | undefined>(undefined);

  const { data: session } = useSession();

  useEffect(() => {
    setShowProjectForm(false);

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
      router.push("/app/onboard/profile");
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

  useEffect(() => {
    if (workspaces.length > 0) {
      return;
    }

    fetchAllData({
      setTasks,
      setCategories,
      setProjects,
      setWorkspaces,
    });
  }, [workspaces]);

  return (
    <Dialog open={showProjectForm} onOpenChange={setShowProjectForm}>
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
          {workspaces && workspaces.length > 0 ? (
            workspaces.map((ws) => {
              return (
                <div key={ws.id}>
                  <SidebarItem className="justify-between rounded-md">
                    <Link
                      href={`/app/workspaces/${ws.id}`}
                      className="flex-1 select-none truncate text-lg font-semibold"
                    >
                      <span>{ws.name}</span>
                    </Link>
                    <Tooltip>
                      <TooltipTrigger
                        className="flex items-center gap-2"
                        onClick={() => {
                          setProps(undefined);
                          setSelectedWorkspaceId(ws.id);
                          setShowProjectForm(true);
                        }}
                      >
                        <Icons.add className="h-6 w-6 rounded p-1" />
                      </TooltipTrigger>
                      <TooltipContent>Create Project</TooltipContent>
                    </Tooltip>
                  </SidebarItem>
                  <div className="flex w-full flex-col gap-2">
                    {projects.length > 0 ? (
                      projects.map((project) => {
                        if (project.isDefault || project.workspaceId !== ws.id) return;

                        return (
                          <Link key={project.id} href={`/app/projects/${project.id}`} className="w-full select-none">
                            <SidebarItem key={project.id}>
                              <Tooltip>
                                <TooltipTrigger className="flex items-center gap-2">
                                  <HashIcon className="h-4 w-4" />
                                  <span className="text-base leading-3">{project.name}</span>
                                </TooltipTrigger>
                                <TooltipContent>{project.name}</TooltipContent>
                              </Tooltip>
                            </SidebarItem>
                          </Link>
                        );
                      })
                    ) : (
                      <div></div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div></div>
          )}
        </div>
      </main>

      <ProjectForm
        selectedWorkspaceId={selectedWorkspaceId}
        setShowProjectForm={setShowProjectForm}
        setProps={setProps}
      />

      {props && <UpdateStoreData data={props.data} type={props.type} action={props.action} />}
    </Dialog>
  );
}

function SidebarItem({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`${className} 300ms flex cursor-pointer items-center gap-2 rounded p-2 py-2.5 transition-all hover:bg-accent`}
    >
      {children}
    </div>
  );
}
