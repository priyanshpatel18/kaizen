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
import { useStore, ViewOption } from "@/store";
import { usePathname } from "next/navigation";
import React, { useEffect } from "react";

const taskedRoutes = ["/inbox", "/today"];

export default function PagesWithTasksLayout({ children }: { children: React.ReactNode }) {
  const { viewOptions, setViewOptions } = useStore();
  const pathname = usePathname();

  const currentView = viewOptions.find((option) => option.route === pathname)?.view || "list";

  return (
    <DropdownMenu modal={true}>
      <div className="relative flex h-screen w-full flex-col">
        <ViewOptionComponent />
        {children}
      </div>
      <ViewOptionDropDown
        viewOptions={viewOptions}
        currentView={currentView}
        setViewOptions={setViewOptions}
        pathname={pathname}
      />
    </DropdownMenu>
  );
}

function ViewOptionComponent() {
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
  currentView: "list" | "board";
  viewOptions: ViewOption[];
  setViewOptions: (viewOptions: ViewOption[]) => void;
  pathname: string;
}

function ViewOptionDropDown({ currentView, setViewOptions, pathname, viewOptions }: DropDownProps) {
  function changeView(view: "list" | "board") {
    const updatedViewOptions = viewOptions.map((option: ViewOption) => {
      if (option.route === pathname) {
        return { ...option, view };
      }
      return option;
    });

    setViewOptions(updatedViewOptions);
  }

  useEffect(() => {
    const viewOptions = localStorage.getItem("view_options");

    if (!viewOptions) {
      const initialView: ViewOption[] = taskedRoutes.map((route) => ({
        route,
        view: "list",
      }));
      setViewOptions(initialView);
      return;
    }

    try {
      const view_options: ViewOption[] = JSON.parse(viewOptions);
      const viewOption = view_options.find((option) => option.route === pathname);

      if (viewOption) {
        setViewOptions(view_options);
      } else {
        const updatedViewOptions: ViewOption[] = [...view_options, { route: pathname, view: "list" }];
        setViewOptions(updatedViewOptions);
      }
    } catch (error) {
      console.error("Failed to parse view options:", error);
    }
  }, [pathname, setViewOptions]);

  return (
    <DropdownMenuContent side="bottom" align="end">
      <DropdownMenuLabel>
        <span className="font-productSans text-base">View</span>
      </DropdownMenuLabel>
      <div className="flex w-full items-center gap-2">
        <DropdownMenuItem
          onClick={() => changeView("list")}
          className={`flex h-20 w-20 cursor-pointer flex-col items-center justify-center text-sm ${currentView === "list" ? "bg-accent font-bold text-primary" : ""}`}
        >
          <div className="flex flex-col items-center gap-0.5">
            <ViewTypeIcon className="h-5 w-5" active={currentView === "list"} />
            List
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => changeView("board")}
          className={`flex h-20 w-20 cursor-pointer items-center justify-center text-sm ${currentView === "board" ? "bg-accent font-bold text-primary" : ""}`}
        >
          <div className="flex flex-col items-center gap-0.5">
            <ViewTypeIcon className="h-5 w-5 rotate-90" active={currentView === "board"} />
            Board
          </div>
        </DropdownMenuItem>
      </div>
    </DropdownMenuContent>
  );
}
