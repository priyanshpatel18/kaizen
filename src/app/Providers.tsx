"use client";

import AppSidebar from "@/components/sidebar/appSidebar";
import SidebarTriggerComponent from "@/components/sidebar/SidebarTrigger";
import {
  SidebarInset,
  SidebarProvider,
  useSidebar,
} from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SessionProvider } from "next-auth/react";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

const authRoutes = [
  "/onboarding",
  "/sign-in",
  "/sign-up",
  "/forgot-password",
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
                {sidebar.isMobile && (
                  <SidebarTriggerComponent
                    className="absolute top-2 left-2"
                    state={sidebar.state}
                  />
                )}
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
