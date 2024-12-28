"use client";

import Project from "@/components/dnd/Project";
import TaskForm from "@/components/forms/TaskForm";
import { Dialog } from "@/components/ui/dialog";
import { Option, Project as ProjectState, useStore, Workspace } from "@/store";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export default function ProjectPage() {
  const { projectId } = useParams();

  // const { projects: fetchedProjects } = useProjects();
  const [workspaces, setWorkspaces] = useState<Workspace[] | null>(null);

  const store = useStore();
  const [project, setProject] = useState<ProjectState | null>(null);
  const [currentState, setCurrentState] = useState<Option | null>(null);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);

  const selectedProject = useMemo(() => {
    const allWorkspaces = store.workspaces || workspaces || [];

    if (!projectId) return null;
    const id = projectId[0];

    const ws = allWorkspaces?.flatMap((ws) => ws.projects);
    if (ws) setWorkspaceId(ws[0]?.workspaceId || null);

    const project = ws?.find((p) => p.id === id);

    return project || null;
  }, [projectId, store.workspaces, workspaces]);

  useEffect(() => {
    if (store.workspaces.length > 0) {
      setProject(selectedProject);
      setWorkspaces(store.workspaces);
      return;
    }

    const fetchWorkspaces = async () => {
      const workspaces = await store.fetchWorkspaceData();
      setWorkspaces(workspaces);
    };

    fetchWorkspaces();
  }, [store.workspaces]);

  return project ? (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <div className="flex h-screen p-6">
        <Project
          workspaceId={workspaceId}
          project={project}
          setProject={setProject}
          currentState={currentState}
          setCurrentState={setCurrentState}
        />
      </div>
      <TaskForm setShowDialog={setShowDialog} action="create" />
    </Dialog>
  ) : (
    <div>
      <h1>Oops! Project not found</h1>
    </div>
  );
}
