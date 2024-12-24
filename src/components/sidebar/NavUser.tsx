"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";
import { BadgeCheck, Bell, ChevronsUpDown, CreditCard, LogOut, Sparkles } from "lucide-react";
import { signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { SessionUser } from "./appSidebar";
import { useRouter } from "next/navigation";

interface User {
  user: SessionUser | undefined;
}

export default function NavUser({ user }: { user: User["user"] }) {
  const { isMobile } = useSidebar();
  const [profilePicture, setProfilePicture] = useState<string | undefined>(undefined);
  const [name, setName] = useState<string | undefined>(undefined);

  const router = useRouter();

  useEffect(() => {
    const profilePicture = localStorage.getItem("profilePicture")?.replace(/"/g, "");
    const name = localStorage.getItem("name")?.replace(/"/g, "");

    if (!name) {
      router.push("/onboard/profile");
    }
    setProfilePicture(profilePicture || undefined);
    setName(name || undefined);
  }, []);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild className="border-0">
            <SidebarMenuButton size="lg" className="focus-visible:ring-0">
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={profilePicture || undefined} alt={name || "profile"} />
                <AvatarFallback className="rounded-lg">{name?.charAt(0) || "U"}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{name}</span>
                <span className="truncate text-xs">{user?.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={profilePicture || undefined} alt={name || "profile"} />
                  <AvatarFallback className="rounded-lg">{name?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{name}</span>
                  <span className="truncate text-xs">{user?.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <Sparkles />
                Upgrade to Pro
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <BadgeCheck />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CreditCard />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bell />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={async () => {
                await signOut({ redirect: true, callbackUrl: "/sign-in" });
              }}
            >
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
