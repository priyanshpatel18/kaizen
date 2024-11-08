import { siteConfig } from "@/config/siteConfig";
import { Manrope } from "next/font/google";
import localFont from "next/font/local";
import { cookies } from "next/headers";
import { Toaster } from "sonner";
import "./globals.css";
import Providers from "./Providers";

// Setup Font
const geistSans = localFont({
  src: "../../public/fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "../../public/fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

// Metadata
export const metadata = siteConfig;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = cookies();
  const defaultOpen: boolean =
    cookieStore.get("sidebar:state")?.value === "true";

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {/* <GoogleAnalytics /> */}
        <Providers defaultOpen={defaultOpen}>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
