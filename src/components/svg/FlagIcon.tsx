import React, { useState, useEffect } from "react";
import { useTheme } from "next-themes";

interface FlagIconProps {
  className?: string;
  color?: string;
  onClick?: () => void;
  fill?: boolean;
}

export default function FlagIcon({ className = "", color = "#292D32", onClick, fill = true }: FlagIconProps) {
  const { theme } = useTheme();
  const [themeColor, setThemeColor] = useState("#09090B");

  useEffect(() => {
    if (theme === "dark") {
      setThemeColor("#FAFAFA");
    } else {
      setThemeColor("#09090B");
    }
  }, [theme]);

  const finalColor = color === "#292D32" ? themeColor : color;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      onClick={onClick}
      style={{ cursor: onClick ? "pointer" : "default" }}
    >
      <path
        d="M5.15039 2V22"
        stroke={finalColor}
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.15039 4H16.3504C19.0504 4 19.6504 5.5 17.7504 7.4L16.5504 8.6C15.7504 9.4 15.7504 10.7 16.5504 11.4L17.7504 12.6C19.6504 14.5 18.9504 16 16.3504 16H5.15039"
        stroke={finalColor}
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.15039 4H16.3504C19.0504 4 19.6504 5.5 17.7504 7.4L16.5504 8.6C15.7504 9.4 15.7504 10.7 16.5504 11.4L17.7504 12.6C19.6504 14.5 18.9504 16 16.3504 16H5.15039"
        fill={fill ? finalColor : "transparent"}
      />
    </svg>
  );
}
