import React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/providers";
import { cn } from "@/lib/utils";
import { APP_CONFIG } from "@/lib/constants";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: APP_CONFIG.name,
    template: `%s | ${APP_CONFIG.name}`,
  },
  description: APP_CONFIG.description,
  keywords: [
    "submissão",
    "artigos",
    "acadêmicos",
    "biopark",
    "pesquisa",
    "avaliação",
    "eventos",
    "científicos",
  ],
  authors: [
    {
      name: APP_CONFIG.company,
      url: "https://biopark.com.br",
    },
  ],
  creator: APP_CONFIG.company,
  publisher: APP_CONFIG.company,
  robots: {
    index: false, // Não indexar durante desenvolvimento
    follow: false,
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: APP_CONFIG.name,
    title: APP_CONFIG.name,
    description: APP_CONFIG.description,
  },
  twitter: {
    card: "summary_large_image",
    title: APP_CONFIG.name,
    description: APP_CONFIG.description,
  },
  icons: {
    icon: "/image.png",
    shortcut: "/image.png",
    apple: "/image.png",
  },
  manifest: "/manifest.json",
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          inter.className
        )}
      >
        <svg width="0" height="0" className="absolute">
          <defs>
            {/* Gradiente Primary - Cor Principal #541822 */}
            <linearGradient
              id="ia360-primary"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#541822" />
              <stop offset="25%" stopColor="#7a2630" />
              <stop offset="50%" stopColor="#9e3a47" />
              <stop offset="75%" stopColor="#7a2630" />
              <stop offset="100%" stopColor="#541822" />
            </linearGradient>

            {/* Gradiente Secondary */}
            <linearGradient
              id="ia360-secondary"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#541822" />
              <stop offset="50%" stopColor="#6b1f28" />
              <stop offset="100%" stopColor="#8b2d37" />
            </linearGradient>

            {/* Gradiente Accent */}
            <linearGradient
              id="ia360-accent"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#541822" />
              <stop offset="50%" stopColor="#7a2630" />
              <stop offset="100%" stopColor="#a0404d" />
            </linearGradient>

            {/* Gradiente Cool */}
            <linearGradient id="ia360-cool" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3d1219" />
              <stop offset="25%" stopColor="#541822" />
              <stop offset="50%" stopColor="#7a2630" />
              <stop offset="75%" stopColor="#9e3a47" />
              <stop offset="100%" stopColor="#541822" />
            </linearGradient>
          </defs>
        </svg>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
