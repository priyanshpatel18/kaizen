"use client";

import Project from "@/components/dnd/Project";
import { Data } from "@/components/sidebar/CreateTask";
import CreateTaskForm from "@/components/sidebar/CreateTaskForm";
import { Dialog } from "@/components/ui/dialog";
import { useProjects } from "@/hooks/useProjects";
import { Project as ProjectState, useStore } from "@/store";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export default function ProjectPage() {
  const { projects: fetchedProjects } = useProjects();
  const { projectId } = useParams();
  const store = useStore();

  const [project, setProject] = useState<ProjectState | undefined>(undefined);
  const [currentState, setCurrentState] = useState<Data | null>(null);
  const [showDialog, setShowDialog] = useState<boolean>(false);

  const [projectsData, setProjectsData] = useState<ProjectState[] | null>(null);

  // useStore.subscribe((state) => {

  // });

  const selectedProject = useMemo(() => {
    const allProjects = store.projects || fetchedProjects || [];
    const id = projectId[0] || projectId;
    if (!projectId) return undefined;
    return allProjects.find((p) => p.id === id);
  }, [projectId, store.projects, fetchedProjects]);

  useEffect(() => {
    setProject(selectedProject);
    setCurrentState({
      label: `${selectedProject?.name} # ${selectedProject?.categories[0].name}`,
      value: `${selectedProject?.id} # ${selectedProject?.categories[0].id}`,
    });
  }, [selectedProject]);

  return project ? (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <div className="p-6 min-h-screen">
        <Project projects={projectsData} selectedProject={project} />
      </div>
      <CreateTaskForm
        currentState={currentState}
        setCurrentState={setCurrentState}
        setShowDialog={setShowDialog}
      />
    </Dialog>
  ) : (
    <div>
      <h1>Oops! Project not found</h1>
    </div>
  );
}
