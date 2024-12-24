"use client";

import HashIcon from "@/components/svg/HashIcon";
import OptionIcon from "@/components/svg/OptionIcon";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import Link from "next/link";
import { useState } from "react";

export default function Projects() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="flex w-full flex-1 flex-col items-center py-16">
      <div className="flex w-full max-w-3xl flex-col gap-6 px-4">
        <header className="flex flex-col">
          <h1 className="select-none truncate text-3xl font-black text-gray-900">My Projects</h1>
        </header>

        <div className="flex w-full max-w-5xl flex-col gap-3 self-center">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for a project..."
            className="mb-4"
          />

          {/* <div className="select-none truncate  text-md font-medium text-gray-900">{projects && projects.length ? projects.length : 0} project{projects && projects.length > 1 ? "s" : ""}</div> */}

          <Separator />

          <div className="group mb-4 cursor-pointer rounded-lg p-3 px-4 hover:bg-accent">
            <Link href="/projects/new" className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HashIcon className="h-6 rounded-sm p-0.5 opacity-50" />
                <span>Project Name</span>
              </div>
              <Tooltip>
                <TooltipTrigger>
                  <OptionIcon className="h-6 rounded-sm p-0.5 opacity-0 hover:bg-accent group-hover:opacity-100" />
                </TooltipTrigger>
                <TooltipContent>More actions</TooltipContent>
              </Tooltip>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
