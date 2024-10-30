import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import { siteConfig } from "@/config/siteConfig";
import { Manrope } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import Providers from "./Providers";

// Setup Font
const manrope = Manrope({ subsets: ["latin"] });

// Metadata
export const metadata = siteConfig;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${manrope.className}`}>
        <GoogleAnalytics />
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
