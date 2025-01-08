"use client";

import { Icons } from "@/components/others/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { toast } from "sonner";

export default function ForgotPassPage() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();
  const [email, setEmail] = useState<string>("");

  async function sendOTP(e: FormEvent<HTMLFormElement>) {
    if (e) e.preventDefault();
    setIsLoading(true);
    if (!email) {
      toast.error("Please enter your email");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(data.message);
        localStorage.setItem("email", email);
        await signOut({ redirect: false });
        router.push("/reset-password");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="relative mx-auto flex w-full max-w-md flex-col justify-center space-y-6 rounded-lg bg-white p-6 shadow-lg sm:p-8">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tighter text-gray-800">Forgot Password</h1>
        <p className="text-sm text-gray-600">Enter your email to verify your account</p>
      </div>
      <form onSubmit={sendOTP} className="space-y-4">
        <Input
          type="email"
          placeholder="Email"
          className="w-full"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Button className="w-full" type="submit" disabled={isLoading}>
          {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
          Send OTP
        </Button>
      </form>
    </div>
  );
}
