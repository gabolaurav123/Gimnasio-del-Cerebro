import { getProducts } from "../../../db/repository";
import { requireAdminRole } from "../../../lib/admin-access";
import { BusinessManager } from "../../components/BusinessManager";
export default async function ProductsAdminPage() { await requireAdminRole(["SUPERADMIN", "EDITOR"]); const items = await getProducts(true); return <><div className="admin-page-heading"><div><span>Catálogo comercial</span><h1>Productos</h1><p>Crea, edita y publica productos. Los descuentos publicados alimentan la campana de novedades.</p></div></div><section className="admin-card admin-card--flush"><BusinessManager kind="products" items={items} /></section></>; }
