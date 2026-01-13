import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import { fetchData } from "@/lib/strapi";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  try {
    const globalData = await fetchData("global", { populate: "*", locale: lang });
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

export default async function RootLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}>) {
  const { lang } = await params;

  return (
    <html lang={lang} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
