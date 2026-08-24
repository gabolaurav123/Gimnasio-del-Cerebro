import { getAssociates } from "../../../db/repository";
import { requireAdminRole } from "../../../lib/admin-access";
import { BusinessManager } from "../../components/BusinessManager";
export default async function AssociatesAdminPage() { await requireAdminRole(["SUPERADMIN", "EDITOR"]); const items = await getAssociates(true); return <><div className="admin-page-heading"><div><span>Red institucional</span><h1>Asociados</h1><p>Administra las organizaciones asociadas y sus enlaces oficiales.</p></div></div><section className="admin-card admin-card--flush"><BusinessManager kind="associates" items={items} /></section></>; }
