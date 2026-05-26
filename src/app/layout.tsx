import type { Metadata } from "next";
import type { ReactNode } from "react";

import "@/styles/globals.css";

import { Providers } from "./providers";
import GeminiConnectionTest from "@/features/debug/GeminiConnectionTest";

export const metadata: Metadata = {
  title: {
    default: "Zenith: The Vision Master",
    template: "%s · Zenith",
  },
  description: "Vision-based combat scaffold with MediaPipe and Gemini Sensei.",
  icons: {
    icon: "/favicon.svg",
  },
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&family=Orbitron:wght@600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body>
        <GeminiConnectionTest />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

