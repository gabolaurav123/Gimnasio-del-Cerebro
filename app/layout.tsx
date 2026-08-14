import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "gimnasio-del-cerebro.sites.openai.com";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https");
  const origin = `${protocol}://${host}`;
  return {
    metadataBase: new URL(origin),
    title: { default: "Gimnasio del Cerebro", template: "%s · Gimnasio del Cerebro" },
    description: "Entrena tu cerebro. Transforma tu vida. Desarrollo humano, mente y aprendizaje consciente desde 2014.",
    icons: { icon: "/logos/gdc-primary.jpg", shortcut: "/logos/gdc-primary.jpg", apple: "/logos/gdc-primary.jpg" },
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
