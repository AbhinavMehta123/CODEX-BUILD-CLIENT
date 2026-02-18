import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import GlobalLoader from "@/components/GlobalLoader";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "CODEX BUILD",
  description: "AI Hackthon by ALFA Coding Club",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      > <GlobalLoader/>
        {children}
      </body>
    </html>
  );
}
