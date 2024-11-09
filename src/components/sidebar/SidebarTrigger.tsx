import { SidebarTrigger } from "../ui/sidebar";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

interface SidebarTriggerProps {
  state: "expanded" | "collapsed";
  className?: string;
}

export default function SidebarTriggerComponent({
  state,
  className,
}: SidebarTriggerProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <SidebarTrigger className="inline-flex items-center justify-center" />
      </TooltipTrigger>
      <TooltipContent>
        {state === "expanded" ? "Close sidebar" : "Open sidebar"}
      </TooltipContent>
    </Tooltip>
  );
}
