import { Clock3, MessageCircle, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import { getSettings, getTrainings } from "../../../db/repository";
import { ContactForm } from "../../components/PublicUI";
import { SectionEyebrow } from "../../components/SiteChrome";
import { formatWhatsAppNumber, whatsappUrl } from "../../../lib/whatsapp";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Contacto | Gimnasio del Cerebro", description: "Consulta sobre los entrenamientos de Gimnasio del Cerebro." };

export default async function ContactPage() {
  const [trainings, settings] = await Promise.all([getTrainings(), getSettings()]);
  return <section className="contact-page"><div className="shell contact-page__grid"><div className="contact-page__intro"><SectionEyebrow>Conversemos</SectionEyebrow><h1>Tu consulta puede ser el inicio de una nueva comprensión.</h1><p>Cuéntanos en qué momento te encuentras. Nuestro equipo podrá orientarte sobre la información disponible de cada entrenamiento.</p><div className="contact-options"><a href={whatsappUrl("Hola, visité la web de Gimnasio del Cerebro y quisiera recibir más información.", settings.whatsapp)} target="_blank" rel="noreferrer"><MessageCircle /><span><strong>WhatsApp directo</strong>{formatWhatsAppNumber(settings.whatsapp)}</span></a><div><Clock3 /><span><strong>Respuesta personal</strong>Tu consulta queda registrada para seguimiento.</span></div><div><ShieldCheck /><span><strong>Datos protegidos</strong>Usamos la información solo para responderte.</span></div></div></div><div className="contact-page__form"><div className="form-heading"><span>Escríbenos</span><h2>Queremos conocerte</h2><p>Todos los campos marcados son necesarios para dar seguimiento.</p></div><ContactForm trainings={trainings} /></div></div></section>;
}
