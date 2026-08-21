"use client";

import { usePathname } from "next/navigation";
import { SiteFooter, SiteHeader, WhatsAppFloat } from "./SiteChrome";
import { WhatsAppProvider } from "./WhatsAppContext";

export function PublicShell({ children, whatsapp }: { children: React.ReactNode; whatsapp?: string }) {
  const pathname = usePathname();

  if (pathname === "/login") return <main className="auth-main">{children}</main>;

  return <WhatsAppProvider number={whatsapp}><SiteHeader /><main>{children}</main><SiteFooter /><WhatsAppFloat /></WhatsAppProvider>;
}
