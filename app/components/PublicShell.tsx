"use client";

import { usePathname } from "next/navigation";
import { SiteFooter, SiteHeader, WhatsAppFloat } from "./SiteChrome";
import { WhatsAppProvider } from "./WhatsAppContext";
import type { PublicNotification } from "../../db/repository";

export function PublicShell({ children, whatsapp, notifications = [] }: { children: React.ReactNode; whatsapp?: string; notifications?: PublicNotification[] }) {
  const pathname = usePathname();

  if (pathname === "/login") return <main className="auth-main">{children}</main>;

  return <WhatsAppProvider number={whatsapp}><SiteHeader notifications={notifications} /><main>{children}</main><SiteFooter /><WhatsAppFloat /></WhatsAppProvider>;
}
