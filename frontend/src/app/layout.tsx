import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans"; // Import Geist Sans font object
import "./globals.css";
import { cn } from "@/lib/utils";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "./providers"; // Import Providers

// Note: Geist Mono font variable (--font-geist-mono) is defined but not used in the body className currently.
// If needed, add it back like: `${GeistSans.variable} ${GeistMono.variable}`

export const metadata: Metadata = {
  title: "EasyStake: Unlock Effortless NERO Yield",
  description:
    "Maximize your NERO staking rewards with smart vaults and AI-powered strategies.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning data-oid="kwffh_p">
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          GeistSans.variable, // Use the imported font object's variable directly
        )}
        data-oid="zzj_mag"
      >
        <Providers data-oid="22hdy:s">
          {" "}
          {/* Wrap content with Providers */}
          <div
            className="relative flex min-h-dvh flex-col bg-background"
            data-oid="z.5nb24"
          >
            <Header data-oid="qjh--av" />
            <main className="flex-1" data-oid="l2:6r4_">
              {children}
            </main>
            <Footer data-oid="57adlul" />
          </div>
          <Toaster data-oid=":uzr4zd" />
        </Providers>
      </body>
    </html>
  );
}
