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
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { toast } from "sonner";
import ProjectForm from "../forms/ProjectForm";
import { Icons } from "../icons";
import BinIcon from "../svg/BinIcon";
import EditIcon from "../svg/EditIcon";
import HeartIcon from "../svg/HeartIcon";
import OptionIcon from "../svg/OptionIcon";
import { Dialog } from "../ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";

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
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | undefined>(undefined);
  const [props, setProps] = useState<UpdateProps | undefined>(undefined);

  const [profilePicture, setProfilePicture] = useState<string | undefined>(undefined);
  const [name, setName] = useState<string | undefined>(undefined);

  const [showProjectForm, setShowProjectForm] = useState<boolean>(false);
  const [projectInput, setProjectInput] = useState<Project | undefined>(undefined);
  const [action, setAction] = useState<"create" | "update" | undefined>(undefined);

  const { data: session } = useSession();

  const [favorites, setFavorites] = useState<Project[]>([]);

  useEffect(() => {
    setProjectInput(undefined);

    const favoriteProjects = projects.filter((project) => project.isFavorite && !project.isDefault);
    setFavorites(favoriteProjects);
  }, [projects]);

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

  async function deleteProject(project: Project) {
    setProps(undefined);

    try {
      setProps({
        data: project,
        action: "delete",
        type: "project",
      });

      const response = await fetch(`/api/project/delete`, {
        method: "DELETE",
        body: JSON.stringify({
          id: project.id,
        }),
      });

      if (response.ok) {
        toast.success("Project deleted successfully");
        if (pathname.includes(project.id)) {
          router.push("/app/today");
        }
      }
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  }

  async function updateProject(project: Project, updateValue: object) {
    setProps(undefined);

    const newProject = {
      ...project,
      ...updateValue,
    };

    try {
      setProps({
        data: newProject,
        action: "update",
        type: "project",
      });

      const response = await fetch(`/api/project/update`, {
        method: "PUT",
        body: JSON.stringify({
          id: project.id,
          updateValue,
        }),
      });

      const { message, project: resProject } = await response.json();
      if (response.ok && resProject) {
        toast.success(message);
      } else {
        toast.error(message);
      }
    } catch (error) {
      console.error("Error updating project:", error);
    }
  }

  return (
    <Dialog open={showProjectForm} onOpenChange={setShowProjectForm}>
      <main className="fixed z-10 flex h-screen w-[15%] flex-col gap-2 border-[1px] border-r-border p-2">
        <SidebarItem className="p-2">
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
            <SidebarItem className={`${pathname === "/app/inbox" && "bg-accent"} p-2 py-2.5`}>
              <InboxIcon color="#292D32" active={pathname === "/app/inbox"} />
              <span className={`${pathname === "/app/inbox" ? "font-semibold" : ""}`}>Inbox</span>
            </SidebarItem>
          </Link>
          <Link href={"/app/today"}>
            <SidebarItem className={`${pathname === "/app/today" && "bg-accent"} p-2 py-2.5`}>
              <CalendarIcon color="#292D32" active={pathname === "/app/today"} />
              <span className={`${pathname === "/app/today" ? "font-semibold" : ""}`}>Today</span>
            </SidebarItem>
          </Link>
        </div>

        <Separator />

        {favorites && favorites.length > 0 && (
          <div className="flex flex-col gap-1">
            <SidebarItem className="justify-between rounded-md p-2.5">
              <div className="flex-1 select-none truncate text-lg font-semibold">
                <span>Favorites</span>
              </div>
            </SidebarItem>
            <div className="flex w-full flex-col gap-2">
              {favorites.map((project) => {
                return (
                  <SidebarProject
                    key={project.id}
                    project={project}
                    deleteProject={deleteProject}
                    setAction={setAction}
                    updateProject={updateProject}
                    setShowProjectForm={setShowProjectForm}
                    setProjectInput={setProjectInput}
                  />
                );
              })}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-1">
          {workspaces && workspaces.length > 0 ? (
            workspaces.map((ws) => {
              return (
                <div key={ws.id}>
                  <SidebarItem className="justify-between rounded-md p-2.5">
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
                          setAction("create");
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
                          <SidebarProject
                            key={project.id}
                            project={project}
                            deleteProject={deleteProject}
                            updateProject={updateProject}
                            setShowProjectForm={setShowProjectForm}
                            setProjectInput={setProjectInput}
                            setAction={setAction}
                          />
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
        projectInput={projectInput}
        setProjectInput={setProjectInput}
        action={action}
        updateProject={updateProject}
      />

      {props && <UpdateStoreData data={props.data} type={props.type} action={props.action} />}
    </Dialog>
  );
}

function SidebarItem({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`${className} 300ms flex cursor-pointer items-center gap-2 rounded transition-all hover:bg-accent`}>
      {children}
    </div>
  );
}

interface SidebarProjectProps {
  project: Project;
  deleteProject: (project: Project) => void;
  updateProject: (project: Project, updateValue: object) => void;
  setShowProjectForm: Dispatch<SetStateAction<boolean>>;
  setProjectInput: Dispatch<SetStateAction<Project | undefined>>;
  setAction: Dispatch<SetStateAction<"create" | "update" | undefined>>;
}

function SidebarProject({
  project,
  deleteProject,
  updateProject,
  setProjectInput,
  setShowProjectForm,
  setAction,
}: SidebarProjectProps) {
  const [showMoreActions, setShowMoreActions] = useState<boolean>(false);
  const router = useRouter();
  const pathname = usePathname();

  return (
    <DropdownMenu open={showMoreActions} onOpenChange={(open) => setShowMoreActions(open)} modal={true}>
      <SidebarItem className={`group justify-between ${pathname === `/app/projects/${project.id}` && "bg-accent"}`}>
        <Link href={`/app/projects/${project.id}`} className="w-full flex-1 select-none p-2 py-2.5">
          <Tooltip>
            <TooltipTrigger className="flex items-center gap-2">
              <HashIcon className="h-4 w-4" />
              <span className="text-base leading-3">{project.name}</span>
            </TooltipTrigger>
            <TooltipContent>{project.name}</TooltipContent>
          </Tooltip>
        </Link>

        <Tooltip>
          <TooltipTrigger
            asChild
            className="flex items-center gap-2 px-2 opacity-0 outline-none group-hover:opacity-100"
          >
            <DropdownMenuTrigger>
              <OptionIcon color="#292D32" className="h-4 w-4" />
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>More Actions</TooltipContent>
        </Tooltip>
      </SidebarItem>

      <DropdownMenuContent>
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => {
            setShowMoreActions(false);
            router.push(`/app/projects/${project.id}`);
          }}
        >
          <Icons.folder className="h-6" />
          <span>View Project</span>
        </DropdownMenuItem>

        <Separator />
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => {
            setShowMoreActions(false);
            setAction("update");
            setProjectInput(project);
            setShowProjectForm(true);
          }}
        >
          <EditIcon className="h-6" />
          <span>Edit</span>
        </DropdownMenuItem>
        {project.isFavorite ? (
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => {
              setShowMoreActions(false);
              updateProject(project, { isFavorite: false });
            }}
          >
            <HeartIcon className="h-4" cancel />
            <span>Remove from favorites</span>
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => {
              setShowMoreActions(false);
              updateProject(project, { isFavorite: true });
            }}
          >
            <HeartIcon className="h-4" />
            <span>Add to favorites</span>
          </DropdownMenuItem>
        )}

        <Separator />
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => {
            setShowMoreActions(false);
            deleteProject(project);
          }}
        >
          <BinIcon color="#de0a26" />
          <span className="text-sm text-[#de0a26]">Delete</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
