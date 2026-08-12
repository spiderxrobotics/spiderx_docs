import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SpiderX Docs - Modern Letterhead Document Studio",
  description: "Create, format, align and export official SpiderX Robotics letterhead documents with director signature and official seal.",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="shortcut icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icon.svg" />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground transition-colors duration-200">{children}</body>
    </html>
  );
}
