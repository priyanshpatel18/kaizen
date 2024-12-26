import EditIcon from "@/components/svg/EditIcon";
import OptionIcon from "@/components/svg/OptionIcon";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Task as TaskType } from "@/store/task";
import CompleteTaskButton from "./CompleteTaskButton";
import { toast } from "sonner";

interface TaskProps {
  task: TaskType;
}

export default function Task({ task }: TaskProps) {
  async function completeTask() {
    try {
      const response = await fetch("/api/task/update", {
        method: "PUT",
        body: JSON.stringify({
          id: task.id,
          updateValue: {
            isCompleted: true,
          },
        }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.task) {
          toast("Task Completed🎉", {
            action: {
              label: "Undo",
              onClick: () => console.log(task.id),
            },
            duration: 3500,
          });
          return task;
        }
      } else {
        toast.error(data.message);
        return undefined;
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
      return undefined;
    }
  }

  return (
    <div className="group relative flex cursor-pointer select-none items-center justify-between">
      <div className="flex items-center gap-2">
        <CompleteTaskButton task={task} completeTask={completeTask} />
        <span>{task.title}</span>
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
