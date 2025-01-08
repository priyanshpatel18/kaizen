import React, { useState, useEffect } from "react";
import { useTheme } from "next-themes";

interface HashIconProps {
  className?: string;
  onClick?: React.MouseEventHandler<SVGSVGElement>;
}

export default function HashIcon({ className = "", onClick }: HashIconProps) {
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
      className={className}
      onClick={onClick}
    >
      <path d="M10 3L8 21" stroke={themeColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 3L14 21" stroke={themeColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3.5 9H21.5" stroke={themeColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2.5 15H20.5" stroke={themeColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
