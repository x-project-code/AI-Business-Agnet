import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Business Chat Wall",
  description: "Chat with ABC Mobile Shop in real time.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
