"use client";

import { usePathname } from "next/navigation";
import { SiteFooter, SiteHeader, WhatsAppFloat } from "./SiteChrome";
import { WhatsAppProvider } from "./WhatsAppContext";
import type { Associate, PublicNotification } from "../../db/repository";
import { CookieConsent } from "./CookieConsent";
import { NeurofitnessPopup, type NeurofitnessPublicConfig } from "./NeurofitnessPopup";

export function PublicShell({ children, whatsapp, notifications = [], associates = [], neurofitness }: { children: React.ReactNode; whatsapp?: string; notifications?: PublicNotification[]; associates?: Associate[]; neurofitness: NeurofitnessPublicConfig }) {
  const pathname = usePathname();

  if (pathname === "/login") return <main className="auth-main">{children}</main>;

  return <WhatsAppProvider number={whatsapp}><SiteHeader notifications={notifications} /><main>{children}</main><SiteFooter associates={associates} /><WhatsAppFloat /><CookieConsent /><NeurofitnessPopup config={neurofitness} /></WhatsAppProvider>;
}
