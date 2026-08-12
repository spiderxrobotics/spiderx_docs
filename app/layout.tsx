import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SpiderX Docs - Modern Letterhead Document Studio",
  description: "Create, format, align and export official SpiderX Robotics letterhead documents with director signature and official seal.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-background text-foreground transition-colors duration-200">{children}</body>
    </html>
  );
}
