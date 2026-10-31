import type { Metadata } from "next";
import { DynamicTabTitle } from "@/app/dynamic-tab-title";
import "./globals.css";

export const metadata: Metadata = {
  title: "@warxy 🌙",
  description: "Warxy • Kişisel bio profili.",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body>
        <DynamicTabTitle text="@warxy" badge="🌙" />
        {children}
      </body>
    </html>
  );
}
