"use client";

import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useRouter } from "next/navigation";
import {
  Dispatch,
  FormEvent,
  SetStateAction,
  useEffect,
  useState,
} from "react";
import { toast } from "sonner";

export default function ForgotPassPage() {
  const [showResetPage, setShowResetPage] = useState<boolean>(false);
  const [otp, setOtp] = useState<string>("");
  const [userData, setUserData] = useState<{ email: string; password: string }>(
    { email: "", password: "" }
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();

  async function sendOTP(e?: FormEvent<HTMLFormElement>, email?: string) {
    if (e) e.preventDefault();
    setIsLoading(true);

    const targetEmail = email || userData.email;

    if (!targetEmail) {
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
        body: JSON.stringify({ email: targetEmail }),
      });

      const data = await res.json();
      
      if (res.ok) {
        setShowResetPage(true);
        toast.success(data.message);
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

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: userData.email,
          password: userData.password,
          otp,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setShowResetPage(false);
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
    <main className="flex h-screen w-full items-center justify-center bg-gray-100 p-4 sm:p-0">
      {!showResetPage ? (
        <ForgotPassForm
          setUserData={setUserData}
          userData={userData}
          isLoading={isLoading}
          sendOTP={sendOTP}
        />
      ) : (
        <ResetPasswordForm
          otp={otp}
          setOtp={setOtp}
          isLoading={isLoading}
          userData={userData}
          setUserData={setUserData}
          resetPassword={resetPassword}
          sendOTP={sendOTP}
        />
      )}
    </main>
  );
}

interface ForgotPassFormProps {
  setUserData: Dispatch<SetStateAction<{ email: string; password: string }>>;
  userData: { email: string; password: string };
  isLoading: boolean;
  sendOTP: (e?: FormEvent<HTMLFormElement>, email?: string) => void;
}

function ForgotPassForm({
  userData,
  setUserData,
  isLoading,
  sendOTP,
}: ForgotPassFormProps) {
  return (
    <div className="relative mx-auto flex w-full max-w-md flex-col justify-center space-y-6 rounded-lg bg-white p-6 sm:p-8 shadow-lg">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-3xl tracking-tighter font-bold text-gray-800">Forgot Password</h1>
        <p className="text-sm text-gray-600">
          Enter your email to verify your account
        </p>
      </div>
      <form onSubmit={sendOTP} className="space-y-4">
        <Input
          type="email"
          placeholder="Email"
          className="w-full"
          value={userData.email}
          onChange={(e) => setUserData({ ...userData, email: e.target.value })}
        />
        <Button className="w-full" type="submit" disabled={isLoading}>
          {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
          Send OTP
        </Button>
      </form>
    </div>
  );
}

interface ResetPasswordFormProps {
  isLoading: boolean;
  otp: string;
  setOtp: Dispatch<SetStateAction<string>>;
  userData: { email: string; password: string };
  setUserData: Dispatch<SetStateAction<{ email: string; password: string }>>;
  resetPassword: (e: FormEvent<HTMLFormElement>) => void;
  sendOTP: (e?: FormEvent<HTMLFormElement>, email?: string) => void;
}

function ResetPasswordForm({
  otp,
  setOtp,
  isLoading,
  userData,
  setUserData,
  resetPassword,
  sendOTP,
}: ResetPasswordFormProps) {
  const [timer, setTimer] = useState(5);

  useEffect(() => {
    if (timer > 0) {
      const countdown = setTimeout(() => setTimer(timer - 1), 1000);
      return () => clearTimeout(countdown);
    }
  }, [timer]);

  function handleResendOtp() {
    sendOTP(undefined, userData.email);
    setTimer(60);
  }

  return (
    <div className="relative mx-auto flex w-full max-w-md flex-col justify-center space-y-6 rounded-lg bg-white p-6 sm:p-8 shadow-lg">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-3xl tracking-tighter font-bold text-gray-800">
          Verify and Reset Password
        </h1>
        <p className="text-sm text-gray-600">
          Enter the OTP sent to your email and new password
        </p>
      </div>
      <form
        onSubmit={resetPassword}
        className="flex flex-col space-y-4 items-center"
      >
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
          value={userData.password}
          onChange={(e) =>
            setUserData({ ...userData, password: e.target.value })
          }
        />

        <Button className="w-full" type="submit" disabled={isLoading}>
          {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
          Verify and Reset
        </Button>
      </form>
    </div>
  );
}
