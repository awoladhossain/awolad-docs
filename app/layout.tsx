import type { Metadata } from "next";
import { Geist, Geist_Mono, Hind_Siliguri } from "next/font/google";
import "./globals.css";
import GSAPInitializer from "@/components/GSAPInitializer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const hindSiliguri = Hind_Siliguri({
  variable: "--font-bengali",
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["bengali", "latin"],
});

export const metadata: Metadata = {
  title: {
    default: "MD Core Docs",
    template: "%s | MD Core Docs",
  },
  description:
    "Markdown-based documentation hub for database design, SQL concepts, and engineering notes.",
  applicationName: "MD Core Docs",
  keywords: [
    "documentation",
    "markdown",
    "database",
    "sql",
    "normalization",
    "nextjs",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="bn"
      className={`${geistSans.variable} ${geistMono.variable} ${hindSiliguri.variable} antialiased`}
      data-scroll-behavior="smooth"
    >
      <body
        className="min-h-full bg-[#09090b] text-white"
        suppressHydrationWarning
      >
        <GSAPInitializer />
        {children}
      </body>
    </html>
  );
}
