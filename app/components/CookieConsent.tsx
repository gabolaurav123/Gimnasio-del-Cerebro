"use client";

import { Cookie, X } from "lucide-react";
import { useEffect, useState } from "react";

const key = "gdc_cookie_notice_2026_08";
export function CookieConsent() {
  const [visible, setVisible] = useState(false);
  useEffect(() => { const frame = requestAnimationFrame(() => setVisible(!localStorage.getItem(key))); return () => cancelAnimationFrame(frame); }, []);
  function accept() { localStorage.setItem(key, "accepted"); setVisible(false); }
  if (!visible) return null;
  return <aside className="cookie-notice" aria-label="Aviso de cookies"><Cookie /><div><strong>Cookies y almacenamiento esencial</strong><p>Usamos almacenamiento necesario para sesiones seguras, preferencias y funcionamiento del sitio. Consulta nuestra <a href="/cookies">política de cookies</a>.</p></div><button className="button button--primary" type="button" onClick={accept}>Entendido</button><button className="cookie-close" type="button" aria-label="Cerrar aviso" onClick={accept}><X /></button></aside>;
}
