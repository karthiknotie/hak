import type { Metadata } from "next";
import { Suspense } from "react";
import SmoothScroll from "@/components/SmoothScroll";
import CyberBackground from "@/components/CyberBackground";
import CursorEffect from "@/components/CursorEffect";
import PageTracker from "@/components/PageTracker";
import { Cinzel, Orbitron, Space_Grotesk, Inter, Geist_Mono } from "next/font/google";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./globals.css";

const cinzel = Cinzel({
  variable: "--cinzel",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800", "900"],
});

const orbitron = Orbitron({
  variable: "--orbitron",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--space-grotesk",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.blakash.com"),
  title: {
    default: "BLAKASH — Indie Game Studio",
    template: "%s | BLAKASH",
  },
  description:
    "BLAKASH is an independent game studio creating original games, immersive worlds, and interactive experiences.",
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${cinzel.variable} ${orbitron.variable} ${spaceGrotesk.variable} ${inter.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-black">
        <SmoothScroll />
        <CyberBackground />
        <CursorEffect />
        <Suspense fallback={null}>
          <PageTracker />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
