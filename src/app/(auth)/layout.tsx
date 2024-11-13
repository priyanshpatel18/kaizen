import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default async function AuthLayout({ children }: AuthLayoutProps) {
  const session = await getServerSession(authOptions);
  if (session?.user) {
    redirect("/");
  }

  return <main className="min-h-screen w-full p-0">{children}</main>;
}
