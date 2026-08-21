import { FileText, ImageIcon, MessageSquareQuote, Settings2, ShieldCheck, UsersRound } from "lucide-react";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getAdminUsers, getSettings, getTestimonials } from "../../../db/repository";
import { requireAdminRole } from "../../../lib/admin-access";
import { MediaUpload, UserManager } from "../../components/AdminUI";
import { SettingsEditor } from "../../components/SettingsEditor";

const sections = {
  testimonios: { eyebrow: "Experiencias publicadas", title: "Testimonios", description: "Administra testimonios escritos y enlaces de video sin inventar valoraciones.", icon: MessageSquareQuote },
  contenido: { eyebrow: "CMS controlado", title: "Contenido web", description: "Edita los mensajes estratégicos del sitio sin alterar su estructura visual.", icon: FileText },
  media: { eyebrow: "Recursos seguros", title: "Biblioteca multimedia", description: "Centraliza imágenes, logos y thumbnails validados.", icon: ImageIcon },
  usuarios: { eyebrow: "Acceso y permisos", title: "Usuarios", description: "Roles disponibles: Superadmin, Editor y Comercial.", icon: UsersRound },
  configuracion: { eyebrow: "Preferencias generales", title: "Configuración", description: "Datos de contacto, redes y elementos esenciales de la marca.", icon: Settings2 },
} as const;

export default async function AdminSection({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  const item = sections[section as keyof typeof sections];
  if (!item) notFound();
  await requireAdminRole(section === "usuarios" || section === "configuracion" ? ["SUPERADMIN"] : ["SUPERADMIN", "EDITOR"]);
  const settings = section === "contenido" || section === "configuracion" ? await getSettings() : {};
  const users = section === "usuarios" ? await getAdminUsers() : [];
  const testimonials = section === "testimonios" ? await getTestimonials(true) : [];
  const safeUsers = users.map((user) => ({ id: user.id, email: user.email, role: user.role, active: user.active, createdAt: user.createdAt }));
  return <><div className="admin-page-heading"><div><span>{item.eyebrow}</span><h1>{item.title}</h1><p>{item.description}</p></div></div>{section === "contenido" && <section className="admin-card settings-card"><div className="admin-card__heading"><div><h2>Home</h2><p>Textos principales y llamado final.</p></div></div><SettingsEditor settings={settings} fields={["heroEyebrow", "heroTitle", "heroDescription", "ctaTitle", "ctaDescription"]} /></section>}{section === "configuracion" && <section className="admin-card settings-card"><div className="admin-card__heading"><div><h2>General, WhatsApp y redes</h2><p>El número se aplicará a todos los botones de WhatsApp del sitio.</p></div></div><SettingsEditor settings={settings} fields={["siteName", "contactEmail", "whatsapp", "instagram", "facebook", "youtube"]} /></section>}{section === "media" && <section className="admin-card"><MediaUpload /></section>}{section === "testimonios" && <section className="admin-card"><div className="testimonial-admin-grid">{testimonials.map((testimonial) => <a href={testimonial.videoUrl} target="_blank" rel="noreferrer" key={testimonial.id}><Image src={testimonial.thumbnail} alt="" width={120} height={190} /><span><strong>{testimonial.name}</strong><small>{testimonial.program ?? "Historia real"}</small></span></a>)}</div></section>}{section === "usuarios" && <><section className="role-grid role-grid--standalone"><div><ShieldCheck /><strong>SUPERADMIN</strong><p>Acceso completo, configuración y usuarios.</p></div><div><FileText /><strong>EDITOR</strong><p>Blog, entrenamientos y contenido.</p></div><div><UsersRound /><strong>COMERCIAL</strong><p>Contactos y seguimiento de CRM.</p></div></section><section className="admin-card"><UserManager users={safeUsers} /></section></>}</>;
}
