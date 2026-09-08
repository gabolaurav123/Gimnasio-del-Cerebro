import { CalendarCheck, Clock3, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import { getTrainings } from "../../../db/repository";
import { AppointmentForm } from "../../components/PublicUI";
import { SectionEyebrow } from "../../components/SiteChrome";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Agenda tu cita | Gimnasio del Cerebro", description: "Solicita una cita de orientación con Gimnasio del Cerebro." };

export default async function AppointmentPage() {
  const trainings = await getTrainings();
  return <section className="contact-page"><div className="shell contact-page__grid"><div className="contact-page__intro"><SectionEyebrow>Agenda tu cita</SectionEyebrow><h1>Reserva un espacio para conversar con nuestro equipo.</h1><p>Atendemos martes y jueves de 08:00 a 13:00 y de 14:00 a 18:00; los viernes de 08:00 a 13:00.</p><div className="contact-options"><div><CalendarCheck /><span><strong>Turno protegido</strong>Al solicitarlo deja de estar disponible para otras personas.</span></div><div><Clock3 /><span><strong>Confirmación del equipo</strong>Te contactaremos para completar la coordinación.</span></div><div><ShieldCheck /><span><strong>Datos protegidos</strong>Los usamos únicamente para coordinar la conversación.</span></div></div></div><div className="contact-page__form"><div className="form-heading"><span>Coordinemos</span><h2>Elige un horario disponible</h2><p>La agenda muestra en tiempo real únicamente los turnos que se pueden reservar.</p></div><AppointmentForm trainings={trainings} /></div></div></section>;
}
