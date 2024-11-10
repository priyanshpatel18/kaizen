"use client";

import SignInPage from "@/components/forms/SignInPage";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

export default function SignIn() {
  const session = useSession();

  useEffect(() => {
    if (session.status === "authenticated") {
      window.location.href = "/";
    }
  }, [session]);

  return <SignInPage />;
}
