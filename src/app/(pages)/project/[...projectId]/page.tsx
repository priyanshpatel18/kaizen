"use client";

import { Project, useStore } from "@/store";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function ProjectPage() {
  const { projectId } = useParams();
  const store = useStore();
  const hasFetched = useRef(false);
  const [project, setProject] = useState<Project | undefined>(undefined);

  // useStore.subscribe((state) => {

  // });

  useEffect(() => {
    async function fetchProject() {
      if (hasFetched.current) return;

      let selectedProject = store.projects.find((p) => p.id === projectId[0]);

      if (selectedProject) {
        setProject(selectedProject);
      } else {
        if (store.projects.length === 0 && !store.loading) {
          const projects = await store.fetchProjectData();
          if (projects) {
            const projectFromStore = projects.find(
              (p) => p.id === projectId[0]
            );
            setProject(projectFromStore);
          }
        } else if (store.projects.length > 0) {
          const projectFromStore = store.projects.find(
            (p) => p.id === projectId[0]
          );
          setProject(projectFromStore);
        }
      }

      hasFetched.current = true;
    }

    fetchProject();
  }, [projectId, store.projects]);

  return <div className="flex gap-2"></div>;
}
