"use client";

import ViewIcon from "@/components/svg/ViewIcon";
import ViewTypeIcon from "@/components/svg/ViewTypeIcon";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePathname } from "next/navigation";
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";

const taskedRoutes = ["/inbox", "/today"];

interface ViewOption {
  route: string;
  view: "list" | "board";
}

export default function PagesWithTasksLayout({ children }: { children: React.ReactNode }) {
  const [view, setView] = useState<"list" | "board">("list");
  const pathname = usePathname();

  return (
    <DropdownMenu modal={true}>
      <div className="relative flex h-screen w-full flex-col">
        <ViewOption />
        {children}
      </div>
      <ViewOptionDropDown view={view} setView={setView} pathname={pathname} />
    </DropdownMenu>
  );
}

function ViewOption({}) {
  return (
    <div className="300ms absolute right-6 top-2">
      <DropdownMenuTrigger className="outline-none">
        <div className="flex cursor-pointer items-center gap-2 rounded-sm p-1 px-2 transition-all hover:bg-accent">
          <ViewIcon className="h-4 w-4" />
          <span className="font-productSans text-sm">View</span>
        </div>
      </DropdownMenuTrigger>
    </div>
  );
}

interface DropDownProps {
  view: "list" | "board";
  setView: Dispatch<SetStateAction<"list" | "board">>;
  pathname: string;
}

function ViewOptionDropDown({ view, setView, pathname }: DropDownProps) {
  function changeView(view: "list" | "board") {
    const view_options: ViewOption[] = JSON.parse(localStorage.getItem("view_options") as string);
    const updatedViewOptions = view_options.map((option: ViewOption) => {
      if (option.route === pathname) {
        return { ...option, view };
      }
      return option;
    });
    localStorage.setItem("view_options", JSON.stringify(updatedViewOptions));
    setView(view);
  }

  useEffect(() => {
    const viewOptions = localStorage.getItem("view_options");

    if (!viewOptions) {
      const initialView: ViewOption[] = taskedRoutes.map((route) => ({
        route,
        view: "list",
      }));
      localStorage.setItem("view_options", JSON.stringify(initialView));
      return;
    }

    try {
      const view_options: ViewOption[] = JSON.parse(viewOptions);
      const viewOption = view_options.find((option) => option.route === pathname);

      if (viewOption) {
        setView(viewOption.view);
      } else {
        const updatedViewOptions = [...view_options, { route: pathname, view: "list" }];
        localStorage.setItem("view_options", JSON.stringify(updatedViewOptions));
        setView("list");
      }
    } catch (error) {
      console.error("Failed to parse view options:", error);
    }
  }, [pathname]);

  return (
    <DropdownMenuContent side="bottom" align="end">
      <DropdownMenuLabel>
        <span className="font-productSans text-base">View</span>
      </DropdownMenuLabel>
      <div className="flex w-full items-center gap-2">
        <DropdownMenuItem
          onClick={() => changeView("list")}
          className={`flex h-20 w-20 cursor-pointer flex-col items-center justify-center text-sm ${
            view === "list" ? "bg-accent font-bold text-primary" : ""
          }`}
        >
          <div className="flex flex-col items-center gap-0.5">
            <ViewTypeIcon className="h-5 w-5" active={view === "list"} />
            List
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => changeView("board")}
          className={`flex h-20 w-20 cursor-pointer items-center justify-center text-sm ${
            view === "board" ? "bg-accent font-bold text-primary" : ""
          }`}
        >
          <div className="flex flex-col items-center gap-0.5">
            <ViewTypeIcon className="h-5 w-5 rotate-90" active={view === "board"} />
            Board
          </div>
        </DropdownMenuItem>
      </div>
    </DropdownMenuContent>
  );
}
