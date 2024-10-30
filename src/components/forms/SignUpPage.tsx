"use client";
import { Dispatch, FormEvent, SetStateAction, useState } from "react";

import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { signUpSchema, verifySchema } from "@/zod/user";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

export default function SignUpPage() {
  const router = useRouter();

  const [otp, setOtp] = useState<string>("");
  const [showOTPPage, setShowOTPPage] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [userData, setUserData] = useState<{
    email: string;
    password: string;
  } | null>(null);

  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function sendOTP(values: z.infer<typeof signUpSchema>) {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: values.email,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(data.message);
        setUserData({ email: values.email, password: values.password });
        setShowOTPPage(true);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleVerifyOTP(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);

    if (!userData) {
      return toast.error("Please fill in all fields.");
    }

    const { email, password } = await verifySchema.parseAsync({
      email: userData.email,
      password: userData.password,
      otp,
    });
    if (!otp) {
      return toast.error("Please Enter 6 digit OTP");
    }

    const body = {
      email,
      password,
      otp,
    };

    if (!email || !password) {
      return toast.error("Account details are not saved.");
    }

    try {
      const res = await fetch("/api/auth/sign-up", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(data.message);
        setShowOTPPage(false);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="flex h-screen w-full items-center justify-center bg-gray-100 p-4 sm:p-0">
      {showOTPPage ? (
        <OTPForm
          otp={otp}
          setOtp={setOtp}
          handleVerifyOTP={handleVerifyOTP}
          isLoading={isLoading}
        />
      ) : (
        <SignUpForm form={form} isLoading={isLoading} sendOTP={sendOTP} />
      )}
    </main>
  );
}

interface FormProps {
  form: UseFormReturn<
    {
      email: string;
      password: string;
    },
    any,
    undefined
  >;
  isLoading: boolean;
  sendOTP: (values: z.infer<typeof signUpSchema>) => void;
}

function SignUpForm({ form, isLoading, sendOTP }: FormProps) {
  return (
    <div className="relative mx-auto flex w-full max-w-md flex-col justify-center space-y-6 rounded-lg bg-white p-6 sm:p-8 shadow-lg">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-bold text-gray-800">
          Create an Account
        </h1>
        <p className="text-sm text-gray-600">
          Enter your details to create a new account
        </p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(sendOTP)} className="space-y-4">
          <div className="flex flex-col gap-4 py-2">
            <FormField
              control={form.control}
              name="email"
              disabled={isLoading}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Email"
                      className="w-full"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              disabled={isLoading}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input type="password" placeholder="Password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button className="w-full" type="submit" disabled={isLoading}>
            {isLoading && (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            )}
            Sign Up
          </Button>
        </form>
      </Form>

      <Button
        className="w-full"
        disabled={isLoading}
        onClick={async () => {
          const res = await signIn("google", { redirect: false });

          if (!res?.error) {
            toast.success("Signed In");
          } else {
            toast.error("oops something went wrong..!");
          }
        }}
      >
        {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
        Sign up with Google
      </Button>

      <div className="text-center text-sm text-gray-500">
        By signing up, you agree to our{" "}
        <Link href="/terms-of-service" className="underline">
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link href="/privacy-policy" className="underline">
          Privacy Policy
        </Link>
      </div>

      <p className="text-center text-sm text-gray-500">
        Already have an account?{" "}
        <Link href="/sign-in" className="hover:underline text-blue-500">
          Sign In
        </Link>
      </p>
    </div>
  );
}

interface OTPFormProps {
  isLoading: boolean;
  handleVerifyOTP: (e: FormEvent<HTMLFormElement>) => void;
  otp: string;
  setOtp: Dispatch<SetStateAction<string>>;
}

function OTPForm({ isLoading, otp, setOtp, handleVerifyOTP }: OTPFormProps) {
  return (
    <form onSubmit={handleVerifyOTP} className="space-y-4">
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

      <Button className="w-full" type="submit" disabled={isLoading}>
        {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
        Verify Email
      </Button>
    </form>
  );
}
