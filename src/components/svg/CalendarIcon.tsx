import React from "react";

interface Props {
  color?: string;
  active?: boolean;
  className?: string;
}

export default function CalenderIcon({ color = "#000000", active = true, className = "" }: Props) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8 1.25C8.41421 1.25 8.75 1.58579 8.75 2V5C8.75 5.41421 8.41421 5.75 8 5.75C7.58579 5.75 7.25 5.41421 7.25 5V2C7.25 1.58579 7.58579 1.25 8 1.25Z"
        fill={color}
        stroke={color}
        strokeWidth="1.5"
        className={className}
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M16 1.25C16.4142 1.25 16.75 1.58579 16.75 2V5C16.75 5.41421 16.4142 5.75 16 5.75C15.5858 5.75 15.25 5.41421 15.25 5V2C15.25 1.58579 15.5858 1.25 16 1.25Z"
        fill={color}
        stroke={color}
        strokeWidth="1.5"
      />
      <text x="12" y="12.5" fontSize="10" fill={color} textAnchor="middle" fontWeight="bold" alignmentBaseline="middle">
        {new Date().getDate()}
      </text>
      <path
        d="M21.5 8.37V17.13C21.5 17.29 21.49 17.45 21.48 17.6H2.52C2.51 17.45 2.5 17.29 2.5 17.13V8.37C2.5 5.68 4.68 3.5 7.37 3.5H16.63C19.32 3.5 21.5 5.68 21.5 8.37Z"
        stroke={color}
        strokeWidth="1.5"
      />
      <path
        d="M21.4795 17.6001C21.2395 20.0701 19.1595 22.0001 16.6295 22.0001H7.36953C4.83953 22.0001 2.75953 20.0701 2.51953 17.6001H21.4795Z"
        fill={active ? color : "transparent"}
        stroke={color}
        strokeWidth="1.5"
      />
    </svg>
  );
}
