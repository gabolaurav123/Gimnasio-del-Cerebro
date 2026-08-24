import { ArrowUpRight, CalendarDays, MapPin } from "lucide-react";
import type { Metadata } from "next";
import { getEvents, getSettings } from "../../../db/repository";
import { whatsappUrl } from "../../../lib/whatsapp";
import { SectionEyebrow } from "../../components/SiteChrome";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Eventos | Gimnasio del Cerebro", description: "Próximos eventos de Gimnasio del Cerebro." };

export default async function EventsPage() {
  const [events, settings] = await Promise.all([getEvents(), getSettings()]);
  return <><section className="page-hero"><div className="shell"><SectionEyebrow>Agenda de eventos</SectionEyebrow><h1>Encuentros para aprender,<br /><em>practicar y conectar.</em></h1><p>Consulta los próximos eventos, talleres y espacios especiales organizados por Gimnasio del Cerebro.</p></div></section><section className="public-catalog"><div className="shell">{events.length ? <div className="event-list">{events.map((item) => { const date = new Date(item.startsAt); const url = item.registrationUrl || whatsappUrl(`Hola, quiero registrarme al evento ${item.title}.`, settings.whatsapp); return <article className="event-card" key={item.id}><div className="event-card__date"><strong>{new Intl.DateTimeFormat("es-BO", { day: "2-digit" }).format(date)}</strong><span>{new Intl.DateTimeFormat("es-BO", { month: "short", year: "numeric" }).format(date)}</span></div><div className="event-card__content"><span><CalendarDays size={16} />{new Intl.DateTimeFormat("es-BO", { dateStyle: "long", timeStyle: "short" }).format(date)}</span><h2>{item.title}</h2><p>{item.description}</p><small><MapPin size={16} />{item.location}</small></div><a className="button button--outline" href={url} target="_blank" rel="noreferrer">Registrarme <ArrowUpRight size={17} /></a></article>; })}</div> : <div className="public-empty"><CalendarDays /><h2>No hay eventos publicados por ahora.</h2><p>La campana de la cabecera te mostrará los próximos eventos y novedades cuando estén disponibles.</p></div>}</div></section></>;
}
