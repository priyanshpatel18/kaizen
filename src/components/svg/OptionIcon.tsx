import React, { useState, useEffect } from "react";
import { useTheme } from "next-themes";

interface IconProps {
  className?: string;
  onClick?: React.MouseEventHandler<SVGSVGElement>;
}

export default function OptionIcon({ className, onClick }: IconProps) {
  const { theme } = useTheme();
  const [themeColor, setThemeColor] = useState("#09090B");

  useEffect(() => {
    if (theme === "dark") {
      setThemeColor("#FAFAFA"); // Light color for dark mode
    } else {
      setThemeColor("#09090B"); // Dark color for light mode
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
      <path
        d="M9 22H15C20 22 22 20 22 15V9C22 4 20 2 15 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22Z"
        stroke={themeColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M15.9965 12H16.0054" stroke={themeColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M11.9955 12H12.0045" stroke={themeColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.99451 12H8.00349" stroke={themeColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
