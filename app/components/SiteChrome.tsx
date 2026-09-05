"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Bell, BrainCircuit, CalendarDays, ChevronDown, Menu, MessageCircle, Tag, X } from "lucide-react";
import { formatWhatsAppNumber, whatsappUrl } from "../../lib/whatsapp";
import { useWhatsAppNumber } from "./WhatsAppContext";
import type { PublicNotification } from "../../db/repository";

type NavItem = { href: string; label: string; children?: { href: string; label: string }[] };
const nav: NavItem[] = [
  { href: "/", label: "Inicio" },
  { href: "/nosotros", label: "Nosotros" },
  { href: "/entrenamientos", label: "Entrenamientos", children: [{ href: "/entrenamientos", label: "Todos los entrenamientos" }, { href: "/eventos", label: "Eventos" }] },
  { href: "/productos", label: "Productos" },
  { href: "/blog", label: "Blog" },
  { href: "/contacto", label: "Contacto", children: [{ href: "/contacto", label: "Enviar una consulta" }, { href: "/agenda", label: "Agenda tu cita" }] },
  { href: "/asociados", label: "Asociados" },
];

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <a className={`brand ${compact ? "brand--compact" : ""}`} href="/" aria-label="Gimnasio del Cerebro, inicio">
      <span className="brand__mark">
        <img src="/logos/gdc-full-v2.jpg" alt="" width={72} height={72} />
      </span>
      <span className="brand__type"><strong>Gimnasio</strong><span>del Cerebro</span></span>
    </a>
  );
}

export function SiteHeader({ notifications = [] }: { notifications?: PublicNotification[] }) {
  const pathname = usePathname();
  const whatsapp = useWhatsAppNumber();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 28);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`site-header ${pathname !== "/" ? "site-header--solid" : ""} ${scrolled ? "site-header--scrolled" : ""}`}>
      <div className="shell site-header__inner">
        <Brand />
        <nav className="desktop-nav" aria-label="Navegación principal">
          {nav.map((item) => item.children ? <div className="nav-dropdown" key={item.href}><a href={item.href}>{item.label}<ChevronDown size={13} /></a><div className="nav-dropdown__menu">{item.children.map((child) => <a href={child.href} key={child.href}>{child.label}<ArrowUpRight size={14} /></a>)}</div></div> : <a href={item.href} key={item.href}>{item.label}</a>)}
        </nav>
        <div className="site-header__actions">
          <details className="notification-menu"><summary aria-label={`Novedades${notifications.length ? `, ${notifications.length} disponibles` : ""}`}><Bell size={19} />{notifications.length > 0 && <span>{notifications.length}</span>}</summary><div className="notification-menu__panel"><div><strong>Novedades</strong><small>Eventos y descuentos</small></div>{notifications.length ? notifications.map((item) => <a href={item.href} key={item.id}>{item.kind === "event" ? <CalendarDays size={17} /> : <Tag size={17} />}<span><strong>{item.title}</strong><small>{item.detail}</small></span></a>) : <p>No hay novedades publicadas por ahora.</p>}</div></details>
          <a className="login-link" href="/login">Ingresar</a>
          <a className="button button--whatsapp button--small" href={whatsappUrl("Hola, visité la web de Gimnasio del Cerebro y quisiera recibir más información.", whatsapp)} target="_blank" rel="noreferrer">
            <MessageCircle size={17} /> WhatsApp
          </a>
          <button className="menu-button" type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-controls="mobile-menu" aria-label={open ? "Cerrar menú" : "Abrir menú"}>
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>
      <div id="mobile-menu" className={`mobile-menu ${open ? "mobile-menu--open" : ""}`}>
        <nav className="shell" aria-label="Navegación móvil">
          {nav.map((item) => <div className="mobile-nav-group" key={item.href}><a href={item.href} onClick={() => setOpen(false)}>{item.label}<ArrowUpRight size={17} /></a>{item.children?.filter((child) => child.href !== item.href).map((child) => <a className="mobile-nav-child" href={child.href} key={child.href} onClick={() => setOpen(false)}>{child.label}<ArrowUpRight size={15} /></a>)}</div>)}
          <a href="/login" onClick={() => setOpen(false)}>Ingresar o crear cuenta<ArrowUpRight size={17} /></a>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  const year = new Date().getFullYear();
  const whatsapp = useWhatsAppNumber();
  return (
    <footer className="site-footer">
      <div className="shell footer-grid">
        <div className="footer-intro">
          <Brand compact />
          <p>Entrenamos nuevas formas de comprender la mente para impulsar procesos de desarrollo humano y aprendizaje consciente.</p>
          <div className="footer-partners"><small>Organizaciones vinculadas</small><div><span>Fundación Nueva Humanidad</span><a href="https://www.comunidadkiryus.org/" target="_blank" rel="noreferrer">Comunidad Kiryus <ArrowUpRight size={13} /></a></div></div>
        </div>
        <div><h3>Navegación</h3>{nav.filter((item) => ["/", "/nosotros", "/productos", "/asociados"].includes(item.href)).map((item) => <a href={item.href} key={item.href}>{item.label}</a>)}</div>
        <div><h3>Entrenamientos</h3><a href="/entrenamientos/neurofitness-active">Neurofitness Active</a><a href="/entrenamientos/neurotraumas">Neurotraumas</a><a href="/entrenamientos/brain-full-training">Brain Full Training</a></div>
        <div><h3>Contacto</h3><a href={whatsappUrl("Hola, quisiera recibir información sobre los entrenamientos de Gimnasio del Cerebro.", whatsapp)} target="_blank" rel="noreferrer">{formatWhatsAppNumber(whatsapp)}</a><a href="/contacto">Enviar una consulta</a><a href="/agenda">Agendar una cita</a><a href="/privacidad">Privacidad</a><a href="/terminos">Términos</a><a href="/cookies">Cookies</a></div>
      </div>
      <div className="shell footer-bottom"><span>© {year} Gimnasio del Cerebro</span><span>Conocimiento · Desarrollo humano · Tecnología</span><a href="/login">Ingresar</a></div>
    </footer>
  );
}

export function WhatsAppFloat() {
  const whatsapp = useWhatsAppNumber();
  return <a className="whatsapp-float" href={whatsappUrl("Hola, visité la web de Gimnasio del Cerebro y quisiera recibir más información.", whatsapp)} target="_blank" rel="noreferrer" aria-label="Consultar por WhatsApp"><MessageCircle /></a>;
}

export function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return <div className="eyebrow"><BrainCircuit size={16} />{children}</div>;
}
