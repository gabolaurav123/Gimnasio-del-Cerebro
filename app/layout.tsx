import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { getSiteOrigin } from "../lib/site-url";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const origin = await getSiteOrigin();
  return {
    metadataBase: new URL(origin),
    title: { default: "Gimnasio del Cerebro", template: "%s · Gimnasio del Cerebro" },
    description: "Entrena tu cerebro. Transforma tu vida. Desarrollo humano, mente y aprendizaje consciente desde 2014.",
    icons: {
      icon: [
        { url: "/favicon.ico?v=4", type: "image/x-icon", sizes: "16x16 32x32 48x48" },
        { url: "/favicon.png?v=4", type: "image/png", sizes: "512x512" },
      ],
      shortcut: "/favicon.ico?v=4",
      apple: [{ url: "/apple-touch-icon.png?v=4", type: "image/png", sizes: "180x180" }],
    },
    openGraph: { title: "Gimnasio del Cerebro", description: "Entrena tu cerebro. Transforma tu vida.", type: "website", url: origin, images: [{ url: `${origin}/og.png`, width: 1736, height: 909, alt: "Gimnasio del Cerebro — Entrena tu cerebro. Transforma tu vida." }] },
    twitter: { card: "summary_large_image", title: "Gimnasio del Cerebro", description: "Entrena tu cerebro. Transforma tu vida.", images: [`${origin}/og.png`] },
  };
}

export const viewport: Viewport = { themeColor: "#06172d", colorScheme: "light" };

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
        {children}
      </body>
    </html>
  );
}
