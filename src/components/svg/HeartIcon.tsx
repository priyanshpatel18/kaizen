import React from "react";

interface HeartIconProps {
  color?: string;
  className?: string;
  onClick?: React.MouseEventHandler<SVGSVGElement>;
  cancel?: boolean;
}

export default function HeartIcon({ color = "#292D32", className = "", onClick, cancel = false }: HeartIconProps) {
  return cancel ? (
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
        d="M6.10999 17.4998C3.89999 15.4298 2 12.4798 2 8.67981C2 5.58981 4.49 3.08984 7.56 3.08984C9.38 3.08984 10.99 3.96983 12 5.32983C13.01 3.96983 14.63 3.08984 16.44 3.08984C17.59 3.08984 18.66 3.4398 19.55 4.0498"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M21.7395 7C21.9095 7.53 21.9995 8.1 21.9995 8.69C21.9995 15.69 15.5195 19.82 12.6195 20.82C12.2795 20.94 11.7195 20.94 11.3795 20.82C10.7295 20.6 9.90953 20.22 9.01953 19.69"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M22 2L2 22" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ) : (
    <svg
      width="22"
      height="20"
      viewBox="0 0 22 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      onClick={onClick}
    >
      <path
        d="M11.62 18.8101C11.28 18.9301 10.72 18.9301 10.38 18.8101C7.48 17.8201 1 13.6901 1 6.6901C1 3.6001 3.49 1.1001 6.56 1.1001C8.38 1.1001 9.99 1.9801 11 3.3401C12.01 1.9801 13.63 1.1001 15.44 1.1001C18.51 1.1001 21 3.6001 21 6.6901C21 13.6901 14.52 17.8201 11.62 18.8101Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
