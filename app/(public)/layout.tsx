import { SiteFooter, SiteHeader, WhatsAppFloat } from "../components/SiteChrome";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return <><SiteHeader /><main>{children}</main><SiteFooter /><WhatsAppFloat /></>;
}
