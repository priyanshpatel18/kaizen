import { SidebarProvider } from "@/components/ui/sidebar";
import { siteConfig } from "@/config/siteConfig";
import { Source_Sans_3 } from "next/font/google";
import { cookies } from "next/headers";
import { Toaster } from "sonner";
import "./globals.css";
import Providers from "./Providers";

// Setup Font
const sourceSansPro = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-source-sans-pro",
});

// Metadata
export const metadata = siteConfig;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = cookies();
  const defaultOpen: boolean = cookieStore.get("sidebar:state")?.value === "true";

  return (
    <html lang="en">
      <body className={`${sourceSansPro.className}`}>
        {/* <GoogleAnalytics /> */}
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
