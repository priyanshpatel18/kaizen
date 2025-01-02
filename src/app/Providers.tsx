"use client";

import AppSidebar from "@/components/sidebar/appSidebar";
import SidebarTriggerComponent from "@/components/sidebar/SidebarTrigger";
import { SidebarInset, useSidebar } from "@/components/ui/sidebar";
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
  const sidebar = useSidebar();

  return (
    <SessionProvider>
      <TooltipProvider>
        {!authRoutes.includes(pathname) ? (
          <>
            <AppSidebar />
            <SidebarInset>
              <main>
                {sidebar.isMobile && <SidebarTriggerComponent state={sidebar.state} />}
                {children}
              </main>
            </SidebarInset>
          </>
        ) : (
          <main className="relative w-full">{children}</main>
        )}
      </TooltipProvider>
    </SessionProvider>
  );
}
