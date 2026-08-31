"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { ArrowLeft, BookOpen, Bot, BrainCircuit, Calculator, CalendarDays, ChevronRight, ContactRound, CreditCard, FileText, Gauge, Handshake, ImageIcon, LogOut, Menu, MessageCircleMore, MessageSquareQuote, Search, Settings2, ShoppingBag, UserRoundCheck, UsersRound, X } from "lucide-react";
import { FormEvent, useState } from "react";
import type { AdminRole } from "../../db/repository";

const items = [
  { href: "/admin", label: "Dashboard", icon: Gauge, roles: ["SUPERADMIN", "EDITOR", "COMERCIAL"] },
  { href: "/admin/crm", label: "Contactos y citas", icon: ContactRound, roles: ["SUPERADMIN", "COMERCIAL"] },
  { href: "/admin/entrenamientos", label: "Entrenamientos", icon: BrainCircuit, roles: ["SUPERADMIN", "EDITOR"] },
  { href: "/admin/eventos", label: "Eventos", icon: CalendarDays, roles: ["SUPERADMIN", "EDITOR"] },
  { href: "/admin/productos", label: "Productos", icon: ShoppingBag, roles: ["SUPERADMIN", "EDITOR"] },
  { href: "/admin/pagos", label: "Pagos", icon: CreditCard, roles: ["SUPERADMIN", "COMERCIAL"] },
  { href: "/admin/contabilidad", label: "Contabilidad", icon: Calculator, roles: ["SUPERADMIN"] },
  { href: "/admin/clientes", label: "Usuarios clientes", icon: UserRoundCheck, roles: ["SUPERADMIN", "COMERCIAL"] },
  { href: "/admin/asistentes", label: "Asistentes IA", icon: Bot, roles: ["SUPERADMIN"] },
  { href: "/admin/blog", label: "Blog", icon: BookOpen, roles: ["SUPERADMIN", "EDITOR"] },
  { href: "/admin/testimonios", label: "Testimonios", icon: MessageSquareQuote, roles: ["SUPERADMIN", "EDITOR"] },
  { href: "/admin/asociados", label: "Asociados", icon: Handshake, roles: ["SUPERADMIN", "EDITOR"] },
  { href: "/admin/whatsapp", label: "WhatsApp + IA", icon: MessageCircleMore, roles: ["SUPERADMIN"] },
  { href: "/admin/contenido", label: "Contenido web", icon: FileText, roles: ["SUPERADMIN", "EDITOR"] },
  { href: "/admin/media", label: "Biblioteca multimedia", icon: ImageIcon, roles: ["SUPERADMIN", "EDITOR"] },
  { href: "/admin/usuarios", label: "Usuarios", icon: UsersRound, roles: ["SUPERADMIN"] },
  { href: "/admin/configuracion", label: "Configuración", icon: Settings2, roles: ["SUPERADMIN"] },
];

export function AdminShell({ children, user }: { children: React.ReactNode; user: { email: string; role: AdminRole } }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const visibleItems = items.filter((item) => item.roles.includes(user.role));
  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.assign("/login");
  }
  function searchPanel(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = search.trim().toLocaleLowerCase("es");
    if (!query) return;
    const match = visibleItems.find((item) => item.label.toLocaleLowerCase("es").includes(query));
    if (match) window.location.assign(match.href);
  }
  const current = visibleItems.filter((item) => path === item.href || path.startsWith(`${item.href}/`)).at(-1)?.label ?? "Panel";
  const initials = user.email.slice(0, 2).toUpperCase();
  return <div className="admin-shell"><aside className={`admin-sidebar ${open ? "admin-sidebar--open" : ""}`}><div className="admin-sidebar__brand"><a href="/" title="Volver a Gimnasio del Cerebro"><Image src="/logos/gdc-full-v2.jpg" alt="" width={52} height={52} /><span><strong>GDC</strong>Administración</span></a><button onClick={() => setOpen(false)} type="button" aria-label="Cerrar menú"><X /></button></div><a className="admin-back-site" href="/"><ArrowLeft size={16} />Volver al sitio</a><nav>{visibleItems.map(({ href, label, icon: Icon }) => <a className={path === href || (href !== "/admin" && path.startsWith(`${href}/`)) ? "active" : ""} href={href} key={href} onClick={() => setOpen(false)}><Icon size={19} /><span>{label}</span>{(path === href || (href !== "/admin" && path.startsWith(`${href}/`))) && <ChevronRight size={15} />}</a>)}</nav><button className="admin-logout" type="button" onClick={logout}><LogOut size={18} />Cerrar sesión</button></aside><div className="admin-main"><header className="admin-topbar"><button className="admin-menu" type="button" onClick={() => setOpen(true)} aria-label="Abrir menú"><Menu /></button><div><span>{user.email}</span><strong>{current}</strong></div><form className="admin-search" role="search" onSubmit={searchPanel}><Search size={18} /><label className="sr-only" htmlFor="admin-global-search">Búsqueda global</label><input id="admin-global-search" list="admin-search-sections" placeholder="Buscar en el panel" value={search} onChange={(event) => setSearch(event.target.value)} /><datalist id="admin-search-sections">{visibleItems.map((item) => <option value={item.label} key={item.href} />)}</datalist></form><a className="admin-topbar__site" href="/" title="Volver al sitio"><ArrowLeft size={17} /><span>Ver sitio</span></a><div className="admin-avatar" title={user.role}>{initials}</div></header><main className="admin-content">{children}</main></div></div>;
}
