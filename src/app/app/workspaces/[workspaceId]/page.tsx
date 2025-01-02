"use client";

import { Icons } from "@/components/icons";
import HashIcon from "@/components/svg/HashIcon";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useProjectStore } from "@/store/project";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";

export default function Projects() {
  const params = useParams();
  const [searchQuery, setSearchQuery] = useState("");
  const { projects: storeProjects } = useProjectStore();

  const filteredProjects = useMemo(() => {
    if (!params.workspaceId) return [];
    return storeProjects.filter(
      (project) =>
        project.workspaceId === params.workspaceId &&
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !project.isDefault
    );
  }, [searchQuery, storeProjects, params.workspaceId]);

  return (
    <div className="flex w-full flex-1 flex-col items-center py-16">
      <div className="flex w-full max-w-3xl flex-col gap-6 px-4">
        <header className="flex flex-col">
          <h1 className="select-none truncate text-3xl font-black text-gray-900">My Projects</h1>
        </header>

        <div className="flex w-full max-w-5xl flex-col gap-3 self-center">
          <Label className="mb-4 flex items-center rounded-md border-[1px] border-border p-1 focus-within:ring-1 focus-within:ring-ring">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for a project..."
              className="border-0 focus-visible:ring-0"
            />
            {searchQuery && (
              <Icons.x
                className="w-6 cursor-pointer rounded-sm px-1 hover:bg-accent"
                onClick={() => setSearchQuery("")}
                aria-label="Clear search"
              />
            )}
          </Label>

          <div className="text-md select-none truncate font-medium text-gray-900">
            {filteredProjects.length} project{filteredProjects.length !== 1 && "s"}
          </div>

          <Separator />

          <div className="flex flex-col">
            {filteredProjects.length > 0 ? (
              filteredProjects.map((project) => (
                <Link
                  href={`/app/projects/${project.id}`}
                  key={project.id}
                  className="group flex cursor-pointer items-center gap-2 rounded-lg px-4 hover:bg-accent"
                >
                  <HashIcon className="h-5 rounded-sm p-0.5 opacity-80" />
                  <h2 className="py-4 text-lg">{project.name}</h2>
                </Link>
              ))
            ) : (
              <div className="text-center text-gray-500">No projects found matching your search.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
