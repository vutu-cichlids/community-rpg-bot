import type { Metadata } from "next";
import { Cinzel } from "next/font/google";
import "./globals.css";

const cinzel = Cinzel({ subsets: ["latin"], weight: ["600", "700"], variable: "--font-cinzel" });

export const metadata: Metadata = {
  title: "Community RPG Dashboard",
  description: "Thống kê server và bảng xếp hạng live cho Community RPG Bot",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={cinzel.variable}>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
