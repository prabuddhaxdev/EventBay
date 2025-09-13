import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import ConvexClientProvider from "@/components/ConvexClientProvider";
import Header from "@/components/Header";
import SyncUserWithConvex from "@/components/SyncUserWithConvex";
import { Toaster } from "@/components/ui/sonner";

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
        <ClerkProvider>
          <Header />
          <ConvexClientProvider>
            <SyncUserWithConvex />
            {children}
            <Toaster/>
          </ConvexClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
