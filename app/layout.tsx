import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

const sans = Inter({
  variable: "--font-sans",
  subsets: ["latin"]
});

const serif = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"]
});

export const metadata: Metadata = {
  title: {
    default: "Roast & Bloom | Modern Cafe",
    template: "%s | Roast & Bloom"
  },
  description:
    "Roast & Bloom is a modern cafe web experience with seasonal drinks, handcrafted menu items, and warm hospitality."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${sans.variable} ${serif.variable}`}>
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
