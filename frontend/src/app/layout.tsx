import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ShieldCaptcha Enterprise v4.0 — Smart Bot Defense",
  description: "Next.js & TypeScript Powered Bot Defense. Fast 1-Click Turnstile with Proof-of-Work and Anti-CV Interlocking Jigsaw Slider.",
  icons: {
    icon: [
      { url: "/logo.png?v=5", type: "image/png" },
      { url: "/favicon.ico?v=5", type: "image/x-icon" }
    ],
    shortcut: "/logo.png?v=5",
    apple: "/logo.png?v=5",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} scroll-smooth`}>
      <body className="font-sans antialiased bg-[#f8fafc] text-slate-800 min-h-screen flex flex-col selection:bg-indigo-500/20 selection:text-indigo-900">
        {children}
      </body>
    </html>
  );
}
