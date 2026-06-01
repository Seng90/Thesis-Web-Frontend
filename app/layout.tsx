import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";
import { ThemeProvider } from "@/components/ThemeProvider";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s | InvesTrack",
    default: "InvesTrack — Discover Laos' Startup Ecosystem",
  },
  description:
    "InvesTrack is a platform for discovering and tracking companies, investors, and funding rounds across Laos. Your gateway to the Lao startup world.",
  keywords: [
    "Laos startups",
    "Lao companies",
    "startup ecosystem",
    "investors Laos",
    "funding rounds",
    "InvesTrack",
    "Vientiane startups",
  ],
  openGraph: {
    title: "InvesTrack — Discover Laos' Startup Ecosystem",
    description:
      "Track companies, investors, and funding rounds across Laos.",
    type: "website",
    locale: "en_US",
    siteName: "InvesTrack",
  },
  twitter: {
    card: "summary_large_image",
    title: "InvesTrack — Discover Laos' Startup Ecosystem",
    description:
      "Track companies, investors, and funding rounds across Laos.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col antialiased bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50 transition-colors duration-300">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
