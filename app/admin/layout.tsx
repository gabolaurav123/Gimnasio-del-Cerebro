import { redirect } from "next/navigation";
import { isAdmin } from "../../lib/auth";
import { AdminShell } from "../components/AdminShell";

export const dynamic = "force-dynamic";
export default async function AdminLayout({ children }: { children: React.ReactNode }) { if (!(await isAdmin())) redirect("/login"); return <AdminShell>{children}</AdminShell>; }
