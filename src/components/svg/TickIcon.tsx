import React, { useState, useEffect } from "react";
import { useTheme } from "next-themes";

interface TickIconProps {
  color?: string;
  className?: string;
  onClick?: () => void;
  isExpanded?: boolean;
}

export default function TickIcon({ color = "#292D32", className = "", onClick, isExpanded = false }: TickIconProps) {
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
    <div
      style={{
        borderColor: finalColor,
        backgroundColor: `${finalColor}25`,
      }}
      className={`flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border-[1px] bg-opacity-50 transition-all duration-200 ease-in-out ${
        isExpanded ? "scale-[1.15]" : "scale-100"
      }`}
      onClick={onClick}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="10"
        height="8"
        viewBox="0 0 10 8"
        fill="none"
        className={`${className} h-full w-full p-[5px] opacity-0 transition-opacity duration-200 ease-in-out hover:opacity-100`}
      >
        <path
          d="M3.57994 7.58001C3.37994 7.58001 3.18994 7.50001 3.04994 7.36001L0.219941 4.53001C-0.0700586 4.24001 -0.0700586 3.76001 0.219941 3.47001C0.509941 3.18001 0.989941 3.18001 1.27994 3.47001L3.57994 5.77001L8.71994 0.630006C9.00994 0.340006 9.48994 0.340006 9.77994 0.630006C10.0699 0.920006 10.0699 1.40001 9.77994 1.69001L4.10994 7.36001C3.96994 7.50001 3.77994 7.58001 3.57994 7.58001Z"
          fill={finalColor}
        />
      </svg>
    </div>
  );
}
