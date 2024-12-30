"use client";

import TickIcon from "@/components/svg/TickIcon";
import UpdateStoreData from "@/lib/UpdateStoreData";
import { Task } from "@/store/task";
import confetti from "canvas-confetti";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Props {
  task: Task;
  completeTask: () => Promise<Task | undefined>;
}
const colors = ["#de0a26", "#ffae42", "#1035ac", "#292D32"];

export default function CompleteTaskButton({ task }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);
  // const { toasts } = useSonner();
  const [newTask, setNewTask] = useState<Task | undefined>();
  const [color, setColor] = useState<string>("");

  useEffect(() => {
    setColor(colors[task.priority - 1]);
  }, [task.priority]);

  async function handleTaskComplete() {
    setIsExpanded(true);
    setNewTask(undefined);

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
          setNewTask(data.task);
        }
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    }

    // Play Audio
    const audio = new Audio("/assets/completion.mp3");
    audio.play();

    // Launch Confetti
    launchConfetti();

    // Button animation
    setTimeout(() => {
      setIsExpanded(false);
    }, 200);
  }

  const launchConfetti = () => {
    confetti({
      particleCount: 120,
      angle: 90,
      spread: 100,
      origin: { x: 0.5, y: 1 },
      colors: ["#FF5733", "#33B5FF", "#00FF00", "#FFFF00", "#FF00FF", "#FFA500"],
      gravity: 0.5,
      scalar: 1,
    });
  };

  return (
    <div>
      <div
        style={{ borderColor: color, backgroundColor: `${color}25` }}
        className={`flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border-[1px] bg-opacity-50 transition-all duration-200 ease-in-out ${
          isExpanded ? "scale-[1.15]" : "scale-100"
        }`}
        onClick={handleTaskComplete}
      >
        <TickIcon
          className="h-full w-full p-[5px] opacity-0 transition-opacity duration-200 ease-in-out hover:opacity-100"
          color={color}
        />
      </div>

      <UpdateStoreData data={newTask} action="update" type="task" />
    </div>
  );
}
