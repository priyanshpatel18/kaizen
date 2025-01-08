import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";

interface IconProps {
  onClick?: () => void;
  className?: string;
  active?: boolean;
}

export default function ViewTypeIcon({ onClick, className, active = false }: IconProps) {
  const { theme } = useTheme();
  const [themeColor, setThemeColor] = useState("#09090B");

  useEffect(() => {
    if (theme === "dark") {
      setThemeColor("#FAFAFA");
    } else {
      setThemeColor("#09090B");
    }
  }, [theme]);

  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      onClick={onClick}
      className={className}
      style={{ cursor: onClick ? "pointer" : "default" }}
    >
      <path
        d="M19.9 13.5H4.1C2.6 13.5 2 14.14 2 15.73V19.77C2 21.36 2.6 22 4.1 22H19.9C21.4 22 22 21.36 22 19.77V15.73C22 14.14 21.4 13.5 19.9 13.5Z"
        stroke={themeColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={active ? themeColor : "none"}
      />
      <path
        d="M19.9 2H4.1C2.6 2 2 2.64 2 4.23V8.27C2 9.86 2.6 10.5 4.1 10.5H19.9C21.4 10.5 22 9.86 22 8.27V4.23C22 2.64 21.4 2 19.9 2Z"
        stroke={themeColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={active ? themeColor : "none"}
      />
    </svg>
  );
}
