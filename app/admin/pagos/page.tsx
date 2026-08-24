import { getPaymentSummary, getPayments } from "../../../db/repository";
import { requireAdminRole } from "../../../lib/admin-access";
import { PaymentManager } from "../../components/PaymentManager";

export default async function PaymentsAdminPage() {
  await requireAdminRole(["SUPERADMIN", "COMERCIAL"]);
  const [payments, summary] = await Promise.all([getPayments(), getPaymentSummary()]);
  return <><div className="admin-page-heading"><div><span>Control financiero</span><h1>Pagos</h1><p>Revisa cobros, confirma referencias y conserva el historial de cada operación.</p></div></div><PaymentManager payments={payments} summary={summary} /></>;
}
