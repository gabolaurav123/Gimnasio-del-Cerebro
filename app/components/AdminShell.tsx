"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BookOpen, BrainCircuit, ChevronRight, ContactRound, FileText, Gauge, ImageIcon, LogOut, Menu, MessageSquareQuote, Search, Settings2, UsersRound, X } from "lucide-react";
import { useState } from "react";

const items = [
  { href: "/admin", label: "Dashboard", icon: Gauge },
  { href: "/admin/crm", label: "CRM", icon: ContactRound },
  { href: "/admin/entrenamientos", label: "Entrenamientos", icon: BrainCircuit },
  { href: "/admin/blog", label: "Blog", icon: BookOpen },
  { href: "/admin/testimonios", label: "Testimonios", icon: MessageSquareQuote },
  { href: "/admin/contenido", label: "Contenido web", icon: FileText },
  { href: "/admin/media", label: "Biblioteca multimedia", icon: ImageIcon },
  { href: "/admin/usuarios", label: "Usuarios", icon: UsersRound },
  { href: "/admin/configuracion", label: "Configuración", icon: Settings2 },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const path = usePathname(); const router = useRouter(); const [open, setOpen] = useState(false);
  async function logout() { await fetch("/api/auth/logout", { method: "POST" }); router.push("/login"); router.refresh(); }
  const current = items.filter((item) => path === item.href || path.startsWith(`${item.href}/`)).at(-1)?.label ?? "Panel";
  return <div className="admin-shell"><aside className={`admin-sidebar ${open ? "admin-sidebar--open" : ""}`}><div className="admin-sidebar__brand"><Image src="/logos/gdc-full-v2.jpg" alt="" width={52} height={52} /><span><strong>GDC</strong>Administración</span><button onClick={() => setOpen(false)} type="button" aria-label="Cerrar menú"><X /></button></div><nav>{items.map(({ href, label, icon: Icon }) => <Link className={path === href || (href !== "/admin" && path.startsWith(`${href}/`)) ? "active" : ""} href={href} key={href} onClick={() => setOpen(false)}><Icon size={19} /><span>{label}</span>{(path === href || (href !== "/admin" && path.startsWith(`${href}/`))) && <ChevronRight size={15} />}</Link>)}</nav><button className="admin-logout" type="button" onClick={logout}><LogOut size={18} />Cerrar sesión</button></aside><div className="admin-main"><header className="admin-topbar"><button className="admin-menu" type="button" onClick={() => setOpen(true)} aria-label="Abrir menú"><Menu /></button><div><span>Gimnasio del Cerebro</span><strong>{current}</strong></div><label className="admin-search"><Search size={18} /><span className="sr-only">Búsqueda global</span><input placeholder="Buscar en el panel" /></label><div className="admin-avatar">AD</div></header><main className="admin-content">{children}</main></div></div>;
}
