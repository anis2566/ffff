import { Geist, Geist_Mono } from "next/font/google";
import { TRPCReactProvider } from "@/trpc/react";
import { NuqsAdapter } from "nuqs/adapters/next/app";

import { Providers } from "@/components/providers";

import "@workspace/ui/globals.css";
import { Metadata } from "next";

const fontSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: {
    template: "%s | BEC",
    default: "BEC | Basic Education Care",
  },
  description:
    "Basic Education Care is a web application for educational institutions to manage their students and teachers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <TRPCReactProvider>
      <NuqsAdapter>
        <html lang="en" suppressHydrationWarning>
          <body
            className={`${fontSans.variable} ${fontMono.variable} font-sans antialiased `}
          >
            <Providers>{children}</Providers>
          </body>
        </html>
      </NuqsAdapter>
    </TRPCReactProvider>
  );
}
