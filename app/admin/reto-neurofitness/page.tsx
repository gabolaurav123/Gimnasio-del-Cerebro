import { BrainCircuit, MessageCircleMore, Sparkles, Trophy, UsersRound } from "lucide-react";
import { getNeurofitnessAdminOverview } from "../../../db/neurofitness";
import { getSettings } from "../../../db/repository";
import { requireAdminRole } from "../../../lib/admin-access";
import { neurofitnessDomainLabels, type NeurofitnessDomain } from "../../../lib/neurofitness";

export const dynamic = "force-dynamic";

export default async function NeurofitnessAdminPage() {
  await requireAdminRole(["SUPERADMIN", "COMERCIAL"]);
  const settings = await getSettings();
  const overview = await getNeurofitnessAdminOverview(settings.neurofitnessCampaignKey || "ccm-2026");
  return <>
    <div className="admin-page-heading"><div><span>Juego del evento</span><h1>Reto Neurofitness</h1><p>Participantes, resultados orientativos y ranking autorizado de la campaña actual.</p></div><a className="button button--secondary" href="/reto-neurofitness" target="_blank"><BrainCircuit />Abrir reto</a></div>
    <section className="metric-grid neuro-admin-metrics">
      <article><UsersRound /><div><strong>{overview.participants}</strong><span>Participantes registrados</span></div></article>
      <article><BrainCircuit /><div><strong>{overview.completed}</strong><span>Retos completados</span></div></article>
      <article><Sparkles /><div><strong>{overview.average}</strong><span>Puntuación promedio</span></div></article>
      <article><Trophy /><div><strong>{overview.rankingParticipants}</strong><span>Participantes visibles</span></div></article>
    </section>
    <div className="neuro-admin-layout">
      <section className="admin-card admin-card--flush"><div className="admin-card__heading admin-card__heading--padded"><div><h2>Leads recientes</h2><p>El consentimiento de novedades es independiente del resultado.</p></div></div><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Persona</th><th>WhatsApp</th><th>Puntaje</th><th>Mejor capacidad</th><th>Consentimientos</th><th>Envío</th></tr></thead><tbody>{overview.leads.length ? overview.leads.map((lead) => <tr key={lead.id}><td><strong>{lead.name}</strong><small>{new Date(lead.createdAt).toLocaleString("es")}</small></td><td>{lead.phone}</td><td><strong>{lead.total}/100</strong></td><td>{neurofitnessDomainLabels[lead.bestDomain as NeurofitnessDomain] || lead.bestDomain}</td><td><span className={`status-badge ${lead.marketingConsent ? "status-badge--verified" : ""}`}>{lead.marketingConsent ? "Marketing sí" : "Solo resultado"}</span>{lead.rankingConsent && <span className="status-badge status-badge--verified">Ranking</span>}</td><td><span className={`status-badge ${lead.whatsappStatus === "SENT" ? "status-badge--verified" : lead.whatsappStatus === "FAILED" ? "status-badge--rejected" : "status-badge--pending"}`}><MessageCircleMore />{lead.whatsappStatus === "SENT" ? "Enviado" : lead.whatsappStatus === "FAILED" ? "Falló" : lead.whatsappStatus === "SENDING" ? "Enviando" : "Pendiente"}</span></td></tr>) : <tr><td colSpan={6}><div className="admin-empty"><BrainCircuit /><strong>Aún no hay participantes.</strong><span>Cuando alguien complete y registre su resultado, aparecerá aquí.</span></div></td></tr>}</tbody></table></div></section>
      <section className="admin-card"><div className="admin-card__heading"><div><h2>Top 10 autorizado</h2><p>{settings.neurofitnessRankingLabel}</p></div></div><ol className="neuro-admin-ranking">{overview.leaderboard.map((entry) => <li key={`${entry.position}-${entry.name}`}><span>#{entry.position}</span><strong>{entry.name}</strong><i><b style={{ width: `${entry.total}%` }} /></i><em>{entry.total}</em></li>)}{!overview.leaderboard.length && <li className="empty">Sin participantes visibles todavía.</li>}</ol></section>
    </div>
  </>;
}
