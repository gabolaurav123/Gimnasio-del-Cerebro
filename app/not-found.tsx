import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return <main className="not-found"><div><span>404</span><h1>Parece que esta conexión se perdió.</h1><p>La página que buscas no está disponible o cambió de dirección.</p><a className="button button--primary" href="/"><ArrowLeft size={18} />Volver al inicio</a></div></main>;
}
