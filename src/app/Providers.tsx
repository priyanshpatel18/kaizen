"use client";

import AppSidebar from "@/components/sidebar/appSidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SessionProvider } from "next-auth/react";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

const authRoutes = [
  "/app/onboard/profile",
  "/app/onboard/use-case",
  "/sign-in",
  "/sign-up",
  "/forgot-password",
  "/reset-password",
  "/verify-otp",
  "/test",
];

export default function Providers({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <SessionProvider>
      <TooltipProvider>
        {!authRoutes.includes(pathname) ? (
          <div className="flex h-screen">
            <AppSidebar />

            <main className="fixed ml-[15%] h-full w-[85%]">{children}</main>
          </div>
        ) : (
          <main className="relative w-full">{children}</main>
        )}
      </TooltipProvider>
    </SessionProvider>
  );
}
