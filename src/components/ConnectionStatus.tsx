import { ConnectionType } from "@/hooks/useSocket";
import React from "react";

interface IProps {
  connectionType: ConnectionType | null;
}

export default function ConnectionStatus({ connectionType }: IProps) {
  function getConnectionStatusColor() {
    switch (connectionType) {
      case "2g":
        return "bg-red-500";
      case "3g":
        return "bg-yellow-500";
      case "4g":
        return "bg-green-500";
      case "offline":
      default:
        return "bg-gray-500";
    }
  }

  function getConnectionStatusText() {
    switch (connectionType) {
      case "2g":
        return "Weak Connection";
      case "3g":
        return "Good Connection";
      case "4g":
        return "Strong Connection";
      case "offline":
      default:
        return "Offline";
    }
  }

  return (
    <div className="absolute right-4 top-4 flex items-center gap-2 rounded-md bg-slate-900 p-2">
      <p className="text-sm text-white">{getConnectionStatusText()}</p>
      <div className={`h-3 w-3 rounded-full ${getConnectionStatusColor()}`}></div>
    </div>
  );
}
