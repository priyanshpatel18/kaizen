"use client";

import Board from "@/components/dnd/Board";
import { Project, useProjectStore } from "@/store/project";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function ProjectPage() {
  const { projectId } = useParams();
  const { projects } = useProjectStore();

  const [project, setProject] = useState<Project | null>(null);

  useEffect(() => {
    if (projectId) {
      const project = projects.find((p) => p.id === projectId);

      if (project) setProject(project);
      return;
    }

    setProject(null);
  }, [projectId, projects]);

  return <Board heading={project?.name || "Project"} projectId={projectId as string} />;
}
