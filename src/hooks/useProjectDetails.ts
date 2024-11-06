"use client";

import { ProjectState } from "@/components/dnd/Project";
import { useEffect, useState } from "react";

export function useProjectDetails() {
  const [projects, setProjects] = useState<ProjectState[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  async function getProjects() {
    try {
      const res = await fetch("/api/project/get-projects", {
        method: "GET",
      });

      const data = await res.json();
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

  return { projects, loading };
}

interface BoardData {
  id: string;
  name: string;
  userId: string;
  columnMap: {
    [key: string]: string[];
  };
  orderedColumnIds: string[];
  lastOperation: null;
}

export const UseProjectDetails = () => {
  const [data, setData] = useState<BoardData | null>(null);
  const [projectId, setProjectId] = useState<string>("");
  async function fetchProjectDetails() {
    try {
      const res = await fetch("/api/board/get-board-details", {
        method: "GET",
      }).then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch board details");
        }
        return res.json();
      });
      setProjectId(res.data.id);
      console.log("response =", res.data);
      setData(res.data.columnMap);
    } catch (err) {
      console.log("Something went wrong :", err);
    }
  }

  useEffect(() => {
    fetchProjectDetails();
    console.log(fetchProjectDetails);
  }, []);

  return {
    fetchProjectDetails,
    setData,
    data,
    projectId,
  };
};
