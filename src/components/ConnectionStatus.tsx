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
    <div className="absolute flex gap-2 items-center top-4 right-4 bg-slate-900 p-2 rounded-md">
      <p className="text-white text-sm">{getConnectionStatusText()}</p>
      <div
        className={`w-3 h-3 rounded-full ${getConnectionStatusColor()}`}
      ></div>
    </div>
  );
}
