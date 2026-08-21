import { getContacts } from "../../../db/repository";
import { requireAdminRole } from "../../../lib/admin-access";
import { CrmTable } from "../../components/AdminUI";

export default async function CrmPage() { await requireAdminRole(["SUPERADMIN", "COMERCIAL"]); const contacts = await getContacts(); return <><div className="admin-page-heading"><div><span>Relaciones y seguimiento</span><h1>CRM</h1><p>Las consultas enviadas desde la web aparecen aquí automáticamente.</p></div></div><section className="admin-card admin-card--flush"><CrmTable contacts={contacts} /></section></>; }
