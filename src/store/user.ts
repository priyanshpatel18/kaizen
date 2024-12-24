import { Workspace } from "@/store/workspace";
import { create } from "zustand";

export interface User {
  id: string;
  email: string;
  name: string;
  isVerified: boolean;
  profilePicture: string;
  workspaces: Workspace[];
}

interface UserState {
  user: User | null;
  setUser: (user: User) => void;
  fetchUserData: () => Promise<User | null>;
}

export const useUserStore = create<UserState>((set) => ({
  user: {
    id: "",
    email: "",
    name: "",
    isVerified: false,
    profilePicture: "",
    workspaces: [],
  },
  setUser: (user) => set({ user }),
  fetchUserData: async () => {
    return null;
  },
}));
