import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "JMS – Journal Management System",
  description: "Professional academic journal management platform",
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
