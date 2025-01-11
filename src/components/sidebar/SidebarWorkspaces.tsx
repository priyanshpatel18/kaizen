"use client";

import { Icons } from "@/components/others/icons";
import BinIcon from "@/components/svg/BinIcon";
import EditIcon from "@/components/svg/EditIcon";
import HashIcon from "@/components/svg/HashIcon";
import HeartIcon from "@/components/svg/HeartIcon";
import OptionIcon from "@/components/svg/OptionIcon";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Project, useProjectStore } from "@/store/project";
import { useWorkspaceStore } from "@/store/workspace";
import { ChevronDown, Folder } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { UpdateDataProps } from "@/lib/UpdateStoreData";
import SidebarItem from "./SidebarItem";

interface SidebarWorkspacesProps {
  setActiveDialog: Dispatch<SetStateAction<"project" | "workspace" | null>>;
  setProjectInput: Dispatch<SetStateAction<Project | undefined>>;
  setAction: Dispatch<SetStateAction<"create" | "update" | undefined>>;
  setProps: Dispatch<SetStateAction<UpdateDataProps | undefined>>;
  setSelectedWorkspaceId: Dispatch<SetStateAction<string | undefined>>;
  deleteProject: (project: Project) => void;
  updateProject: (project: Project, updateValue: object) => void;
}

export default function SidebarWorkspaces({
  setActiveDialog,
  setProjectInput,
  setAction,
  setProps,
  setSelectedWorkspaceId,
  deleteProject,
  updateProject,
}: SidebarWorkspacesProps) {
  const { workspaces } = useWorkspaceStore();
  const { projects } = useProjectStore();
  const [workspaceVisibility, setWorkspaceVisibility] = useState<Record<string, boolean>>({});
  const [favorites, setFavorites] = useState<Project[]>([]);

  useEffect(() => {
    const storedVisibility = localStorage.getItem("workspaceVisibility");

    if (storedVisibility) {
      setWorkspaceVisibility(JSON.parse(storedVisibility));
    } else {
      const defaultVisibility = workspaces.reduce(
        (acc, workspace) => {
          acc[workspace.id] = true; // Set to true by default
          return acc;
        },
        {} as Record<string, boolean>
      );
      setWorkspaceVisibility(defaultVisibility);
      localStorage.setItem("workspaceVisibility", JSON.stringify(defaultVisibility));
    }
  }, [workspaces]);

  useEffect(() => {
    if (Object.keys(workspaceVisibility).length > 0) {
      localStorage.setItem("workspaceVisibility", JSON.stringify(workspaceVisibility));
    }
  }, [workspaceVisibility]);

  useEffect(() => {
    const savedVisibility = localStorage.getItem("workspaceVisibility");
    if (savedVisibility) {
      setWorkspaceVisibility(JSON.parse(savedVisibility));
    }
  }, []);

  useEffect(() => {
    setProjectInput(undefined);

    const favoriteProjects = projects.filter((project) => project.isFavorite && !project.isDefault);
    setFavorites(favoriteProjects);
  }, [projects]);

  return (
    <section>
      {favorites && favorites.length > 0 && (
        <div className="flex flex-col gap-1">
          <div className="flex-1 select-none truncate font-semibold">
            <span>Favorites</span>
          </div>
          <div className="flex w-full flex-col gap-2">
            {favorites.map((project) => {
              return (
                <SidebarProject
                  key={project.id}
                  project={project}
                  deleteProject={deleteProject}
                  setAction={setAction}
                  updateProject={updateProject}
                  setActiveDialog={setActiveDialog}
                  setProjectInput={setProjectInput}
                />
              );
            })}
          </div>
          <Separator />
        </div>
      )}

      <div className="flex flex-col gap-1">
        <div className="flex-1 select-none truncate p-1 text-xs font-semibold text-muted-foreground">
          <span>Workspaces</span>
        </div>
        {workspaces &&
          workspaces.length > 0 &&
          workspaces.map((ws) => {
            return (
              <div key={ws.id}>
                <SidebarItem className="group justify-between rounded-md">
                  <div
                    className="flex cursor-pointer items-center"
                    onClick={() => {
                      setWorkspaceVisibility({
                        ...workspaceVisibility,
                        [ws.id]: !workspaceVisibility[ws.id],
                      });
                    }}
                  >
                    <Folder className="h-4 w-4 group-hover:hidden" />
                    <ChevronDown
                      className={`300ms hidden h-4 w-4 transition-transform group-hover:block ${workspaceVisibility[ws.id] ? "-rotate-90" : ""}`}
                    />
                  </div>

                  <Link href={`/app/workspaces/${ws.id}`} className="flex-1 select-none truncate font-semibold">
                    <span>{ws.name}</span>
                  </Link>
                  <Tooltip>
                    <TooltipTrigger
                      className="flex items-center gap-2"
                      onClick={() => {
                        setAction("create");
                        setProps(undefined);
                        setSelectedWorkspaceId(ws.id);
                        setActiveDialog("project");
                      }}
                    >
                      <Icons.add className="h-6 w-6 rounded p-1" />
                    </TooltipTrigger>
                    <TooltipContent>Create Project</TooltipContent>
                  </Tooltip>
                </SidebarItem>
                <div className={`${workspaceVisibility[ws.id] ? "flex" : "hidden"} w-full flex-col gap-2`}>
                  {projects.length > 0 &&
                    projects.map((project) => {
                      if (project.isDefault || project.workspaceId !== ws.id) return;

                      return (
                        <SidebarProject
                          key={project.id}
                          project={project}
                          deleteProject={deleteProject}
                          updateProject={updateProject}
                          setActiveDialog={setActiveDialog}
                          setProjectInput={setProjectInput}
                          setAction={setAction}
                        />
                      );
                    })}
                </div>
              </div>
            );
          })}
      </div>
    </section>
  );
}

interface SidebarProjectProps {
  project: Project;
  deleteProject: (project: Project) => void;
  updateProject: (project: Project, updateValue: object) => void;
  setActiveDialog: Dispatch<SetStateAction<"project" | "workspace" | null>>;
  setProjectInput: Dispatch<SetStateAction<Project | undefined>>;
  setAction: Dispatch<SetStateAction<"create" | "update" | undefined>>;
}

function SidebarProject({
  project,
  deleteProject,
  updateProject,
  setProjectInput,
  setActiveDialog,
  setAction,
}: SidebarProjectProps) {
  const [showMoreActions, setShowMoreActions] = useState<boolean>(false);
  const router = useRouter();
  const pathname = usePathname();

  return (
    <DropdownMenu open={showMoreActions} onOpenChange={(open) => setShowMoreActions(open)} modal={true}>
      <SidebarItem
        className={`group ml-4 justify-between ${pathname === `/app/projects/${project.id}` && "bg-accent"}`}
      >
        <Link href={`/app/projects/${project.id}`} className="w-full flex-1 select-none py-0.5">
          <Tooltip>
            <TooltipTrigger className="flex items-center gap-2">
              <HashIcon className="h-4 w-4" />
              <span className="text-sm leading-3">{project.name}</span>
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
              <OptionIcon className="h-4 w-4" />
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
            setActiveDialog("project");
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
