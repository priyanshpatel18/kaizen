"use client";

import BoardTemplate from "@/components/templates/BoardTemplate";
import ListTemplate from "@/components/templates/ListTemplate";
import { useStore } from "@/store";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

interface BoardProps {
  heading: string;
}

export default function Board({ heading }: BoardProps) {
  const pathname = usePathname();
  const { viewOptions } = useStore();
  const [currentView, setCurrentView] = useState<"list" | "board">("list");

  useEffect(() => {
    setCurrentView(viewOptions.find((option) => option.route === pathname)?.view || "list");
  }, [viewOptions]);

  return <div>{currentView === "list" ? <ListTemplate heading={heading} /> : <BoardTemplate heading={heading} />}</div>;
}
