import { useState } from "react";
import confetti from "canvas-confetti";
import TickIcon from "@/components/svg/TickIcon";

export default function CompleteTaskButton() {
  const [isExpanded, setIsExpanded] = useState(false);

  function handleTaskComplete() {
    setIsExpanded(true);
    const audio = new Audio("/assets/completion.mp3");
    audio.play();

    launchConfetti();

    setTimeout(() => {
      setIsExpanded(false);
    }, 200);
  }

  // Function to launch confetti
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
        className={`flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border-[1px] border-[#cdcdd5] transition-all duration-200 ease-in-out ${
          isExpanded ? "scale-[1.15]" : "scale-100"
        }`}
        onClick={handleTaskComplete}
      >
        <TickIcon
          className="h-full w-full p-[5px] opacity-0 transition-opacity duration-200 ease-in-out hover:opacity-100"
          color="#cdcdd5"
        />
      </div>
    </div>
  );
}
