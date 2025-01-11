"use client";

import ProjectForm from "@/components/forms/ProjectForm";
import WorkspaceForm from "@/components/forms/WorkspaceForm";
import CalendarIcon from "@/components/svg/CalendarIcon";
import InboxIcon from "@/components/svg/InboxIcon";
import { Dialog } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import UpdateStoreData, { UpdateDataProps } from "@/lib/UpdateStoreData";
import { useCategoryStore } from "@/store/category";
import { Project, useProjectStore } from "@/store/project";
import { useTaskStore } from "@/store/task";
import { useWorkspaceStore } from "@/store/workspace";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import SidebarItem from "./SidebarItem";
import SidebarUser from "./SidebarUser";
import SidebarWorkspaces from "./SidebarWorkspaces";

export interface SessionUser {
  id: string;
  email: string;
  token: string;
}

interface IProps {
  className?: string;
  isVisible?: boolean;
}

export default function AppSidebar({ className, isVisible }: IProps) {
  const router = useRouter();
  const pathname = usePathname();

  const { setTasks } = useTaskStore();
  const { setCategories } = useCategoryStore();
  const { setProjects } = useProjectStore();
  const { workspaces, setWorkspaces, fetchAllData } = useWorkspaceStore();
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | undefined>(undefined);
  const [props, setProps] = useState<UpdateDataProps | undefined>(undefined);

  const [profilePicture, setProfilePicture] = useState<string | undefined>(undefined);
  const [name, setName] = useState<string | undefined>(undefined);

  const [projectInput, setProjectInput] = useState<Project | undefined>(undefined);

  const [activeDialog, setActiveDialog] = useState<"project" | "workspace" | null>(null);
  const closeDialog = () => setActiveDialog(null);

  const [action, setAction] = useState<"create" | "update" | undefined>(undefined);
  const { data: session } = useSession();

  useEffect(() => {
    closeDialog();

    if (session?.user) {
      if (!localStorage.getItem("profilePicture") && session.user.image) {
        localStorage.setItem("profilePicture", session.user.image as string);
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
    <aside
      className={`${className} flex flex-col gap-2 border-r border-border p-2 transition-all duration-300 ${
        isVisible ? "overflow-visible" : "overflow-hidden"
      }`}
    >
      <Dialog open={!!activeDialog} onOpenChange={closeDialog}>
        <SidebarUser name={name} profilePicture={profilePicture} session={session} setActiveDialog={setActiveDialog} />

        <Separator />

        <div className="flex flex-col gap-1">
          <Link href={"/app/inbox"}>
            <SidebarItem className={`${pathname === "/app/inbox" && "bg-accent"}`}>
              <InboxIcon active={pathname === "/app/inbox"} />
              <span className={`${pathname === "/app/inbox" ? "font-semibold" : ""}`}>Inbox</span>
            </SidebarItem>
          </Link>
          <Link href={"/app/today"}>
            <SidebarItem className={`${pathname === "/app/today" && "bg-accent"}`}>
              <CalendarIcon active={pathname === "/app/today"} />
              <span className={`${pathname === "/app/today" ? "font-semibold" : ""}`}>Today</span>
            </SidebarItem>
          </Link>
        </div>

        <Separator />

        <SidebarWorkspaces
          setActiveDialog={setActiveDialog}
          setProjectInput={setProjectInput}
          setAction={setAction}
          setProps={setProps}
          setSelectedWorkspaceId={setSelectedWorkspaceId}
          deleteProject={deleteProject}
          updateProject={updateProject}
        />

        {activeDialog === "project" && (
          <ProjectForm
            selectedWorkspaceId={selectedWorkspaceId}
            setActiveDialog={setActiveDialog}
            setProps={setProps}
            projectInput={projectInput}
            setProjectInput={setProjectInput}
            action={action}
            updateProject={updateProject}
          />
        )}

        {activeDialog === "workspace" && (
          <WorkspaceForm setActiveDialog={setActiveDialog} setProps={setProps} action={action} />
        )}

        {props && <UpdateStoreData data={props.data} type={props.type} action={props.action} />}
      </Dialog>
    </aside>
  );
}
