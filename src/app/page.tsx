"use client";

import { Button } from "@/components/ui/button";

async function sendMail() {
  const result = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/sendOtp`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "test.kaizen@gmail.com",
      }),
    }
  );

  const data = await result.json();
  console.log(data);
}

export default function Home() {
  return (
    <div>
      <Button
        className="md:right-8 md:top-8 w-full"
        type="submit"
        onClick={sendMail}
      >
        Send Mail
      </Button>
    </div>
  );
}
