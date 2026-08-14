import type { Metadata } from "next";
import { getPosts } from "../../../db/repository";
import { BlogGrid } from "../../components/PublicUI";
import { SectionEyebrow } from "../../components/SiteChrome";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Blog | Gimnasio del Cerebro", description: "Artículos sobre mente, consciencia, aprendizaje y desarrollo personal." };

export default async function BlogPage() {
  const posts = await getPosts();
  return <><section className="page-hero page-hero--journal"><div className="shell"><SectionEyebrow>Cuaderno de ideas</SectionEyebrow><h1>Lecturas para seguir<br /><em>entrenando tu mente.</em></h1><p>Reflexiones y herramientas para comprendernos mejor y ampliar nuestra manera de aprender, decidir y actuar.</p></div></section><section className="blog-page"><div className="shell"><BlogGrid posts={posts} /></div></section></>;
}
