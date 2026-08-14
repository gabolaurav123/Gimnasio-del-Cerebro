import { FileText, ImageIcon, MessageSquareQuote, Settings2, ShieldCheck, UsersRound } from "lucide-react";
import { notFound } from "next/navigation";
import { getSettings } from "../../../db/repository";
import { MediaUpload } from "../../components/AdminUI";
import { SettingsEditor } from "../../components/SettingsEditor";

const sections = {
  testimonios: { eyebrow: "Experiencias publicadas", title: "Testimonios", description: "Administra testimonios escritos y enlaces de video sin inventar valoraciones.", icon: MessageSquareQuote },
  contenido: { eyebrow: "CMS controlado", title: "Contenido web", description: "Edita los mensajes estratégicos del sitio sin alterar su estructura visual.", icon: FileText },
  media: { eyebrow: "Recursos seguros", title: "Biblioteca multimedia", description: "Centraliza imágenes, logos y thumbnails validados.", icon: ImageIcon },
  usuarios: { eyebrow: "Acceso y permisos", title: "Usuarios", description: "Roles disponibles: Superadmin, Editor y Comercial.", icon: UsersRound },
  configuracion: { eyebrow: "Preferencias generales", title: "Configuración", description: "Datos de contacto, redes y elementos esenciales de la marca.", icon: Settings2 },
} as const;

export default async function AdminSection({ params }: { params: Promise<{ section: string }> }) { const { section } = await params; const item = sections[section as keyof typeof sections]; if (!item) notFound(); const settings = await getSettings(); return <><div className="admin-page-heading"><div><span>{item.eyebrow}</span><h1>{item.title}</h1><p>{item.description}</p></div></div>{section === "contenido" && <section className="admin-card settings-card"><div className="admin-card__heading"><div><h2>Home</h2><p>Textos principales y llamado final.</p></div></div><SettingsEditor settings={settings} fields={["heroEyebrow", "heroTitle", "heroDescription", "ctaTitle", "ctaDescription"]} /></section>}{section === "configuracion" && <section className="admin-card settings-card"><div className="admin-card__heading"><div><h2>General y redes</h2><p>Solo se muestran redes que tengan una URL configurada.</p></div></div><SettingsEditor settings={settings} fields={["siteName", "contactEmail", "whatsapp", "instagram", "facebook", "youtube"]} /></section>}{section === "media" && <section className="admin-card"><MediaUpload /></section>}{section === "testimonios" && <section className="admin-card"><div className="admin-empty"><MessageSquareQuote /><h3>No hay testimonios publicados.</h3><p>El módulo conserva vacía esta colección hasta incorporar testimonios reales.</p></div></section>}{section === "usuarios" && <section className="admin-card"><div className="role-grid"><div><ShieldCheck /><strong>SUPERADMIN</strong><p>Acceso completo a la plataforma.</p></div><div><FileText /><strong>EDITOR</strong><p>Blog, entrenamientos y contenido.</p></div><div><UsersRound /><strong>COMERCIAL</strong><p>Contactos y seguimiento de CRM.</p></div></div></section>}</>; }
