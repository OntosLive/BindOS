import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BindOS",
  description: "Visual debugger for relational systems",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
