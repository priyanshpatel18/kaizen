"use client";

import { Icons } from "@/components/others/icons";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { toast } from "sonner";

export function VerifyOtpPage() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [otp, setOtp] = useState<string>("");
  const router = useRouter();

  async function handleVerifyOTP(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);

    if (!otp) {
      return toast.error("Please Enter 6 digit OTP");
    }

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ otp, signUpFlag: true }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(data.message);
        router.push("/sign-in");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleResendOTP() {
    toast.info("Functionality not implemented yet.");
  }

  return (
    <main className="flex h-screen w-full items-center justify-center bg-gray-100 p-4 sm:p-0">
      <div className="relative mx-auto flex w-full max-w-md flex-col justify-center space-y-6 rounded-lg bg-white p-6 shadow-lg sm:p-8">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tighter text-gray-800">Verify Email</h1>
          <p className="text-sm text-gray-600">Enter your otp sent to your email</p>
        </div>
        <form onSubmit={handleVerifyOTP} className="flex flex-col items-center space-y-4">
          <InputOTP maxLength={6} value={otp} onChange={(value) => setOtp(value)}>
            <InputOTPGroup>
              <InputOTPSlot index={0} autoFocus />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>

          <p onClick={handleResendOTP} className="cursor-pointer self-end text-sm text-gray-600 hover:underline">
            Resend OTP
          </p>

          <Button className="w-full" type="submit" disabled={isLoading}>
            {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
            Verify Email
          </Button>
        </form>
      </div>
    </main>
  );
}
