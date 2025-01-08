"use client";

import { FormEvent, useEffect, useState } from "react";
import { Icons } from "@/components/others/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

export default function ResetPasswordPage() {
  const [otp, setOtp] = useState<string>("");
  const [timer, setTimer] = useState(60);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [password, setPassword] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    if (timer > 0) {
      const countdown = setTimeout(() => setTimer(timer - 1), 1000);
      return () => clearTimeout(countdown);
    }
  }, [timer]);

  async function handleResendOtp() {
    const email = localStorage.getItem("email");
    if (!email) {
      return toast.error("Something went wrong, Go back and try again");
    }
    setTimer(60);

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, forgotFlag: true }),
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

  async function resetPassword(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);

    if (!otp || !password) {
      setIsLoading(false);
      return toast.error("Please enter OTP and new password");
    }

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ otp, password }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(data.message);
        router.push("/sign-in");
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
        <h1 className="text-3xl font-bold tracking-tighter text-gray-800">Verify and Reset Password</h1>
        <p className="text-sm text-gray-600">Enter the OTP sent to your email and new password</p>
      </div>
      <form onSubmit={resetPassword} className="flex flex-col items-center space-y-4">
        <InputOTP maxLength={6} value={otp} onChange={(value) => setOtp(value)}>
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>

        <div>
          <button
            type="button"
            disabled={timer > 0}
            onClick={handleResendOtp}
            className={`text-blue-500 ${timer > 0 ? "cursor-not-allowed" : ""}`}
          >
            Resend OTP {timer > 0 ? `in ${timer}s` : ""}
          </button>
        </div>

        <Input
          type="password"
          placeholder="New Password"
          className="w-full"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <Button className="w-full" type="submit" disabled={isLoading}>
          {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
          Verify and Reset
        </Button>
      </form>
    </div>
  );
}
