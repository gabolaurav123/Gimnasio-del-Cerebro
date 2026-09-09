import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { redirect } from "next/navigation";
import { isAdmin } from "../../../lib/auth";
import { getCustomerSession } from "../../../lib/customer-auth";
import { LoginForm } from "../../components/LoginForm";

export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; mode?: string }> }) {
  const query = await searchParams;
  const next = query.next?.startsWith("/checkout/") && !query.next.startsWith("//") ? query.next : "";
  if (await isAdmin()) redirect(next || "/admin");
  if (await getCustomerSession()) redirect(next || "/mi-cuenta");
  return <section className="login-page"><div className="login-panel"><div className="login-panel__top"><div className="login-panel__brand"><Image src="/logos/gdc-full-v2.jpg" alt="Gimnasio del Cerebro" width={110} height={110} /><span>Acceso seguro</span></div><a className="login-back" href={next || "/"}><ArrowLeft size={17} />{next ? "Volver a la adquisición" : "Volver al inicio"}</a></div><div className="login-panel__content"><span className="login-kicker">Tu espacio de aprendizaje</span><h1>{query.mode === "register" ? "Crea tu cuenta." : "Bienvenido."}</h1><p>{next ? "Tu selección está guardada. Al terminar volverás automáticamente al mismo producto." : "Ingresa a tu cuenta para acceder a tus programas, recursos y asistentes personalizados."}</p><LoginForm initialMode={query.mode === "register" ? "register" : "login"} /></div><small>Las credenciales y sesiones se transmiten de forma segura.</small></div><div className="login-visual"><Image src="/images/hero-neuroscience-human-desktop-v2.png" alt="" fill sizes="50vw" /><div><span>Gimnasio del Cerebro</span><blockquote>“Comprender cómo aprendemos abre nuevas posibilidades.”</blockquote></div></div></section>;
}
