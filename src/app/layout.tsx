import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Emir",
  description: "Kişisel bio profili.",
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
