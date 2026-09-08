"use client";

import { ArrowRight, CalendarCheck, Check, MessageCircle, Search, Send, ShoppingBag } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import type { BlogPost, Training } from "../../db/repository";
import { whatsappUrl } from "../../lib/whatsapp";
import { useWhatsAppNumber } from "./WhatsAppContext";

const internationalConsultationPaymentUrl = "https://buy.stripe.com/aFa5kD6No1as7OK5l997H01";

export function TrainingCard({ training, index }: { training: Training; index: number }) {
  const image = training.heroImage || training.logo;
  return (
    <article className="training-card" style={{ "--order": index } as React.CSSProperties}>
      <div className="training-card__top"><span>{String(index + 1).padStart(2, "0")}</span><strong>{training.acronym}</strong></div>
      <div className={`training-card__logo ${training.heroImage ? "training-card__logo--cover" : ""}`}><img src={image} alt={training.heroImage ? `Portada de ${training.name}, Gimnasio del Cerebro` : `Logo oficial de ${training.name}`} width={720} height={480} loading="lazy" /></div>
      <div className="training-card__body"><h3>{training.name}</h3><p>{training.shortDescription}</p></div>
      <div className="training-card__links"><a className="training-card__view" href={`/entrenamientos/${training.slug}`}>Ver entrenamiento <ArrowRight size={17} /></a><a className="training-card__buy" href={`/checkout/entrenamiento/${training.slug}`} aria-label={`Adquirir ${training.name}`}><ShoppingBag size={16} />Adquirir</a></div>
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
  const [appointmentType, setAppointmentType] = useState<"CONSULTATION" | "TRAINING">("CONSULTATION");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [slots, setSlots] = useState<{ time: string; available: boolean }[]>([]);
  const [dayOpen, setDayOpen] = useState<boolean | null>(null);
  const [slotNotice, setSlotNotice] = useState("Selecciona un día para consultar los horarios disponibles.");
  const [loadingSlots, setLoadingSlots] = useState(false);
  const today = new Date();
  const minDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  async function loadSlots(date: string, type: "CONSULTATION" | "TRAINING") {
    setSelectedDate(date); setSelectedTime(""); setSlots([]); setDayOpen(null); setState("idle"); setMessage("");
    if (!date) { setLoadingSlots(false); setSlotNotice("Selecciona un día para consultar los horarios disponibles."); return; }
    setLoadingSlots(true); setSlotNotice("Consultando horarios disponibles…");
    try {
      const response = await fetch(`/api/appointments/availability?date=${encodeURIComponent(date)}&type=${type}`, { cache: "no-store" });
      const payload = await response.json() as { slots?: { time: string; available: boolean }[]; open?: boolean; message?: string; error?: string };
      if (!response.ok) throw new Error(payload.error || "No pudimos consultar la agenda.");
      const nextSlots = payload.slots || [];
      setSlots(nextSlots); setDayOpen(payload.open ?? true);
      setSlotNotice(payload.open === false ? (payload.message || "Ese día no hay atención.") : nextSlots.some((slot) => slot.available) ? "Los horarios ocupados o bloqueados no se muestran." : "No quedan horarios disponibles para esta fecha.");
    } catch (error) {
      setDayOpen(null); setSlotNotice(error instanceof Error ? error.message : "No pudimos consultar la agenda.");
    } finally { setLoadingSlots(false); }
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setState("loading");
    const response = await fetch("/api/appointments", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))) });
    const payload = await response.json() as { message?: string; error?: string };
    if (!response.ok) { setState("error"); setMessage(payload.error ?? "No pudimos registrar la cita."); return; }
    setState("success"); setMessage(payload.message ?? "Tu solicitud quedó registrada."); event.currentTarget.reset();
  }
  if (state === "success") return <div className="form-success"><span><CalendarCheck /></span><h2>Solicitud recibida</h2><p>{message}</p><div className="button-row"><a className="button button--primary" href={whatsappUrl("Hola, acabo de solicitar una cita desde la web de Gimnasio del Cerebro.", whatsapp)} target="_blank" rel="noreferrer"><MessageCircle size={17} />Continuar por WhatsApp</a>{appointmentType === "CONSULTATION" && <a className="button button--outline" href={internationalConsultationPaymentUrl} target="_blank" rel="noreferrer"><ShoppingBag size={17} />Pagar consulta internacional</a>}</div><small>El pago en Stripe se realiza fuera de la web y no almacena datos de tarjeta en Gimnasio del Cerebro.</small></div>;
  return <form className="contact-form appointment-form" onSubmit={submit}>
    <div className="appointment-schedule" aria-label="Horarios semanales de atención"><p><strong>Horarios de atención</strong><span>Turnos de una hora. La reserva bloquea el horario automáticamente.</span></p><article><strong>Martes</strong><span>08:00–13:00</span><span>14:00–18:00</span></article><article><strong>Jueves</strong><span>08:00–13:00</span><span>14:00–18:00</span></article><article><strong>Viernes</strong><span>08:00–13:00</span><span>Sin turno por la tarde</span></article></div>
    <div className="field-row"><label>Nombre completo<input name="name" autoComplete="name" minLength={2} required /></label><label>Email<input name="email" type="email" autoComplete="email" required /></label></div>
    <div className="field-row"><label>WhatsApp / teléfono<input name="phone" autoComplete="tel" minLength={7} required /></label><label>País<input name="country" autoComplete="country-name" minLength={2} required /></label></div>
    <div className="field-row"><label>Tipo de cita<select name="appointmentType" value={appointmentType} onChange={(event) => { const type = event.target.value as "CONSULTATION" | "TRAINING"; setAppointmentType(type); if (selectedDate) void loadSlots(selectedDate, type); }}><option value="CONSULTATION">Sesión personalizada de consulta</option><option value="TRAINING">Cita de entrenamiento</option></select></label><label>Fecha disponible<input name="preferredDate" type="date" min={minDate} value={selectedDate} onChange={(event) => void loadSlots(event.target.value, appointmentType)} required /></label></div>
    <label>Horario disponible<select name="preferredTime" value={selectedTime} onChange={(event) => setSelectedTime(event.target.value)} required disabled={!selectedDate || loadingSlots || dayOpen === false || !slots.some((slot) => slot.available)}><option value="">{loadingSlots ? "Consultando horarios…" : dayOpen === false ? "Día sin atención" : "Selecciona un horario"}</option>{slots.filter((slot) => slot.available).map((slot) => <option value={slot.time} key={slot.time}>{slot.time}</option>)}</select><small className={dayOpen === false ? "slot-notice slot-notice--closed" : "slot-notice"}>{slotNotice}</small></label>
    <label>Entrenamiento de interés<select name="trainingInterest" defaultValue=""><option value="">Sesión personalizada / aún no lo sé</option>{trainings.map((training) => <option value={training.name} key={training.id}>{training.name}</option>)}</select></label>
    <label>Cuéntanos brevemente qué necesitas<textarea name="message" rows={4} maxLength={1200} /></label>
    <label className="form-honeypot" aria-hidden="true">Sitio web<input name="website" tabIndex={-1} autoComplete="off" /></label>
    <label className="consent"><input name="acceptedDisclaimer" type="checkbox" required /><span>Comprendo que esta cita es educativa y de orientación. No constituye psicoterapia, diagnóstico, tratamiento médico ni atención de emergencia, y no sustituye la consulta con profesionales sanitarios habilitados.</span></label>
    <label className="consent"><input type="checkbox" required /><span>Acepto el tratamiento de mis datos conforme al <a href="/privacidad" target="_blank">aviso de privacidad</a> para coordinar la cita.</span></label>
    {state === "error" && <p className="form-error" role="alert">{message}</p>}
    <button className="button button--primary" type="submit" disabled={state === "loading"}>{state === "loading" ? "Registrando…" : <>Solicitar cita <CalendarCheck size={17} /></>}</button>
  </form>;
}
