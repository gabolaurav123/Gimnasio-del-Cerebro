"use client";

import Image from "next/image";
import { ArrowLeft, Bot, BookOpen, LogOut, Menu, PackageCheck, X } from "lucide-react";
import { useState } from "react";

export function CustomerShell({ children, user }: { children: React.ReactNode; user: { name: string; email: string } }) {
  const [open, setOpen] = useState(false);
  async function logout() { await fetch("/api/customer/auth/logout", { method: "POST" }); window.location.assign("/login"); }
  return <div className="customer-shell"><aside className={`customer-sidebar ${open ? "customer-sidebar--open" : ""}`}><div className="customer-brand"><a href="/"><Image src="/logos/gdc-full-v2.jpg" alt="" width={50} height={50} /><span><strong>Gimnasio del Cerebro</strong>Mi espacio</span></a><button type="button" onClick={() => setOpen(false)} aria-label="Cerrar menú"><X /></button></div><nav><a href="#inicio"><BookOpen size={19} />Inicio</a><a href="#programas"><PackageCheck size={19} />Mis programas</a><a href="#asistentes"><Bot size={19} />Asistentes personalizados</a></nav><a className="customer-site-link" href="/"><ArrowLeft size={17} />Volver al sitio</a><button className="customer-logout" type="button" onClick={logout}><LogOut size={18} />Cerrar sesión</button></aside><div className="customer-main"><header className="customer-topbar"><button type="button" onClick={() => setOpen(true)} aria-label="Abrir menú"><Menu /></button><div><strong>{user.name}</strong><span>{user.email}</span></div><a href="/">Ver sitio</a></header>{children}</div></div>;
}
