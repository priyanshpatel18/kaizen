"use client";

import { User } from "@prisma/client";
import { useEffect, useState } from "react";

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  async function getUser() {
    try {
      const res = await fetch("/api/user/get-user", {
        method: "GET",
      });

      const data = await res.json();
      setUser(data.user);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getUser();
  }, []);

  return { user, loading };
}
