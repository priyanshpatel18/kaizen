import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import { SidebarProvider } from "@/components/ui/sidebar";
import { siteConfig } from "@/config/siteConfig";
import { cookies } from "next/headers";
import { Toaster } from "sonner";
import "./globals.css";
import Providers from "./Providers";

// Metadata
export const metadata = siteConfig;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const defaultOpen: boolean = cookieStore.get("sidebar:state")?.value === "true";

  return (
    <html lang="en">
      <body className={`bg-background`}>
        <GoogleAnalytics />
        <SidebarProvider defaultOpen={defaultOpen}>
          <Providers>
            {children}
            <Toaster />
          </Providers>
        </SidebarProvider>
      </body>
    </html>
  );
}
