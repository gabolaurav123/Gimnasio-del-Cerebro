import { ArrowRight, BookOpen, BrainCircuit, CalendarDays, ContactRound, CreditCard, ShoppingBag, UserRoundPlus } from "lucide-react";
import { redirect } from "next/navigation";
import { getDashboardData, getPosts, getTrainings } from "../../db/repository";
import { getAdminSession } from "../../lib/auth";
import { StatusBadge } from "../components/AdminUI";

export default async function AdminDashboard() {
  const session = await getAdminSession();
  if (!session) redirect("/login");
  if (session.role === "EDITOR") {
    const [trainings, posts] = await Promise.all([getTrainings(), getPosts()]);
    const cards = [
      { label: "Entrenamientos publicados", value: trainings.length, icon: BrainCircuit, tone: "cyan" },
      { label: "Artículos publicados", value: posts.length, icon: BookOpen, tone: "violet" },
    ];
    return <><div className="admin-page-heading"><div><span>Área editorial</span><h1>Dashboard</h1><p>Gestiona entrenamientos, artículos y contenido público.</p></div></div><div className="dashboard-cards">{cards.map(({ label, value, icon: Icon, tone }) => <div className={`metric-card metric-card--${tone}`} key={label}><span><Icon /></span><div><strong>{value}</strong><p>{label}</p></div></div>)}</div><section className="admin-card"><div className="admin-card__heading"><div><h2>Acciones rápidas</h2><p>Atajos de contenido.</p></div></div><div className="quick-actions"><a href="/admin/blog"><BookOpen /><span><strong>Crear artículo</strong>Publica una nueva lectura.</span><ArrowRight /></a><a href="/admin/entrenamientos"><BrainCircuit /><span><strong>Gestionar entrenamientos</strong>Edita el catálogo actual.</span><ArrowRight /></a><a href="/admin/eventos"><CalendarDays /><span><strong>Publicar evento</strong>Alimenta también la campana.</span><ArrowRight /></a><a href="/admin/productos"><ShoppingBag /><span><strong>Gestionar productos</strong>Edita el catálogo comercial.</span><ArrowRight /></a></div></section></>;
  }
  const data = await getDashboardData();
  const cards = [
    { label: "Leads nuevos", value: data.counts.newContacts, icon: UserRoundPlus, tone: "blue" },
    { label: "Citas pendientes", value: data.counts.appointments, icon: CalendarDays, tone: "cyan" },
    { label: "Total contactos", value: data.counts.contacts, icon: ContactRound, tone: "navy" },
    ...(session.role === "SUPERADMIN" ? [
      { label: "Productos", value: data.counts.products, icon: ShoppingBag, tone: "violet" },
    ] : []),
    { label: "Pagos pendientes", value: data.counts.pendingPayments, icon: CreditCard, tone: "cyan" },
  ];
  return <><div className="admin-page-heading"><div><span>Vista comercial</span><h1>Dashboard</h1><p>Consultas, citas, pagos y oportunidades de seguimiento.</p></div></div><div className="dashboard-cards">{cards.map(({ label, value, icon: Icon, tone }) => <div className={`metric-card metric-card--${tone}`} key={label}><span><Icon /></span><div><strong>{value}</strong><p>{label}</p></div></div>)}</div><div className="dashboard-grid"><section className="admin-card admin-card--wide"><div className="admin-card__heading"><div><h2>Leads recientes</h2><p>Consultas recibidas desde el sitio.</p></div><a href="/admin/crm">Ver contactos y citas <ArrowRight size={16} /></a></div>{data.recent.length ? <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Persona</th><th>Interés</th><th>Estado</th><th>Fecha</th></tr></thead><tbody>{data.recent.map((contact) => <tr key={contact.id}><td><strong>{contact.name}</strong><span>{contact.email}</span></td><td>{contact.trainingInterest || "Por definir"}</td><td><StatusBadge status={contact.status} /></td><td>{new Intl.DateTimeFormat("es-AR", { day: "2-digit", month: "short" }).format(new Date(contact.createdAt))}</td></tr>)}</tbody></table></div> : <div className="admin-empty"><ContactRound /><h3>Todavía no hay contactos.</h3><p>Los nuevos formularios aparecerán aquí automáticamente.</p></div>}</section><aside className="admin-card"><div className="admin-card__heading"><div><h2>Acciones rápidas</h2><p>Atajos frecuentes.</p></div></div><div className="quick-actions"><a href="/admin/crm"><ContactRound /><span><strong>Revisar contactos y citas</strong>Organiza el seguimiento.</span><ArrowRight /></a><a href="/admin/pagos"><CreditCard /><span><strong>Verificar pagos</strong>Revisa cobros pendientes y confirmados.</span><ArrowRight /></a>{session.role === "SUPERADMIN" && <><a href="/admin/eventos"><CalendarDays /><span><strong>Publicar evento</strong>Actualiza la campana.</span><ArrowRight /></a><a href="/admin/productos"><ShoppingBag /><span><strong>Gestionar productos</strong>Edita el catálogo comercial.</span><ArrowRight /></a></>}</div></aside></div></>;
}
