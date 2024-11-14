"use client";

import Project from "@/components/dnd/Project";
import CreateTaskForm from "@/components/forms/CreateTaskForm";
import { Dialog } from "@/components/ui/dialog";
import { useProjects } from "@/hooks/useProjects";
import { Option, Project as ProjectState, useStore } from "@/store";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export default function ProjectPage() {
  const { projects: fetchedProjects } = useProjects();
  const { projectId } = useParams();
  const store = useStore();
  const [project, setProject] = useState<ProjectState | null>(null);
  const [currentState, setCurrentState] = useState<Option | null>(null);
  const [showDialog, setShowDialog] = useState<boolean>(false);

  const selectedProject = useMemo(() => {
    const allProjects = store.projects || fetchedProjects || [];

    const id = projectId[0];
    if (!projectId) return null;

    const project = allProjects.find((project) => project.id === id);

    return project || null;
  }, [projectId, store.projects, fetchedProjects]);

  useEffect(() => {
    setProject(selectedProject);

    if (selectedProject?.categories.length === 0) {
      return;
    }
    setCurrentState({
      label: `${selectedProject?.name} # ${selectedProject?.categories[0].name}`,
      value: `${selectedProject?.id} # ${selectedProject?.categories[0].id}`,
    });
  }, [selectedProject]);

  return project ? (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <div className="p-6 h-screen flex">
        <Project
          project={project}
          setProject={setProject}
          currentState={currentState}
          setCurrentState={setCurrentState}
        />
      </div>
      <CreateTaskForm setShowDialog={setShowDialog} />
    </Dialog>
  ) : (
    <div>
      <h1>Oops! Project not found</h1>
    </div>
  );
}
