"use client";

import { ArrowRight, CalendarCheck, Check, MessageCircle, Search, Send, ShoppingBag } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import type { BlogPost, Training } from "../../db/repository";
import { whatsappUrl } from "../../lib/whatsapp";
import { useWhatsAppNumber } from "./WhatsAppContext";

export function TrainingCard({ training, index }: { training: Training; index: number }) {
  const whatsapp = useWhatsAppNumber();
  return (
    <article className="training-card" style={{ "--order": index } as React.CSSProperties}>
      <div className="training-card__top"><span>{String(index + 1).padStart(2, "0")}</span><strong>{training.acronym}</strong></div>
      <div className="training-card__logo"><img src={training.logo} alt={`Logo oficial de ${training.name}`} width={520} height={520} loading="lazy" /></div>
      <div className="training-card__body"><h3>{training.name}</h3><p>{training.shortDescription}</p></div>
      <div className="training-card__links"><a href={`/entrenamientos/${training.slug}`}>Ver entrenamiento <ArrowRight size={17} /></a><a className="training-card__buy" href={whatsappUrl(`Hola, quiero adquirir el entrenamiento ${training.name}. ¿Podrían indicarme disponibilidad y forma de pago?`, whatsapp)} target="_blank" rel="noreferrer" aria-label={`Adquirir ${training.name}`}><ShoppingBag size={16} />Adquirir</a></div>
    </article>
  );
}

