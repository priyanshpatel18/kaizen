import EditIcon from "@/components/svg/EditIcon";
import OptionIcon from "@/components/svg/OptionIcon";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import CompleteTaskButton from "./CompleteTaskButton";

interface TaskProps {
  title: string;
}

export default function Task({ title }: TaskProps) {
  return (
    <div className="group relative flex cursor-pointer select-none items-center justify-between">
      <div className="flex items-center gap-2">
        <CompleteTaskButton />
        <span>{title}</span>
      </div>
      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger>
            <EditIcon className="h-6 rounded-sm p-0.5 opacity-0 hover:bg-accent group-hover:opacity-100" />
          </TooltipTrigger>
          <TooltipContent>Edit task</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger>
            <OptionIcon className="h-6 rounded-sm p-0.5 opacity-0 hover:bg-accent group-hover:opacity-100" />
          </TooltipTrigger>
          <TooltipContent>More actions</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
