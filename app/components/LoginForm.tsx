"use client";

import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail, UserRound } from "lucide-react";
import { FormEvent, useState } from "react";

export function LoginForm() {
  const [registering, setRegistering] = useState(false);
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setError("");
    const form = new FormData(event.currentTarget);
    const data: Record<string, FormDataEntryValue | boolean> = Object.fromEntries(form);
    if (registering) { data.acceptedTerms = form.get("acceptedTerms") === "on"; data.acceptedPrivacy = form.get("acceptedPrivacy") === "on"; }
    const endpoint = registering ? "/api/customer/auth/register" : "/api/auth/access";
    try {
      const response = await fetch(endpoint, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(data) });
      if (!response.ok) { const payload = await response.json() as { error?: string }; setError(payload.error || "No pudimos completar el acceso."); setLoading(false); return; }
      const next = new URLSearchParams(window.location.search).get("next");
      const payload = await response.json() as { destination?: string };
      const safeNext = next?.startsWith("/") && !next.startsWith("//") ? next : "/mi-cuenta";
      window.location.assign(payload.destination === "/admin" ? "/admin" : safeNext);
    } catch {
      setError("No pudimos conectar con el servidor. Comprueba tu conexión e inténtalo nuevamente.");
      setLoading(false);
    }
  }
  return <div className="access-box"><div className="access-heading"><UserRound size={19} /><div><strong>Mi cuenta</strong><span>Un único acceso seguro para cada usuario.</span></div></div><form className="login-form" onSubmit={submit}>{registering && <><label>Nombre completo<span><UserRound size={18} /><input type="text" name="name" autoComplete="name" minLength={2} required /></span></label><div className="field-row"><label>WhatsApp<span><input type="tel" name="phone" autoComplete="tel" /></span></label><label>País<span><input type="text" name="country" autoComplete="country-name" /></span></label></div></>}<label>Correo electrónico<span><Mail size={18} /><input type="email" name="email" autoComplete="username" required /></span></label><label>Contraseña<span><LockKeyhole size={18} /><input type={visible ? "text" : "password"} name="password" autoComplete={registering ? "new-password" : "current-password"} minLength={registering ? 10 : 8} required /><button type="button" onClick={() => setVisible((value) => !value)} aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}>{visible ? <EyeOff size={18} /> : <Eye size={18} />}</button></span>{registering && <small>Mínimo 10 caracteres, con mayúscula, minúscula y número.</small>}</label>{registering && <div className="access-consents"><label className="consent"><input name="acceptedTerms" type="checkbox" required /><span>Acepto los <a href="/terminos" target="_blank">Términos y condiciones</a>.</span></label><label className="consent"><input name="acceptedPrivacy" type="checkbox" required /><span>He leído el <a href="/privacidad" target="_blank">Aviso de privacidad</a>.</span></label></div>}{error && <p className="form-error" role="alert">{error}</p>}<button className="button button--primary" disabled={loading}>{loading ? "Procesando…" : <>{registering ? "Crear mi cuenta" : "Entrar a mi cuenta"}<ArrowRight size={18} /></>}</button><button className="access-switch" type="button" onClick={() => { setRegistering((value) => !value); setError(""); }}>{registering ? "Ya tengo una cuenta" : "Crear una cuenta nueva"}</button></form></div>;
}
