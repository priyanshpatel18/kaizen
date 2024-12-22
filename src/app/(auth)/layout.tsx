interface AuthLayoutProps {
  children: React.ReactNode;
}

export default async function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <main className="min-h-screen w-full p-0">
      <div className="flex h-screen w-full items-center justify-center bg-gray-100 p-4 sm:p-0">{children}</div>
    </main>
  );
}
