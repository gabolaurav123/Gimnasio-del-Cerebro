import { redirect } from "next/navigation";
import { getAdminSession } from "../../lib/auth";
import { AdminShell } from "../components/AdminShell";

export const dynamic = "force-dynamic";
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();
  if (!session) redirect("/login");
  return <AdminShell user={{ email: session.email, role: session.role }}>{children}</AdminShell>;
}
