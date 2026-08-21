"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BookOpen, BrainCircuit, ChevronRight, ContactRound, FileText, Gauge, ImageIcon, LogOut, Menu, MessageSquareQuote, Search, Settings2, UsersRound, X } from "lucide-react";
import { useState } from "react";
import type { AdminRole } from "../../db/repository";

const items = [
  { href: "/admin", label: "Dashboard", icon: Gauge, roles: ["SUPERADMIN", "EDITOR", "COMERCIAL"] },
  { href: "/admin/crm", label: "CRM", icon: ContactRound, roles: ["SUPERADMIN", "COMERCIAL"] },
  { href: "/admin/entrenamientos", label: "Entrenamientos", icon: BrainCircuit, roles: ["SUPERADMIN", "EDITOR"] },
  { href: "/admin/blog", label: "Blog", icon: BookOpen, roles: ["SUPERADMIN", "EDITOR"] },
  { href: "/admin/testimonios", label: "Testimonios", icon: MessageSquareQuote, roles: ["SUPERADMIN", "EDITOR"] },
  { href: "/admin/contenido", label: "Contenido web", icon: FileText, roles: ["SUPERADMIN", "EDITOR"] },
  { href: "/admin/media", label: "Biblioteca multimedia", icon: ImageIcon, roles: ["SUPERADMIN", "EDITOR"] },
  { href: "/admin/usuarios", label: "Usuarios", icon: UsersRound, roles: ["SUPERADMIN"] },
  { href: "/admin/configuracion", label: "Configuración", icon: Settings2, roles: ["SUPERADMIN"] },
];

export function AdminShell({ children, user }: { children: React.ReactNode; user: { email: string; role: AdminRole } }) {
  const path = usePathname(); const router = useRouter(); const [open, setOpen] = useState(false);
  const visibleItems = items.filter((item) => item.roles.includes(user.role));
  async function logout() { await fetch("/api/auth/logout", { method: "POST" }); router.push("/login"); router.refresh(); }
  const current = visibleItems.filter((item) => path === item.href || path.startsWith(`${item.href}/`)).at(-1)?.label ?? "Panel";
  const initials = user.email.slice(0, 2).toUpperCase();
  return <div className="admin-shell"><aside className={`admin-sidebar ${open ? "admin-sidebar--open" : ""}`}><div className="admin-sidebar__brand"><Image src="/logos/gdc-full-v2.jpg" alt="" width={52} height={52} /><span><strong>GDC</strong>Administración</span><button onClick={() => setOpen(false)} type="button" aria-label="Cerrar menú"><X /></button></div><nav>{visibleItems.map(({ href, label, icon: Icon }) => <Link className={path === href || (href !== "/admin" && path.startsWith(`${href}/`)) ? "active" : ""} href={href} key={href} onClick={() => setOpen(false)}><Icon size={19} /><span>{label}</span>{(path === href || (href !== "/admin" && path.startsWith(`${href}/`))) && <ChevronRight size={15} />}</Link>)}</nav><button className="admin-logout" type="button" onClick={logout}><LogOut size={18} />Cerrar sesión</button></aside><div className="admin-main"><header className="admin-topbar"><button className="admin-menu" type="button" onClick={() => setOpen(true)} aria-label="Abrir menú"><Menu /></button><div><span>{user.email}</span><strong>{current}</strong></div><label className="admin-search"><Search size={18} /><span className="sr-only">Búsqueda global</span><input placeholder="Buscar en el panel" /></label><div className="admin-avatar" title={user.role}>{initials}</div></header><main className="admin-content">{children}</main></div></div>;
}
