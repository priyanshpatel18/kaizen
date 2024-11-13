import { ReactNode } from "react";

export default function OnboardLayout({ children }: { children: ReactNode }) {
  return (
    <main className="flex h-screen w-full items-center justify-center bg-gray-100 p-4 sm:p-0">
      {children}
    </main>
  );
}
