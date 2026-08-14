import { getPosts } from "../../../db/repository";
import { ContentManager } from "../../components/AdminUI";
export default async function AdminBlog() { const posts = await getPosts(true); return <><div className="admin-page-heading"><div><span>Biblioteca editorial</span><h1>Blog</h1><p>Gestiona borradores, publicaciones y contenidos archivados.</p></div></div><section className="admin-card admin-card--flush"><ContentManager kind="posts" posts={posts} /></section></>; }
