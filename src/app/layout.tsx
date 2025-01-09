import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import { siteConfig } from "@/config/siteConfig";
import { Analytics } from "@vercel/analytics/react";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";
import Providers from "./Providers";

// Metadata
export const metadata = siteConfig;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`bg-background`}>
        <GoogleAnalytics />
        <Analytics />
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
