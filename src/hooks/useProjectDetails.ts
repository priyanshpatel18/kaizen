"use client";

import { Project, useStore } from "@/store";
import { useEffect, useState } from "react";

export function useProjectDetails() {
  const [projectsData, setProjectsData] = useState<Project[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { setProjects } = useStore();

  async function getProjects() {
    try {
      const res = await fetch("/api/project/get-projects", {
        method: "GET",
      });
      
      const data = await res.json();
      console.log(data);
      
      setProjectsData(data.projects);
      setProjects(data.projects);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getProjects();
  }, []);

  return { projects: projectsData, loading };
}
