import { Plus } from "lucide-react";
import { getContacts } from "../../../db/repository";
import { CrmTable } from "../../components/AdminUI";

export default async function CrmPage() { const contacts = await getContacts(); return <><div className="admin-page-heading"><div><span>Relaciones y seguimiento</span><h1>CRM</h1><p>Contactos provenientes del sitio y oportunidades de seguimiento.</p></div><button className="button button--primary" type="button"><Plus size={17} />Añadir contacto</button></div><section className="admin-card admin-card--flush"><CrmTable contacts={contacts} /></section></>; }
