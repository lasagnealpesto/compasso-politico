import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  metadataBase: new URL("https://compassopolitico.it"),
  title: {
    default: "Compasso Politico — La politica italiana spiegata bene",
    template: "%s | Compasso Politico",
  },
  description: "La politica italiana spiegata bene. Partiti, esponenti, governi e notizie quotidiane sul parlamento italiano.",
  keywords: ["politica italiana", "partiti politici italiani", "governo italiano", "parlamento", "esponenti politici", "notizie politica"],
  authors: [{ name: "Compasso Politico", url: "https://compassopolitico.it" }],
  creator: "Compasso Politico",
  publisher: "Compasso Politico",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  openGraph: {
    siteName: "Compasso Politico",
    locale: "it_IT",
    type: "website",
    title: "Compasso Politico — La politica italiana spiegata bene",
    description: "Partiti, esponenti, governi e notizie quotidiane sulla politica italiana.",
    url: "https://compassopolitico.it",
  },
  twitter: {
    card: "summary_large_image",
    title: "Compasso Politico — La politica italiana spiegata bene",
    description: "Partiti, esponenti, governi e notizie quotidiane sulla politica italiana.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" className={`${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col" style={{ background: "var(--background)", color: "var(--foreground)" }}>
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
