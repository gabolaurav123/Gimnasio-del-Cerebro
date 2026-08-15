"use client";

import { usePathname } from "next/navigation";
import { SiteFooter, SiteHeader, WhatsAppFloat } from "./SiteChrome";

export function PublicShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname === "/login") return <main className="auth-main">{children}</main>;

  return <><SiteHeader /><main>{children}</main><SiteFooter /><WhatsAppFloat /></>;
}
