"use client";

import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import { FormEvent, useState } from "react";

export function LoginForm() {
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setError("");
    const data = Object.fromEntries(new FormData(event.currentTarget));
    const response = await fetch("/api/auth/login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(data) });
    if (!response.ok) { const payload = await response.json() as { error?: string }; setError(payload.error ?? "No pudimos iniciar sesión."); setLoading(false); return; }
    window.location.assign("/admin");
  }
  return <form className="login-form" onSubmit={submit}><label>Correo administrativo<span><Mail size={18} /><input type="email" name="email" autoComplete="username" required /></span></label><label>Contraseña<span><LockKeyhole size={18} /><input type={visible ? "text" : "password"} name="password" autoComplete="current-password" required /><button type="button" onClick={() => setVisible((value) => !value)} aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}>{visible ? <EyeOff size={18} /> : <Eye size={18} />}</button></span></label>{error && <p className="form-error" role="alert">{error}</p>}<button className="button button--primary" disabled={loading}>{loading ? "Verificando…" : <>Ingresar al panel <ArrowRight size={18} /></>}</button></form>;
}
