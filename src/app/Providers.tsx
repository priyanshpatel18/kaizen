"use client";

import ThemeProvider from "@/components/others/ThemeProvider";
import AppSidebar from "@/components/sidebar/appSidebar";
import SidebarTriggerComponent from "@/components/sidebar/SidebarTrigger";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SessionProvider } from "next-auth/react";
import { usePathname } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";

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

type SideBarState = "expanded" | "collapsed";

export default function Providers({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [sidebarState, setSidebarState] = useState<SideBarState>("expanded");

  function changeSidebarState() {
    const newSidebarState = sidebarState === "expanded" ? "collapsed" : "expanded";
    localStorage.setItem("sidebar:state", newSidebarState);
    setSidebarState(newSidebarState);
  }

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedSidebarState = localStorage.getItem("sidebar:state") as SideBarState | null;

      if (!storedSidebarState) {
        localStorage.setItem("sidebar:state", "expanded");
        setSidebarState("expanded");
      } else {
        setSidebarState(storedSidebarState);
      }
    }
  }, [pathname]);

  return (
    <SessionProvider>
      <TooltipProvider>
        {authRoutes.includes(pathname) ? (
          <main className="relative w-full">{children}</main>
        ) : (
          <ThemeProvider attribute="class" defaultTheme="light" disableTransitionOnChange>
            <div className="flex h-screen">
              <AppSidebar
                className={`transform transition-all duration-300 ease-in-out ${
                  sidebarState === "expanded" ? "w-[15%] translate-x-0 opacity-100" : "w-0 -translate-x-full opacity-0"
                } fixed z-10 h-full`}
              />

              <main
                className={`fixed transition-all duration-300 ease-in-out ${
                  sidebarState === "expanded" ? "ml-[15%] w-[85%]" : "ml-0 w-full"
                } h-full`}
              >
                <SidebarTriggerComponent state={sidebarState} changeSidebarState={changeSidebarState} />
                {children}
              </main>
            </div>
          </ThemeProvider>
        )}
      </TooltipProvider>
    </SessionProvider>
  );
}
