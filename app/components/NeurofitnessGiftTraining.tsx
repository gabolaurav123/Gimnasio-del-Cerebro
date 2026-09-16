"use client";

import { BrainCircuit, Check, Pause, Play, RotateCcw, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

const TOTAL_SECONDS = 5 * 60;
const steps = [
  { title: "Presencia", domain: "Preparación", instruction: "Apoya ambos pies, relaja los hombros y respira lento. Lleva tu atención a este momento." },
  { title: "Foco", domain: "Atención", instruction: "Elige un punto frente a ti. Obsérvalo y, cada vez que tu mente se vaya, vuelve con suavidad." },
  { title: "Control", domain: "Inhibición", instruction: "Cuenta del 20 al 1. Si te distraes o saltas un número, regresa al 20 sin juzgarte." },
  { title: "Memoria", domain: "Recuperación", instruction: "Recuerda cinco detalles del lugar donde estás y repásalos mentalmente en orden inverso." },
  { title: "Flexibilidad", domain: "Cambio", instruction: "Piensa en una situación actual y formula dos maneras diferentes y útiles de responder." },
] as const;

function formatTime(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

export function NeurofitnessGiftTraining() {
  const [secondsLeft, setSecondsLeft] = useState(TOTAL_SECONDS);
  const [running, setRunning] = useState(false);
  const complete = secondsLeft === 0;
  const elapsed = TOTAL_SECONDS - secondsLeft;
  const stepIndex = complete ? steps.length - 1 : Math.min(steps.length - 1, Math.floor(elapsed / 60));
  const step = steps[stepIndex];
  const progress = complete ? 100 : (elapsed / TOTAL_SECONDS) * 100;

  useEffect(() => {
    if (!running || complete) return;
    const timer = window.setInterval(() => setSecondsLeft((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [running, complete]);

  function reset() {
    setRunning(false);
    setSecondsLeft(TOTAL_SECONDS);
  }

  return <main className="gift-training">
    <header className="gift-training__hero">
      <span><Sparkles />Regalo del Reto Neurofitness</span>
      <h1>Entrenamiento Neurofitness <em>· 5 minutos</em></h1>
      <p>Una pausa guiada para activar cuatro capacidades que acabas de experimentar: foco, control, memoria y flexibilidad.</p>
    </header>

    <section className={`gift-training__player ${complete ? "is-complete" : ""}`}>
      <div className="gift-training__progress" aria-label={`Progreso ${Math.round(progress)}%`}><span style={{ width: `${progress}%` }} /></div>
      {complete ? <div className="gift-training__complete"><div><Check /></div><span>ENTRENAMIENTO COMPLETADO</span><h2>Tu cerebro acaba de practicar cómo volver, sostener y cambiar.</h2><p>Repite esta secuencia cuando necesites recuperar presencia y claridad.</p></div> : <>
        <div className="gift-training__clock"><BrainCircuit /><strong>{formatTime(secondsLeft)}</strong><span>PASO {stepIndex + 1} DE {steps.length}</span></div>
        <div className="gift-training__instruction"><span>{step.domain}</span><h2>{step.title}</h2><p>{step.instruction}</p></div>
      </>}
      <div className="gift-training__controls">
        {!complete && <button className="button button--primary" type="button" onClick={() => setRunning((value) => !value)}>{running ? <><Pause />Pausar</> : <><Play />{elapsed ? "Continuar" : "Comenzar"}</>}</button>}
        <button className="button button--secondary" type="button" onClick={reset}><RotateCcw />Reiniciar</button>
      </div>
    </section>

    <ol className="gift-training__steps">
      {steps.map((item, index) => <li className={index === stepIndex && !complete ? "active" : index < stepIndex || complete ? "done" : ""} key={item.title}><span>{index < stepIndex || complete ? <Check /> : index + 1}</span><div><small>{item.domain}</small><strong>{item.title}</strong></div></li>)}
    </ol>

    <p className="gift-training__disclaimer">Experiencia educativa y lúdica. No constituye diagnóstico, tratamiento ni evaluación médica o neuropsicológica.</p>
  </main>;
}
