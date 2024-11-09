"use client";

import { Project, TaskComboBox, useStore } from "@/store";
import { useEffect, useState } from "react";

export function useProjects() {
  const [projectsData, setProjectsData] = useState<Project[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { setProjects, setTaskComboBox } = useStore();

  async function getProjects() {
    try {
      const res = await fetch("/api/project/get-projects", {
        method: "GET",
      });

      const data = await res.json();

      const projects = data.projects as Project[];

      setProjectsData(data.projects);
      setProjects(data.projects);

      const taskComboBoxItems: TaskComboBox[] = [];

      projects.forEach((project) => {
        project.categories.forEach((category) => {
          taskComboBoxItems.push({
            projectId: project.id,
            projectName: project.name,
            categoryId: category.id,
            categoryName: category.name,
          });
        });
      });

      setTaskComboBox(taskComboBoxItems);
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
