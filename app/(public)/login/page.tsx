import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { redirect } from "next/navigation";
import { isAdmin } from "../../../lib/auth";
import { getCustomerSession } from "../../../lib/customer-auth";
import { LoginForm } from "../../components/LoginForm";

export const dynamic = "force-dynamic";
export default async function LoginPage() {
  if (await isAdmin()) redirect("/admin");
  if (await getCustomerSession()) redirect("/mi-cuenta");
  return <section className="login-page"><div className="login-panel"><div className="login-panel__top"><div className="login-panel__brand"><Image src="/logos/gdc-full-v2.jpg" alt="Gimnasio del Cerebro" width={110} height={110} /><span>Acceso seguro</span></div><a className="login-back" href="/"><ArrowLeft size={17} />Volver al inicio</a></div><div className="login-panel__content"><span className="login-kicker">Tu espacio de aprendizaje</span><h1>Bienvenido.</h1><p>Ingresa como usuario para acceder a tus programas y asistentes, o como administrador para gestionar el sitio.</p><LoginForm /></div><small>Las credenciales y sesiones se transmiten de forma segura.</small></div><div className="login-visual"><Image src="/images/hero-neuroscience-human-desktop-v2.png" alt="" fill sizes="50vw" /><div><span>Gimnasio del Cerebro</span><blockquote>“Comprender cómo aprendemos abre nuevas posibilidades.”</blockquote></div></div></section>;
}
