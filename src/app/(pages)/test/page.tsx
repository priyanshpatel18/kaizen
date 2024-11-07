"use client";

import { checkForPermissionAndTrigger } from "@/lib/Push";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

interface SessionUser {
  id: string;
  name: string;
  email: string;
  image: string;
}

export default function TestPage() {
  const session = useSession();
  const user = session.data?.user as SessionUser;

  useEffect(() => {
    if (user) {
      console.log(user.id);
      checkForPermissionAndTrigger();
    }
  }, [user]);

  return <div>TestPage</div>;
}
