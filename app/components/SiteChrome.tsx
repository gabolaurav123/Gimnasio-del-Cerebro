"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, BrainCircuit, Menu, MessageCircle, X } from "lucide-react";
import { whatsappUrl } from "../../lib/whatsapp";

const nav = [
  { href: "/", label: "Inicio" },
  { href: "/entrenamientos", label: "Entrenamientos" },
  { href: "/blog", label: "Blog" },
  { href: "/contacto", label: "Contacto" },
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

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 28);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`site-header ${scrolled ? "site-header--scrolled" : ""}`}>
      <div className="shell site-header__inner">
        <Brand />
        <nav className="desktop-nav" aria-label="Navegación principal">
          {nav.map((item) => <a href={item.href} key={item.href}>{item.label}</a>)}
        </nav>
        <div className="site-header__actions">
          <a className="login-link" href="/login">Ingresar</a>
          <a className="button button--whatsapp button--small" href={whatsappUrl("Hola, visité la web de Gimnasio del Cerebro y quisiera recibir más información.")} target="_blank" rel="noreferrer">
            <MessageCircle size={17} /> WhatsApp
          </a>
          <button className="menu-button" type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-controls="mobile-menu" aria-label={open ? "Cerrar menú" : "Abrir menú"}>
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>
      <div id="mobile-menu" className={`mobile-menu ${open ? "mobile-menu--open" : ""}`}>
        <nav className="shell" aria-label="Navegación móvil">
          {nav.map((item) => <a href={item.href} key={item.href} onClick={() => setOpen(false)}>{item.label}<ArrowUpRight size={17} /></a>)}
          <a href="/login" onClick={() => setOpen(false)}>Acceso administrativo<ArrowUpRight size={17} /></a>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer">
      <div className="shell footer-grid">
        <div className="footer-intro">
          <Brand compact />
          <p>Entrenamos nuevas formas de comprender la mente para impulsar procesos de desarrollo humano y aprendizaje consciente.</p>
        </div>
        <div><h3>Navegación</h3>{nav.map((item) => <a href={item.href} key={item.href}>{item.label}</a>)}</div>
        <div><h3>Entrenamientos</h3><a href="/entrenamientos/neurofitness-active">Neurofitness Active</a><a href="/entrenamientos/neurotraumas">Neurotraumas</a><a href="/entrenamientos/brain-full-training">Brain Full Training</a></div>
        <div><h3>Contacto</h3><a href={whatsappUrl("Hola, quisiera recibir información sobre los entrenamientos de Gimnasio del Cerebro.")} target="_blank" rel="noreferrer">+54 381 300-4167</a><a href="/contacto">Enviar una consulta</a></div>
      </div>
      <div className="shell footer-bottom"><span>© {year} Gimnasio del Cerebro</span><span>Conocimiento · Desarrollo humano · Tecnología</span><a href="/login">Administración</a></div>
    </footer>
  );
}

export function WhatsAppFloat() {
  return <a className="whatsapp-float" href={whatsappUrl("Hola, visité la web de Gimnasio del Cerebro y quisiera recibir más información.")} target="_blank" rel="noreferrer" aria-label="Consultar por WhatsApp"><MessageCircle /></a>;
}

export function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return <div className="eyebrow"><BrainCircuit size={16} />{children}</div>;
}
