import { getCustomers } from "../../../db/customer-repository";
import { requireAdminRole } from "../../../lib/admin-access";
import { CustomerManager } from "../../components/CustomerManager";

export default async function CustomersPage() {
  await requireAdminRole(["SUPERADMIN", "COMERCIAL"]);
  const customers = (await getCustomers()).map((customer) => ({ id: customer.id, name: customer.name, email: customer.email, phone: customer.phone, country: customer.country, active: customer.active, accessCount: customer.accessCount, createdAt: customer.createdAt }));
  return <><div className="admin-page-heading"><div><span>Cuentas del portal</span><h1>Usuarios clientes</h1><p>Consulta las cuentas registradas, sus accesos activos y suspende una cuenta si detectas un problema.</p></div></div><section className="admin-card admin-card--flush"><CustomerManager customers={customers} /></section></>;
}
