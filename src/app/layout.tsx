import type { Metadata } from "next";
import { Zen_Maru_Gothic } from "next/font/google";
import { Geist_Mono } from "next/font/google";
import { LocaleProvider } from "@/lib/locale-context";
import { Nav } from "@/components/nav";
import "./globals.css";

const zenMaru = Zen_Maru_Gothic({
  variable: "--font-zen-maru",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hello! Project Viewer",
  description: "H!P Member Timeline & Line Distribution",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${zenMaru.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body
        className="min-h-full flex flex-col"
        style={{ fontFamily: "var(--font-zen-maru), sans-serif" }}
      >
        <LocaleProvider>
          <Nav />
          <main className="flex-1">{children}</main>
        </LocaleProvider>
      </body>
    </html>
  );
}
