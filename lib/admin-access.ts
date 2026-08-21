import { redirect } from "next/navigation";
import type { AdminRole } from "../db/repository";
import { getAdminSession } from "./auth";

export async function requireAdminRole(roles: AdminRole[]) {
  const session = await getAdminSession();
  if (!session) redirect("/login");
  if (!roles.includes(session.role)) redirect("/admin");
  return session;
}
