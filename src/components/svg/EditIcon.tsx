import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";

interface EditIconProps {
  className?: string;
  onClick?: React.MouseEventHandler<SVGSVGElement>;
}

export default function EditIcon({ className = "", onClick }: EditIconProps) {
  const { theme } = useTheme();
  const [themeColor, setThemeColor] = useState("#FAFAFA");

  useEffect(() => {
    if (theme === "dark") {
      setThemeColor("#FAFAFA");
    } else {
      setThemeColor("#09090B");
    }
  }, [theme]);

  const iconColor = themeColor;

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
        d="M13.2594 3.59997L5.04936 12.29C4.73936 12.62 4.43936 13.27 4.37936 13.72L4.00936 16.96C3.87936 18.13 4.71936 18.93 5.87936 18.73L9.09936 18.18C9.54936 18.1 10.1794 17.77 10.4894 17.43L18.6994 8.73997C20.1194 7.23997 20.7594 5.52997 18.5494 3.43997C16.3494 1.36997 14.6794 2.09997 13.2594 3.59997Z"
        stroke={iconColor}
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11.8906 5.05005C12.3206 7.81005 14.5606 9.92005 17.3406 10.2"
        stroke={iconColor}
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3 22H21"
        stroke={iconColor}
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
