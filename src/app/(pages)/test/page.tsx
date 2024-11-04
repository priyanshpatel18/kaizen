"use client";

import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";

export default function TestPage() {
  const { data } = useSession();

  async function handleClick() {
    const res = await fetch("/api/user/get-user", {
      method: "Get",
    });

    const data = await res.json();
    console.log(data.user);
  }

  return (
    <div>
      <p>{data?.user?.email}</p>
      <Button onClick={handleClick}>Button</Button>
    </div>
  );
}