export function BlogGrid({ posts }: { posts: BlogPost[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todas");
  const categories = ["Todas", ...Array.from(new Set(posts.map((post) => post.category)))];
  const filtered = useMemo(() => posts.filter((post) => {
    const matchesQuery = `${post.title} ${post.excerpt}`.toLowerCase().includes(query.toLowerCase());
    return matchesQuery && (category === "Todas" || post.category === category);
  }), [posts, query, category]);
  return (
    <>
      <div className="blog-tools"><label><Search size={18} /><span className="sr-only">Buscar artículos</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por tema" /></label><div className="category-filter">{categories.map((item) => <button type="button" className={category === item ? "active" : ""} onClick={() => setCategory(item)} key={item}>{item}</button>)}</div></div>
      {filtered.length ? <div className="blog-grid">{filtered.map((post, index) => <BlogCard post={post} index={index} key={post.id} />)}</div> : <div className="empty-state"><Search /><h2>No encontramos artículos</h2><p>Prueba con otro tema o elimina los filtros.</p></div>}
    </>
  );
}

export function BlogCard({ post, index }: { post: BlogPost; index: number }) {
  const date = post.publishedAt ? new Intl.DateTimeFormat("es-AR", { day: "numeric", month: "long", year: "numeric" }).format(new Date(`${post.publishedAt}T12:00:00`)) : "";
  return (
    <article className="blog-card">
      <a className={`blog-card__visual blog-card__visual--${(index % 3) + 1} ${post.image ? "blog-card__visual--image" : ""}`} href={`/blog/${post.slug}`} aria-label={`Leer ${post.title}`}>{post.image ? <img src={post.image} alt="" width={720} height={420} loading="lazy" /> : <span>Lecturas para<br />entrenar la mente.</span>}<ArrowRight /></a>
      <div className="blog-card__content"><div className="blog-card__meta"><span>{post.category}</span><time>{date}</time></div><h3><a href={`/blog/${post.slug}`}>{post.title}</a></h3><p>{post.excerpt}</p><a className="text-link" href={`/blog/${post.slug}`}>Leer artículo <ArrowRight size={16} /></a></div>
    </article>
  );
}

export function ContactForm({ trainings }: { trainings: Training[] }) {
  const whatsapp = useWhatsAppNumber();
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("loading");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/contact", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(Object.fromEntries(form)) });
    const payload = await response.json() as { message?: string; error?: string };
    if (!response.ok) { setState("error"); setMessage(payload.error ?? "No pudimos enviar tu consulta."); return; }
    setState("success"); setMessage(payload.message ?? "Recibimos tu consulta."); event.currentTarget.reset();
  }
  if (state === "success") return <div className="form-success"><span><Check /></span><h2>Gracias por escribirnos</h2><p>{message}</p><a className="button button--primary" href={whatsappUrl("Hola, acabo de enviar una consulta desde la web de Gimnasio del Cerebro.", whatsapp)} target="_blank" rel="noreferrer">Continuar por WhatsApp</a></div>;
  return (
    <form className="contact-form" onSubmit={submit}>
      <div className="field-row"><label>Nombre completo<input name="name" autoComplete="name" minLength={2} required /></label><label>Email<input name="email" type="email" autoComplete="email" required /></label></div>
      <div className="field-row"><label>WhatsApp / teléfono<input name="phone" autoComplete="tel" minLength={7} required /></label><label>País<input name="country" autoComplete="country-name" minLength={2} required /></label></div>
      <label>Entrenamiento de interés<select name="trainingInterest" defaultValue=""><option value="">Quiero orientación</option>{trainings.map((training) => <option value={training.name} key={training.id}>{training.name}</option>)}</select></label>
      <label>¿En qué podemos ayudarte?<textarea name="message" rows={5} minLength={10} maxLength={1200} required /></label>
      <label className="form-honeypot" aria-hidden="true">Sitio web<input name="website" tabIndex={-1} autoComplete="off" /></label>
      <label className="consent"><input type="checkbox" required /><span>Acepto que Gimnasio del Cerebro utilice estos datos para responder mi consulta.</span></label>
      {state === "error" && <p className="form-error" role="alert">{message}</p>}
      <button className="button button--primary" type="submit" disabled={state === "loading"}>{state === "loading" ? "Enviando…" : <>Enviar consulta <Send size={17} /></>}</button>
    </form>
  );
}

export function AppointmentForm({ trainings }: { trainings: Training[] }) {
  const whatsapp = useWhatsAppNumber();
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const today = new Date();
  const minDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setState("loading");
    const response = await fetch("/api/appointments", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))) });
    const payload = await response.json() as { message?: string; error?: string };
    if (!response.ok) { setState("error"); setMessage(payload.error ?? "No pudimos registrar la cita."); return; }
    setState("success"); setMessage(payload.message ?? "Tu solicitud quedó registrada."); event.currentTarget.reset();
  }
  if (state === "success") return <div className="form-success"><span><CalendarCheck /></span><h2>Solicitud recibida</h2><p>{message}</p><a className="button button--primary" href={whatsappUrl("Hola, acabo de solicitar una cita desde la web de Gimnasio del Cerebro.", whatsapp)} target="_blank" rel="noreferrer"><MessageCircle size={17} />Continuar por WhatsApp</a></div>;
  return <form className="contact-form appointment-form" onSubmit={submit}>
    <div className="field-row"><label>Nombre completo<input name="name" autoComplete="name" minLength={2} required /></label><label>Email<input name="email" type="email" autoComplete="email" required /></label></div>
    <div className="field-row"><label>WhatsApp / teléfono<input name="phone" autoComplete="tel" minLength={7} required /></label><label>País<input name="country" autoComplete="country-name" minLength={2} required /></label></div>
    <div className="field-row"><label>Fecha preferida<input name="preferredDate" type="date" min={minDate} required /></label><label>Hora preferida<input name="preferredTime" type="time" required /></label></div>
    <label>Entrenamiento de interés<select name="trainingInterest" defaultValue=""><option value="">Orientación general</option>{trainings.map((training) => <option value={training.name} key={training.id}>{training.name}</option>)}</select></label>
    <label>Cuéntanos brevemente qué necesitas<textarea name="message" rows={4} maxLength={1200} /></label>
    <label className="form-honeypot" aria-hidden="true">Sitio web<input name="website" tabIndex={-1} autoComplete="off" /></label>
    <label className="consent"><input type="checkbox" required /><span>Acepto que Gimnasio del Cerebro utilice estos datos para coordinar la cita.</span></label>
    {state === "error" && <p className="form-error" role="alert">{message}</p>}
    <button className="button button--primary" type="submit" disabled={state === "loading"}>{state === "loading" ? "Registrando…" : <>Solicitar cita <CalendarCheck size={17} /></>}</button>
  </form>;
}
