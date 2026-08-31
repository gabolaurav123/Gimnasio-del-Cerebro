import { redirect } from "next/navigation";
import { getCustomerSession } from "../../lib/customer-auth";
import { CustomerShell } from "../components/CustomerShell";

export const dynamic = "force-dynamic";
export default async function CustomerLayout({ children }: { children: React.ReactNode }) {
  const session = await getCustomerSession();
  if (!session) redirect("/login");
  return <CustomerShell user={{ name: session.name, email: session.email }}>{children}</CustomerShell>;
}
