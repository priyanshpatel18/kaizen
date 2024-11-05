"use client";

import { useEffect, useState } from "react";
import { useSocket } from "./useSocket";
import { useUser } from "./useUser";

export function useUserSocket() {
  const { user, loading } = useUser();
  const [token, setToken] = useState<string | null>(null);
  const { socket, connectionType } = useSocket({ token });

  useEffect(() => {
    if (user && !loading) {
      setToken(user.token);
    } else {
      setToken(null);
    }
  }, [loading, user]);

  return { socket, connectionType };
}
