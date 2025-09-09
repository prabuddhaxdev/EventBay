import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";

export const metadata: Metadata = {
  title: "EventBay",
  description: "Ticketing Platform Marketplace",
  icons: {
    icon: "/logo-mobile.svg",
  },
};

const inter=Inter({subsets:['latin']})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className}`}>
        <ClerkProvider>{children}</ClerkProvider>
      </body>
    </html>
  );
}
