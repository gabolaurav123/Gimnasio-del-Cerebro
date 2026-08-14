import type { MetadataRoute } from "next";
import { getPosts, getTrainings } from "../db/repository";
export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> { const [trainings, posts] = await Promise.all([getTrainings(), getPosts()]); const origin = "https://gimnasio-del-cerebro.sites.openai.com"; return ["", "/entrenamientos", "/blog", "/contacto"].map((path) => ({ url: `${origin}${path}` })).concat(trainings.map((item) => ({ url: `${origin}/entrenamientos/${item.slug}` })), posts.map((item) => ({ url: `${origin}/blog/${item.slug}` }))); }
