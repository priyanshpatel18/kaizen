"use client";

import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Project, useStore } from "@/store";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Projects() {
  const store = useStore();

  const [projects, setProjects] = useState<Project[] | undefined>(undefined);

  const [searchQuery, setSearchQuery] = useState("");

  const filteredProjects = projects?.filter((project) =>
    project.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const fetchProjects = async () => {
      const projects = await store.fetchProjectData();
      setProjects(projects || []);
    };
    fetchProjects();
  }, [store]);

  return (
    <div className="flex h-screen flex-col p-6">
      <h1 className="text-3xl font-bold capitalize">My Projects</h1>
      <Separator className="my-4" />

      <div className="flex w-full max-w-5xl flex-col self-center">
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for a project..."
          className="mb-4"
        />

        {filteredProjects?.length === 0 ? (
          <p>No projects found.</p>
        ) : (
          filteredProjects?.map((project) => <ProjectCard key={project.id} project={project} />)
        )}
      </div>
    </div>
  );
}

// ProjectCard Component
function ProjectCard({ project }: { project: Project }) {
  return (
    <div className="mb-4 rounded-lg border border-gray-300 p-4">
      <Link href={`/projects/${project.id}`} className="text-xl">
        {project.name}
      </Link>
    </div>
  );
}
