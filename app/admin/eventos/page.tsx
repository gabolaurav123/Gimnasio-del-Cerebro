import { getEvents } from "../../../db/repository";
import { requireAdminRole } from "../../../lib/admin-access";
import { BusinessManager } from "../../components/BusinessManager";
export default async function EventsAdminPage() { await requireAdminRole(["SUPERADMIN", "EDITOR"]); const items = await getEvents(true); return <><div className="admin-page-heading"><div><span>Agenda pública</span><h1>Eventos</h1><p>Publica talleres y encuentros. Cada evento publicado aparecerá también en la campana de la web.</p></div></div><section className="admin-card admin-card--flush"><BusinessManager kind="events" items={items} /></section></>; }
