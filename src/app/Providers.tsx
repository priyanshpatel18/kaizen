"use client";

import AppSidebar from "@/components/sidebar/appSidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { SessionProvider } from "next-auth/react";
import { usePathname } from "next/navigation";
import { ReactNode, useState } from "react";

const authRoutes = ["/onboarding", "/sign-in", "/sign-up", "/forgot-password"];

export default function Providers({
  children,
  defaultOpen,
}: {
  children: ReactNode;
  defaultOpen: boolean;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(defaultOpen);
  const pathname = usePathname();

  return (
    <SessionProvider>
      <TooltipProvider>
        {!authRoutes.includes(pathname) && (
          <SidebarProvider
            defaultOpen={defaultOpen}
            open={isSidebarOpen}
            onOpenChange={() => {
              setIsSidebarOpen(!isSidebarOpen);
            }}
          >
            <AppSidebar />
            <SidebarInset>
              <main className="relative">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <SidebarTrigger />
                  </TooltipTrigger>
                  <TooltipContent>
                    {isSidebarOpen ? "Close sidebar" : "Open sidebar"}
                  </TooltipContent>
                </Tooltip>
                {/* Main content */}
                {children}
              </main>
            </SidebarInset>
          </SidebarProvider>
        )}

        <main className="relative">{children}</main>
      </TooltipProvider>
    </SessionProvider>
  );
}
