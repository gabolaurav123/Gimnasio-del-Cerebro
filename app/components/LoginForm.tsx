"use client";

import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail, UserRound } from "lucide-react";
import { FormEvent, useState } from "react";

export function LoginForm() {
  const [audience, setAudience] = useState<"customer" | "admin">("customer");
  const [registering, setRegistering] = useState(false);
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setError("");
    const form = new FormData(event.currentTarget);
    const data: Record<string, FormDataEntryValue | boolean> = Object.fromEntries(form);
    if (registering) { data.acceptedTerms = form.get("acceptedTerms") === "on"; data.acceptedPrivacy = form.get("acceptedPrivacy") === "on"; }
    const endpoint = audience === "admin" ? "/api/auth/login" : registering ? "/api/customer/auth/register" : "/api/customer/auth/login";
    const response = await fetch(endpoint, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(data) });
    if (!response.ok) { const payload = await response.json() as { error?: string }; setError(payload.error || "No pudimos completar el acceso."); setLoading(false); return; }
    const next = new URLSearchParams(window.location.search).get("next");
    const safeNext = next?.startsWith("/") && !next.startsWith("//") ? next : "/mi-cuenta";
    window.location.assign(audience === "admin" ? "/admin" : safeNext);
  }
  function changeAudience(next: "customer" | "admin") { setAudience(next); setRegistering(false); setError(""); }
  return <div className="access-box"><div className="access-tabs" role="tablist" aria-label="Tipo de acceso"><button type="button" className={audience === "customer" ? "active" : ""} onClick={() => changeAudience("customer")}>Mi cuenta</button><button type="button" className={audience === "admin" ? "active" : ""} onClick={() => changeAudience("admin")}>Administración</button></div><form className="login-form" onSubmit={submit}>{audience === "customer" && registering && <><label>Nombre completo<span><UserRound size={18} /><input type="text" name="name" autoComplete="name" minLength={2} required /></span></label><div className="field-row"><label>WhatsApp<span><input type="tel" name="phone" autoComplete="tel" /></span></label><label>País<span><input type="text" name="country" autoComplete="country-name" /></span></label></div></>}<label>{audience === "admin" ? "Correo administrativo" : "Correo electrónico"}<span><Mail size={18} /><input type="email" name="email" autoComplete="username" required /></span></label><label>Contraseña<span><LockKeyhole size={18} /><input type={visible ? "text" : "password"} name="password" autoComplete={registering ? "new-password" : "current-password"} minLength={registering ? 10 : 8} required /><button type="button" onClick={() => setVisible((value) => !value)} aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}>{visible ? <EyeOff size={18} /> : <Eye size={18} />}</button></span>{registering && <small>Mínimo 10 caracteres, con mayúscula, minúscula y número.</small>}</label>{registering && <div className="access-consents"><label className="consent"><input name="acceptedTerms" type="checkbox" required /><span>Acepto los <a href="/terminos" target="_blank">Términos y condiciones</a>.</span></label><label className="consent"><input name="acceptedPrivacy" type="checkbox" required /><span>He leído el <a href="/privacidad" target="_blank">Aviso de privacidad</a>.</span></label></div>}{error && <p className="form-error" role="alert">{error}</p>}<button className="button button--primary" disabled={loading}>{loading ? "Procesando…" : <>{audience === "admin" ? "Ingresar al panel" : registering ? "Crear mi cuenta" : "Entrar a mi cuenta"}<ArrowRight size={18} /></>}</button>{audience === "customer" && <button className="access-switch" type="button" onClick={() => { setRegistering((value) => !value); setError(""); }}>{registering ? "Ya tengo una cuenta" : "Crear una cuenta nueva"}</button>}</form></div>;
}
