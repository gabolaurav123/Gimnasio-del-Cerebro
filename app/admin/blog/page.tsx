import { getPosts } from "../../../db/repository";
import { ContentManager } from "../../components/AdminUI";
import { requireAdminRole } from "../../../lib/admin-access";
export default async function AdminBlog() { await requireAdminRole(["SUPERADMIN", "EDITOR"]); const posts = await getPosts(true); return <><div className="admin-page-heading"><div><span>Biblioteca editorial</span><h1>Blog</h1><p>Crea artículos, incorpora imágenes y utiliza el asistente editorial opcional.</p></div></div><section className="admin-card admin-card--flush"><ContentManager kind="posts" posts={posts} /></section></>; }
