import { getCustomerAssistants, getCustomerEntitlements } from "../../db/customer-repository";
import { getCustomerSession } from "../../lib/customer-auth";
import { CustomerDashboard } from "../components/CustomerDashboard";

export const dynamic = "force-dynamic";
export default async function CustomerPage() {
  const session = await getCustomerSession();
  if (!session) return null;
  const [entitlements, assistants] = await Promise.all([getCustomerEntitlements(session.customerId), getCustomerAssistants(session.customerId)]);
  return <CustomerDashboard entitlements={entitlements} assistants={assistants} />;
}
