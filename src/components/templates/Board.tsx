"use client";

import BoardTemplate from "@/components/templates/BoardTemplate";
import ListTemplate from "@/components/templates/ListTemplate";
import { useStore } from "@/store";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

interface BoardProps {
  heading: string;
}

export default function Board({ heading }: BoardProps) {
  const pathname = usePathname();
  const { viewOptions, setViewOptions } = useStore();

  const currentView = viewOptions.find((option) => option.route === pathname)?.view || "list";

  useEffect(() => {
    if (!viewOptions.some((option) => option.route === pathname)) {
      setViewOptions([...viewOptions, { route: pathname, view: "list" }]);
    }
  }, [pathname, viewOptions, setViewOptions]);

  return <div>{currentView === "list" ? <ListTemplate heading={heading} /> : <BoardTemplate heading={heading} />}</div>;
}
