import Image from "next/image";
import { redirect } from "next/navigation";
import { isAdmin } from "../../../lib/auth";
import { LoginForm } from "../../components/LoginForm";

export const dynamic = "force-dynamic";
export default async function LoginPage() {
  if (await isAdmin()) redirect("/admin");
  return <section className="login-page"><div className="login-panel"><div className="login-panel__brand"><Image src="/logos/gdc-full-v2.jpg" alt="Gimnasio del Cerebro" width={110} height={110} /><span>Área de gestión</span></div><div><span className="login-kicker">Acceso administrativo</span><h1>Bienvenido de nuevo.</h1><p>Gestiona contactos, entrenamientos y contenidos desde un entorno seguro.</p><LoginForm /></div><small>El acceso está reservado a usuarios autorizados.</small></div><div className="login-visual"><Image src="/images/hero-neurofitness-desktop.png" alt="" fill sizes="50vw" /><div><span>Gimnasio del Cerebro</span><blockquote>“Organizar el conocimiento también es una forma de ampliar posibilidades.”</blockquote></div></div></section>;
}
