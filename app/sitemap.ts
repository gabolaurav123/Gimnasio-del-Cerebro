import type { MetadataRoute } from "next";
import { getPosts, getTrainings } from "../db/repository";
import { getSiteOrigin } from "../lib/site-url";
export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> { const [trainings, posts, origin] = await Promise.all([getTrainings(), getPosts(), getSiteOrigin()]); return ["", "/nosotros", "/entrenamientos", "/entrenamientos/programas", "/entrenamientos/cursos", "/entrenamientos/neuroretos", "/entrenamientos/talleres", "/eventos", "/productos", "/blog", "/contacto", "/agenda", "/asociados", "/terminos", "/privacidad", "/cookies"].map((path) => ({ url: `${origin}${path}` })).concat(trainings.map((item) => ({ url: `${origin}/entrenamientos/${item.slug}` })), posts.map((item) => ({ url: `${origin}/blog/${item.slug}` }))); }
