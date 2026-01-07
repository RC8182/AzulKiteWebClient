import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { Providers } from "@/providers/HeroUIProvider";
import Navbar from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import { fetchData } from "@/lib/strapi";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const globalData = await fetchData("global", { populate: "*" });
    const siteName = globalData?.data?.siteName || "Azul Kiteboarding";

    return {
      title: {
        default: siteName,
        template: `%s | ${siteName}`,
      },
      description: globalData?.data?.footerText || "La mejor tienda y escuela de kitesurf.",
    };
  } catch (error) {
    return {
      title: "Azul Kiteboarding | Tienda & Escuela",
      description: "La mejor tienda y escuela de kitesurf. Productos premium y clases personalizadas.",
    };
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <Navbar />
          {children}
        </Providers>
      </body>
    </html>
  );
}
