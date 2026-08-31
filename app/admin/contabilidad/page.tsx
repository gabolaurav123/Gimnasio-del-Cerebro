import { getAccountingEntries, getAccountingSummary } from "../../../db/accounting";
import { getEvents, getProducts, getTrainings } from "../../../db/repository";
import { requireAdminRole } from "../../../lib/admin-access";
import { AccountingManager } from "../../components/AccountingManager";

export default async function AccountingPage() {
  await requireAdminRole(["SUPERADMIN"]);
  const [entries, summary, products, trainings, events] = await Promise.all([getAccountingEntries(), getAccountingSummary(), getProducts(true), getTrainings(true), getEvents(true)]);
  const items = [...products.map((item) => ({ id: item.id, name: item.name, type: "PRODUCT" as const })), ...trainings.map((item) => ({ id: item.id, name: item.name, type: "TRAINING" as const })), ...events.map((item) => ({ id: item.id, name: item.title, type: "EVENT" as const }))];
  return <><div className="admin-page-heading"><div><span>Control financiero operativo</span><h1>Contabilidad</h1><p>Conciliación de ingresos, comisiones, impuestos, reembolsos y gastos, separados por producto y moneda.</p></div></div><AccountingManager entries={entries} summary={summary} items={items} /></>;
}
