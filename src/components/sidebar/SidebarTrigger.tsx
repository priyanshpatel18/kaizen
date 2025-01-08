import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { PanelLeftIcon } from "lucide-react";

interface SidebarTriggerProps {
  state: "expanded" | "collapsed";
  changeSidebarState: () => void;
}

export default function SidebarTrigger({ state, changeSidebarState }: SidebarTriggerProps) {
  return (
    <Tooltip>
      <div
        className="300ms absolute left-2 top-2 z-10 cursor-pointer rounded p-1 hover:bg-accent"
        onClick={changeSidebarState}
      >
        <TooltipTrigger asChild>
          <PanelLeftIcon />
        </TooltipTrigger>
        <TooltipContent>{state === "expanded" ? "Close sidebar" : "Open sidebar"}</TooltipContent>
      </div>
    </Tooltip>
  );
}
