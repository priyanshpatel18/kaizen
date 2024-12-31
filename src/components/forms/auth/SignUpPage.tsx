"use client";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { encryptData } from "@/lib/encrypt";
import { signUpSchema } from "@/zod/user";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

export default function SignUpPage() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState<boolean>(false);

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
      const publicKey = process.env.NEXT_PUBLIC_PUBLIC_KEY;
      if (!publicKey || typeof publicKey !== "string") {
        console.error("Missing or invalid public key");
        return toast.error("Something went wrong");
      }
      const encryptedData = await encryptData(
        {
          email: values.email,
          password: values.password,
        },
        publicKey
      );

      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ encryptedData, signUpFlag: true }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(data.message);
        router.push("/verify-otp");
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
    <div className="relative mx-auto flex w-full max-w-md flex-col justify-center space-y-6 rounded-lg bg-white p-6 shadow-lg sm:p-8">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="tracking text-3xl font-bold text-gray-800">Create an Account</h1>
        <p className="text-sm text-gray-600">Enter your details to create a new account</p>
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
                    <Input type="email" placeholder="Email" className="w-full" {...field} />
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
          <Button className="w-full font-semibold" type="submit" disabled={isLoading}>
            Sign Up
          </Button>
        </form>
      </Form>

      <Button
        className="w-full font-semibold"
        disabled={isLoading}
        onClick={async () => {
          const res = await signIn("google", {
            callbackUrl: "/onboard/profile",
          });

          if (!res?.error) {
            toast.success("Signed In");
          } else {
            toast.error("oops something went wrong..!");
          }
        }}
      >
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
        <Link href="/sign-in" className="text-blue-500 hover:underline">
          Sign In
        </Link>
      </p>
    </div>
  );
}
