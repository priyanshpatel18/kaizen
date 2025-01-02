"use client";

import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { signUpSchema } from "@/zod/user";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

export default function SignInPage() {
  const router = useRouter();
  const [isEmailLoading, setIsEmailLoading] = useState<boolean>(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => form.reset(), []);

  async function handleSignIn(values: z.infer<typeof signUpSchema>) {
    setIsLoading(true);
    setIsEmailLoading(true);

    const res = await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false,
    });

    if (!res?.error) {
      toast.success("Signed In");
      router.push("/app/today");
    } else {
      if (res.status === 401) {
        toast.error("Invalid Credentials, try again!");
      } else if (res.status === 400) {
        toast.error("Missing Credentials!");
      } else if (res.status === 404) {
        toast.error("Account not found!");
      } else if (res.status === 403) {
        toast.error("Forbidden!");
      } else {
        toast.error("oops something went wrong..!");
      }
    }

    setIsLoading(false);
    setIsEmailLoading(false);
  }

  return (
    <main className="flex h-screen w-full items-center justify-center bg-gray-100 p-4 sm:p-0">
      <SignInForm
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        isGoogleLoading={isGoogleLoading}
        isEmailLoading={isEmailLoading}
        setIsGoogleLoading={setIsGoogleLoading}
        form={form}
        handleSignIn={handleSignIn}
      />
    </main>
  );
}

interface SignInFormProps {
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  isGoogleLoading: boolean;
  setIsGoogleLoading: React.Dispatch<React.SetStateAction<boolean>>;
  isEmailLoading: boolean;
  form: UseFormReturn<
    {
      email: string;
      password: string;
    },
    any,
    undefined
  >;
  handleSignIn: (values: z.infer<typeof signUpSchema>) => void;
}

function SignInForm({
  isLoading,
  form,
  handleSignIn,
  setIsLoading,
  isGoogleLoading,
  setIsGoogleLoading,
  isEmailLoading,
}: SignInFormProps) {
  return (
    <div className="relative mx-auto flex w-full max-w-md flex-col justify-center space-y-6 rounded-lg bg-white p-6 shadow-lg sm:p-8">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tighter text-gray-800">Welcome back</h1>
        <p className="text-sm text-gray-600">Enter your email to sign in to your account</p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit((values) => handleSignIn(values))} className="space-y-4">
          <div className="flex flex-col gap-4 py-2">
            <FormField
              control={form.control}
              name="email"
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

          <div className="text-right text-sm text-gray-500">
            <Link href="/forgot-password" className="hover:underline">
              Forgot Password?
            </Link>
          </div>

          <Button className="w-full" type="submit" disabled={isLoading}>
            {isEmailLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
            Sign In
          </Button>
        </form>
      </Form>

      <Button
        className="w-full"
        disabled={isLoading}
        onClick={async () => {
          setIsGoogleLoading(true);
          setIsLoading(true);

          const res = await signIn("google", { redirect: false });

          if (!res?.error) {
            toast.success("Signed In");
          } else {
            toast.error("oops something went wrong..!");
          }

          setIsGoogleLoading(false);
          setIsLoading(false);
        }}
      >
        {isGoogleLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
        Sign in with Google
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
        Don&lsquo;t have an account?{" "}
        <Link href="/sign-up" className="text-blue-500 hover:underline">
          Sign Up
        </Link>
      </p>
    </div>
  );
}
