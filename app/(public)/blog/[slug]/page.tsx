import Link from "next/link";
import { ArrowLeft, ArrowRight, CalendarDays, Share2 } from "lucide-react";
import { notFound } from "next/navigation";
import { getPost, getPosts } from "../../../../db/repository";
import { whatsappUrl } from "../../../../lib/whatsapp";

export const dynamic = "force-dynamic";

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [post, all] = await Promise.all([getPost(slug), getPosts()]);
  if (!post) notFound();
  const related = all.filter((item) => item.slug !== slug).slice(0, 2);
  const date = post.publishedAt ? new Intl.DateTimeFormat("es-AR", { day: "numeric", month: "long", year: "numeric" }).format(new Date(`${post.publishedAt}T12:00:00`)) : "";
  return <article className="article"><header className="article__header"><div className="shell article__header-inner"><Link className="back-link" href="/blog"><ArrowLeft size={16} />Volver al blog</Link><span className="article__category">{post.category}</span><h1>{post.title}</h1><div className="article__meta"><span><CalendarDays size={17} />{date}</span><span><Share2 size={17} />Lectura para compartir</span></div></div></header><div className="shell article__layout"><aside><span>En este artículo</span><p>{post.excerpt}</p></aside><div className="article__content"><p className="article__lead">{post.excerpt}</p>{post.content.split("\n").map((paragraph) => <p key={paragraph}>{paragraph}</p>)}<div className="article__note"><strong>Nota editorial</strong><p>Este contenido no sustituye orientación médica, psicológica o profesional.</p></div></div></div><section className="article__related"><div className="shell"><h2>Seguir leyendo</h2><div>{related.map((item) => <Link href={`/blog/${item.slug}`} key={item.id}><span>{item.category}</span><strong>{item.title}</strong><ArrowRight /></Link>)}</div><a className="button button--primary" href={whatsappUrl("Hola, leí un artículo de Gimnasio del Cerebro y quisiera conocer sus entrenamientos.")} target="_blank" rel="noreferrer">Conocer los entrenamientos</a></div></section></article>;
}
