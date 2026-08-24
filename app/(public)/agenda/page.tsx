import { CalendarCheck, Clock3, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import { getTrainings } from "../../../db/repository";
import { AppointmentForm } from "../../components/PublicUI";
import { SectionEyebrow } from "../../components/SiteChrome";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Agenda tu cita | Gimnasio del Cerebro", description: "Solicita una cita de orientación con Gimnasio del Cerebro." };

export default async function AppointmentPage() {
  const trainings = await getTrainings();
  return <section className="contact-page"><div className="shell contact-page__grid"><div className="contact-page__intro"><SectionEyebrow>Agenda tu cita</SectionEyebrow><h1>Reserva un espacio para conversar con nuestro equipo.</h1><p>Elige una fecha y hora preferidas. La solicitud llegará al panel administrativo y nuestro equipo te contactará para confirmarla.</p><div className="contact-options"><div><CalendarCheck /><span><strong>Solicitud registrada</strong>La cita aparecerá en nuestra bandeja de pendientes.</span></div><div><Clock3 /><span><strong>Horario por confirmar</strong>Te contactaremos antes de dejarla confirmada.</span></div><div><ShieldCheck /><span><strong>Datos protegidos</strong>Los usamos únicamente para coordinar la conversación.</span></div></div></div><div className="contact-page__form"><div className="form-heading"><span>Coordinemos</span><h2>Elige tu horario preferido</h2><p>La fecha solicitada queda pendiente hasta que nuestro equipo la confirme.</p></div><AppointmentForm trainings={trainings} /></div></div></section>;
}
