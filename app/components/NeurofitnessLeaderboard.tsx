"use client";

import Image from "next/image";
import { ArrowLeft, BrainCircuit, Medal, RotateCcw, Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import type { NeurofitnessLeaderboardEntry } from "../../db/neurofitness";

export function NeurofitnessLeaderboard({ initialLabel, initialEntries }: { initialLabel: string; initialEntries: NeurofitnessLeaderboardEntry[] }) {
  const [label, setLabel] = useState(initialLabel);
  const [entries, setEntries] = useState(initialEntries);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const [connection, setConnection] = useState<"live" | "error">("live");

  async function refresh() {
    const response = await fetch("/api/neurofitness/leaderboard", { cache: "no-store" }).catch(() => null);
    if (!response?.ok) { setConnection("error"); return; }
    const payload = await response.json() as { label: string; entries: NeurofitnessLeaderboardEntry[] };
    setLabel(payload.label);
    setEntries(payload.entries);
    setUpdatedAt(new Date());
    setConnection("live");
  }

  useEffect(() => {
    const initial = window.setTimeout(() => setUpdatedAt(new Date()), 0);
    const timer = window.setInterval(refresh, 10_000);
    return () => { window.clearTimeout(initial); window.clearInterval(timer); };
  }, []);

  return <div className="neuro-board">
    <div className="neuro-game__aurora" aria-hidden="true" />
    <header className="neuro-game__topbar"><a href="/"><ArrowLeft />Gimnasio del Cerebro</a><span><BrainCircuit />Reto Neurofitness</span><a href="/reto-neurofitness"><RotateCcw />Jugar</a></header>
    <main className="neuro-board__main">
      <section className="neuro-board__heading"><span><Trophy />{label}</span><h1>TOP 10 DEL RETO</h1><p>Cerebros en entrenamiento, actualizados en vivo.</p></section>
      <div className="neuro-board__content">
        <ol className="neuro-board__list">
          {entries.length ? entries.map((entry, index) => <li key={`${entry.position}-${entry.name}-${index}`} className={entry.position <= 3 ? `top-${entry.position}` : ""}>
            <span className="neuro-board__position" aria-label={`Puesto ${entry.position}`}>{entry.position <= 3 ? <><Medal aria-hidden="true" /><i>#{entry.position}</i></> : `#${entry.position}`}</span>
            <strong>{entry.name}</strong>
            <span className="neuro-board__mini"><i style={{ width: `${entry.total}%` }} /></span>
            <b>{entry.total}</b>
          </li>) : <li className="neuro-board__empty"><BrainCircuit /><strong>El primer puesto está esperando.</strong><span>Completá el reto y autorizá tu alias para inaugurar el ranking.</span></li>}
        </ol>
        <aside><div className="neuro-board__mascot"><Image src="/images/neurofitness/neurofitness-mascot.png" alt="Mascota del Reto Neurofitness" width={360} height={540} /></div><h2>¿Podés entrar al TOP 10?</h2><a href="/reto-neurofitness">Iniciar reto</a><small className={connection === "error" ? "is-error" : ""}>{connection === "error" ? "Sin conexión momentánea; conservamos el último ranking." : updatedAt ? `Última actualización: ${updatedAt.toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" })}` : "Conectando al ranking…"}</small></aside>
      </div>
    </main>
  </div>;
}
