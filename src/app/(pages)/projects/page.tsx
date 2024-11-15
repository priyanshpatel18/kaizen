"use client";

import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useProjects } from "@/hooks/useProjects";
import { Project, useStore } from "@/store";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Projects() {
  const { projects: fetchedProjects } = useProjects();
  const store = useStore();

  const [projects, setProjects] = useState<Project[] | undefined>(undefined);
  const allProjects = store.projects || fetchedProjects || [];

  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setProjects(store.projects || fetchedProjects || []);
  }, [store.projects, fetchedProjects]);

  const filteredProjects = projects?.filter((project) =>
    project.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 h-screen flex flex-col">
      <h1 className="text-3xl font-bold capitalize">My Projects</h1>
      <Separator className="my-4" />

      <div className="max-w-5xl w-full flex flex-col self-center">
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for a project..."
          className="mb-4"
        />

        {filteredProjects?.length === 0 ? (
          <p>No projects found.</p>
        ) : (
          filteredProjects?.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))
        )}
      </div>
    </div>
  );
}

// ProjectCard Component
function ProjectCard({ project }: { project: Project }) {
  return (
    <div className="border border-gray-300 rounded-lg p-4 mb-4">
      <Link href={`/projects/${project.id}`} className="text-xl">
        {project.name}
      </Link>
    </div>
  );
}
