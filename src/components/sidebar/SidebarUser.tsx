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
import { BadgeCheck, ChevronsUpDown, LogOut, Sparkles } from "lucide-react";
import { Session } from "next-auth";
import { signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import { Dispatch, SetStateAction } from "react";
import { Icons } from "../others/icons";
import SidebarItem from "./SidebarItem";

interface IProps {
  name: string | undefined;
  profilePicture: string | undefined;
  session: Session | null | undefined;
  setActiveDialog: Dispatch<SetStateAction<"project" | "workspace" | null>>;
}

export default function SidebarUser({ name, profilePicture, session, setActiveDialog }: IProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="outline-none">
        <SidebarItem className="p-1">
          <Avatar className="relative flex h-9 w-9 items-center justify-center rounded-full border-2 border-primary p-[0.5px]">
            <div className="h-7 w-7 overflow-hidden rounded-full">
              <AvatarImage
                src={profilePicture || undefined}
                alt={name || "profile"}
                className="h-full w-full object-cover"
              />
            </div>
            <AvatarFallback className="absolute inset-0 flex items-center justify-center rounded-full bg-gray-200 text-lg font-bold text-black">
              {name?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>

          <div className="grid flex-1 text-left">
            <span className="font-arial select-none truncate font-semibold">{name}</span>
          </div>

          <ChevronsUpDown className="ml-auto size-4" />
        </SidebarItem>
      </DropdownMenuTrigger>

      <AccountsDropDown
        name={name}
        profilePicture={profilePicture}
        session={session}
        setActiveDialog={setActiveDialog}
      />
    </DropdownMenu>
  );
}

interface AccountsDropDownProps {
  name: string | undefined;
  profilePicture: string | undefined;
  session: Session | null | undefined;
  setActiveDialog: Dispatch<SetStateAction<"project" | "workspace" | null>>;
}

function AccountsDropDown({ name, profilePicture, session, setActiveDialog }: AccountsDropDownProps) {
  const { setTheme, theme } = useTheme();

  return (
    <DropdownMenuContent side="right">
      <DropdownMenuLabel>
        <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
          <Avatar className="h-8 w-8 rounded-lg">
            <AvatarImage src={profilePicture} alt={name} />
            <AvatarFallback className="rounded-lg">{name?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">{name}</span>
            <span className="truncate text-xs">{session?.user.email}</span>
          </div>
        </div>
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuGroup>
        <DropdownMenuItem disabled={true}>
          <Sparkles />
          Upgrade to Pro
        </DropdownMenuItem>
      </DropdownMenuGroup>
      <DropdownMenuSeparator />
      <DropdownMenuGroup>
        <DropdownMenuItem
          onClick={() => {
            setActiveDialog("workspace");
          }}
        >
          <Icons.add className="h-6 w-6" />
          Add workspace
        </DropdownMenuItem>
        <DropdownMenuItem>
          <BadgeCheck />
          Account
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Icons.settings className="h-4 w-4" />
          Settings
        </DropdownMenuItem>
      </DropdownMenuGroup>
      <DropdownMenuSeparator />
      <DropdownMenuGroup>
        {theme === "dark" ? (
          <DropdownMenuItem onClick={() => setTheme("light")}>
            <Icons.sun className="h-4 w-4" />
            <span>Light Mode</span>
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem onClick={() => setTheme("dark")}>
            <Icons.moon className="h-4 w-4" />
            <span>Dark Mode</span>
          </DropdownMenuItem>
        )}
      </DropdownMenuGroup>
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={() => signOut()}>
        <LogOut className="text-[#de0a26]" />
        <span className="text-sm text-[#de0a26]">Logout</span>
      </DropdownMenuItem>
    </DropdownMenuContent>
  );
}
