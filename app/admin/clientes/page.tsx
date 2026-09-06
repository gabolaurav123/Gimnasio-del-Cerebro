import { getAllCustomerEntitlementAssignments, getCustomers } from "../../../db/customer-repository";
import { getProducts, getTrainings } from "../../../db/repository";
import { requireAdminRole } from "../../../lib/admin-access";
import { CustomerManager } from "../../components/CustomerManager";

export default async function CustomersPage() {
  await requireAdminRole(["SUPERADMIN", "COMERCIAL"]);
  const [customerRows, trainings, products, assignments] = await Promise.all([getCustomers(), getTrainings(true), getProducts(true), getAllCustomerEntitlementAssignments()]);
  const customers = customerRows.map((customer) => ({ id: customer.id, name: customer.name, email: customer.email, phone: customer.phone, country: customer.country, active: customer.active, accessCount: customer.accessCount, createdAt: customer.createdAt }));
  const catalog = [...trainings.map((item) => ({ itemType: "TRAINING" as const, itemId: item.id, name: item.name, category: item.acronym })), ...products.map((item) => ({ itemType: "PRODUCT" as const, itemId: item.id, name: item.name, category: "PRODUCTO" }))];
  return <><div className="admin-page-heading"><div><span>Cuentas del portal</span><h1>Usuarios clientes</h1><p>Consulta cuentas, asigna o regala contenidos y retira accesos cuando sea necesario.</p></div></div><section className="admin-card admin-card--flush"><CustomerManager customers={customers} catalog={catalog} initialAssignments={assignments} /></section></>;
}
