"use client";

import { ArrowUpRight, Bot, FileText, Send } from "lucide-react";
import { FormEvent, useState } from "react";
import type { AssistantProfile, CustomerEntitlement } from "../../db/customer-repository";

type Message = { role: "user" | "assistant"; content: string };
export function CustomerDashboard({ entitlements, assistants }: { entitlements: CustomerEntitlement[]; assistants: AssistantProfile[] }) {
  const [active, setActive] = useState(assistants[0]?.id || "");
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const assistant = assistants.find((item) => item.id === active);
  async function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!assistant || loading) return;
    const form = new FormData(event.currentTarget); const message = String(form.get("message") || "").trim(); if (!message) return;
    setMessages((current) => ({ ...current, [active]: [...(current[active] || []), { role: "user", content: message }] }));
    event.currentTarget.reset(); setLoading(true); setError("");
    const response = await fetch("/api/customer/assistant", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ assistantId: active, message }) });
    const payload = await response.json() as { reply?: string; error?: string };
    if (!response.ok || !payload.reply) setError(payload.error || "El asistente no pudo responder.");
    else setMessages((current) => ({ ...current, [active]: [...(current[active] || []), { role: "assistant", content: payload.reply! }] }));
    setLoading(false);
  }
  return <main className="customer-content"><section id="inicio" className="customer-welcome"><span>Tu aprendizaje, organizado</span><h1>Bienvenido a tu espacio.</h1><p>Los programas verificados aparecen aquí junto a sus materiales y asistentes personalizados.</p></section><section id="programas"><div className="customer-section-heading"><div><span>Acceso personal</span><h2>Mis programas</h2></div></div>{entitlements.length ? <div className="customer-program-grid">{entitlements.map((item) => <article key={item.id}>{item.itemImage && <img src={item.itemImage} alt="" />}<div><span>{item.itemType === "PRODUCT" ? "Producto" : "Entrenamiento"}</span><h3>{item.itemName}</h3><p>{item.dashboardContent || "Tu acceso está activo. Los próximos recursos que publique el equipo aparecerán aquí."}</p>{item.resourceUrl && <a href={item.resourceUrl} target="_blank" rel="noreferrer"><FileText size={16} />Abrir recursos <ArrowUpRight size={16} /></a>}</div></article>)}</div> : <div className="customer-empty"><PackageEmpty /><h3>Aún no tienes programas habilitados.</h3><p>Cuando un pago sea verificado, tu contenido aparecerá automáticamente aquí.</p><a className="button button--primary" href="/productos">Conocer productos</a></div>}</section><section id="asistentes"><div className="customer-section-heading"><div><span>IA según tu programa</span><h2>Asistentes personalizados</h2></div><p>La IA complementa el material educativo; no sustituye asesoramiento médico, psicológico, legal o financiero.</p></div>{assistants.length ? <div className="assistant-workspace"><aside>{assistants.map((item) => <button className={active === item.id ? "active" : ""} key={item.id} type="button" onClick={() => { setActive(item.id); setError(""); }}><Bot size={18} /><span><strong>{item.name}</strong>{item.itemName}</span></button>)}</aside><div className="assistant-chat"><header><Bot /><div><strong>{assistant?.name}</strong><span>{assistant?.itemName}</span></div></header><div className="assistant-messages">{!(messages[active]?.length) && <div className="assistant-intro"><Bot /><p>Hola. Puedo ayudarte a comprender y aplicar el contenido de <strong>{assistant?.itemName}</strong>. ¿Por dónde quieres comenzar?</p></div>}{(messages[active] || []).map((message, index) => <div className={`assistant-message assistant-message--${message.role}`} key={`${message.role}-${index}`}>{message.content}</div>)}{loading && <div className="assistant-message assistant-message--assistant">Pensando…</div>}</div><form onSubmit={send}><label className="sr-only" htmlFor="assistant-message">Escribe tu pregunta</label><textarea id="assistant-message" name="message" rows={2} maxLength={2000} placeholder="Pregunta sobre tu programa…" required /><button type="submit" disabled={loading} aria-label="Enviar"><Send /></button></form>{error && <p className="form-error">{error}</p>}</div></div> : <div className="customer-empty"><Bot /><h3>No hay asistentes habilitados todavía.</h3><p>El administrador puede configurar uno específico para cada programa.</p></div>}</section></main>;
}

function PackageEmpty() { return <FileText />; }
