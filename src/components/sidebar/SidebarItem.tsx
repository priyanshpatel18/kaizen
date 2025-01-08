import { ReactNode } from "react";

interface SidebarItemProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export default function SidebarItem({ children, className, onClick }: SidebarItemProps) {
  return (
    <div
      className={`${className} 300ms flex cursor-pointer items-center gap-2 rounded p-1 transition-all hover:bg-accent`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
