import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Payflow gateway",
  description: "Payment gateway UI (Next.js App Router)",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="relative min-h-full flex flex-col">
        <a
          href="#checkout-main"
          className="absolute -left-[10000px] top-4 z-[100] rounded-lg bg-zinc-900 px-4 py-3 text-sm font-medium text-white shadow-lg outline-none ring-offset-2 transition-[left,box-shadow] focus:left-4 focus:ring-2 focus:ring-teal-400"
        >
          Skip to checkout
        </a>
        {children}
      </body>
    </html>
  );
}
