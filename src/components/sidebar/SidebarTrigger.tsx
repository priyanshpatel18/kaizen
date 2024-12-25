import { SidebarTrigger } from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface SidebarTriggerProps {
  state: "expanded" | "collapsed";
}

export default function SidebarTriggerComponent({ state }: SidebarTriggerProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <SidebarTrigger className="inline-flex items-center justify-center" />
      </TooltipTrigger>
      <TooltipContent>{state === "expanded" ? "Close sidebar" : "Open sidebar"}</TooltipContent>
    </Tooltip>
  );
}
