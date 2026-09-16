"use client";

import Image from "next/image";
import { ArrowLeft, ArrowRight, BrainCircuit, Check, ChevronLeft, ChevronRight, LockKeyhole, RotateCcw, Share2, Sparkles, Trophy, Zap } from "lucide-react";
import { FormEvent, useEffect, useRef, useState } from "react";
import { neurofitnessDomainLabels, type NeurofitnessRawMetrics, type NeurofitnessScores } from "../../lib/neurofitness";

type Attempt = { id: string; token: string; seed: number };
type GamePhase = "intro" | "starting" | "briefing" | "countdown" | "playing" | "between" | "saving" | "gate" | "result" | "error";
type ErrorAction = "start" | "complete";
type FocusStimulus = { id: number; direction: "left" | "right"; shownAt: number; responded: boolean };
type ControlStimulus = { id: number; word: ColorName; color: ColorName; shownAt: number; responded: boolean };
type FlexStimulus = { id: number; shape: "circle" | "square"; expected: "left" | "right"; postSwitch: boolean; responded: boolean };
type Result = { profile: NeurofitnessScores; rank: number | null; participantCount: number; rankingLabel: string; rankingScore: number; isPersonalBest: boolean; reward: { label: string; url: string } | null; whatsappDelivery: "sent" | "pending" | "failed" };
type ClaimPayload = { id: string; token: string; name: FormDataEntryValue | null; phone: FormDataEntryValue | null; rankingAlias: FormDataEntryValue | null; resultConsent: boolean; marketingConsent: boolean; rankingConsent: boolean; website: FormDataEntryValue | null };
type ColorName = "rojo" | "azul" | "verde" | "amarillo";

const stages = [
  { key: "focus", label: "FOCO", title: "Detecta la dirección", instruction: "Tocá únicamente cuando la flecha apunte hacia la izquierda." },
  { key: "control", label: "CONTROL", title: "Ignora la palabra", instruction: "No leas la palabra. Elegí el color con el que está escrita." },
  { key: "memory", label: "MEMORIA", title: "Recordá la secuencia", instruction: "Observá los elementos y luego identificá cuál no estaba." },
  { key: "flexibility", label: "FLEXIBILIDAD", title: "Cambiá la regla", instruction: "Respondé según la figura. A mitad del desafío, las reglas se invierten." },
] as const;

const emptyMetrics = (): NeurofitnessRawMetrics => ({
  focus: { correct: 0, incorrect: 0, reactionTimes: [] },
  control: { correct: 0, incorrect: 0, reactionTimes: [] },
  memory: { correct: 0, incorrect: 0 },
  flexibility: { correct: 0, incorrect: 0, postSwitchCorrect: 0, postSwitchIncorrect: 0 },
});
const colorMap: Record<ColorName, string> = { rojo: "#ff5f67", azul: "#4ea5ff", verde: "#3ce19a", amarillo: "#ffd85a" };
const memoryPool = ["🍋", "7", "★", "🔑", "3", "🌙", "◆", "9", "🍃", "⚡"];

function mulberry32(seed: number) {
  return () => {
    let value = seed += 0x6D2B79F5;
    value = Math.imul(value ^ value >>> 15, value | 1);
    value ^= value + Math.imul(value ^ value >>> 7, value | 61);
    return ((value ^ value >>> 14) >>> 0) / 4294967296;
  };
}

function shuffled<T>(values: T[], random: () => number) {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index--) {
    const target = Math.floor(random() * (index + 1));
    [result[index], result[target]] = [result[target], result[index]];
  }
  return result;
}

export function NeurofitnessChallenge({ rankingLabel }: { rankingLabel: string }) {
  const [phase, setPhase] = useState<GamePhase>("intro");
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [stageIndex, setStageIndex] = useState(0);
  const [countdown, setCountdown] = useState(3);
  const [timeLeft, setTimeLeft] = useState(15);
  const [message, setMessage] = useState("");
  const [errorAction, setErrorAction] = useState<ErrorAction>("start");
  const [focusStimulus, setFocusStimulus] = useState<FocusStimulus | null>(null);
  const [controlStimulus, setControlStimulus] = useState<ControlStimulus | null>(null);
  const [memorySequence, setMemorySequence] = useState<string[]>([]);
  const [memoryMode, setMemoryMode] = useState<"show" | "quiz" | "done">("show");
  const [memoryOptions, setMemoryOptions] = useState<string[]>([]);
  const [memoryFeedback, setMemoryFeedback] = useState<"correct" | "wrong" | null>(null);
  const [flexStimulus, setFlexStimulus] = useState<FlexStimulus | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [rankingConsent, setRankingConsent] = useState(false);
  const [shareStatus, setShareStatus] = useState<"idle" | "copied" | "shared" | "error">("idle");
  const metricsRef = useRef<NeurofitnessRawMetrics>(emptyMetrics());
  const rngRef = useRef<() => number>(() => Math.random());
  const focusRef = useRef<FocusStimulus | null>(null);
  const controlRef = useRef<ControlStimulus | null>(null);
  const memorySequenceRef = useRef<string[]>([]);
  const memoryAnswerRef = useRef("");
  const memoryQuestionRef = useRef(0);
  const memoryAnswerTimerRef = useRef<number | null>(null);
  const memoryLockedRef = useRef(false);
  const memoryOptionsRef = useRef<HTMLDivElement>(null);
  const flexRef = useRef<FlexStimulus | null>(null);
  const phaseFocusRef = useRef<HTMLElement>(null);
  const claimPayloadRef = useRef<ClaimPayload | null>(null);

  useEffect(() => {
    if (phase === "intro") return;
    const frame = window.requestAnimationFrame(() => phaseFocusRef.current?.focus({ preventScroll: true }));
    return () => window.cancelAnimationFrame(frame);
  }, [phase, stageIndex]);
  useEffect(() => {
    if (phase !== "playing" || stageIndex !== 2 || memoryMode !== "quiz" || memoryFeedback) return;
    const frame = window.requestAnimationFrame(() => memoryOptionsRef.current?.querySelector<HTMLButtonElement>("button")?.focus({ preventScroll: true }));
    return () => window.cancelAnimationFrame(frame);
  }, [phase, stageIndex, memoryMode, memoryOptions, memoryFeedback]);
  useEffect(() => {
    if (phase !== "countdown") return;
    if (countdown === 0) {
      const timer = window.setTimeout(() => {
        setTimeLeft(15);
        setMessage("");
        setPhase("playing");
      }, 450);
      return () => window.clearTimeout(timer);
    }
    const timer = window.setTimeout(() => setCountdown((value) => value - 1), 850);
    return () => window.clearTimeout(timer);
  }, [phase, countdown]);

  useEffect(() => {
    if (phase !== "between") return;
    const timer = window.setTimeout(() => {
      setStageIndex((value) => value + 1);
      setTimeLeft(15);
      setMessage("");
      setPhase("briefing");
    }, 950);
    return () => window.clearTimeout(timer);
  }, [phase]);

  useEffect(() => {
    if (phase !== "playing") return;
    const startedAt = Date.now();
    const endsAt = startedAt + 15_000;
    let stimulusTimer = 0;
    let memoryRevealTimer = 0;
    let finished = false;

    const nextFocus = () => {
      const previous = focusRef.current;
      if (previous?.direction === "left" && !previous.responded) metricsRef.current.focus.incorrect += 1;
      const stimulus: FocusStimulus = { id: Date.now(), direction: rngRef.current() < .36 ? "left" : "right", shownAt: performance.now(), responded: false };
      focusRef.current = stimulus;
      setFocusStimulus(stimulus);
      const elapsed = Date.now() - startedAt;
      stimulusTimer = window.setTimeout(nextFocus, Math.max(430, 800 - elapsed / 42));
    };

    const nextControl = () => {
      const previous = controlRef.current;
      if (previous && !previous.responded) metricsRef.current.control.incorrect += 1;
      const colors = Object.keys(colorMap) as ColorName[];
      const color = colors[Math.floor(rngRef.current() * colors.length)];
      const otherWords = colors.filter((value) => value !== color);
      const word = otherWords[Math.floor(rngRef.current() * otherWords.length)];
      const stimulus: ControlStimulus = { id: Date.now(), word, color, shownAt: performance.now(), responded: false };
      controlRef.current = stimulus;
      setControlStimulus(stimulus);
      stimulusTimer = window.setTimeout(nextControl, 1550);
    };

    const nextFlex = () => {
      const previous = flexRef.current;
      if (previous && !previous.responded) {
        metricsRef.current.flexibility.incorrect += 1;
        if (previous.postSwitch) metricsRef.current.flexibility.postSwitchIncorrect += 1;
      }
      const postSwitch = Date.now() - startedAt >= 7500;
      const shape = rngRef.current() < .5 ? "circle" : "square";
      const normalSide = shape === "circle" ? "left" : "right";
      const expected = postSwitch ? (normalSide === "left" ? "right" : "left") : normalSide;
      const stimulus: FlexStimulus = { id: Date.now(), shape, expected, postSwitch, responded: false };
      flexRef.current = stimulus;
      setFlexStimulus(stimulus);
      stimulusTimer = window.setTimeout(nextFlex, 1350);
    };

    if (stageIndex === 0) nextFocus();
    if (stageIndex === 1) nextControl();
    if (stageIndex === 2) {
      const sequence = shuffled(memoryPool, rngRef.current).slice(0, 5);
      memorySequenceRef.current = sequence;
      memoryQuestionRef.current = 0;
      setMemorySequence(sequence);
      setMemoryMode("show");
      memoryRevealTimer = window.setTimeout(() => { setMemoryMode("quiz"); createMemoryQuestion(); }, 4000);
    }
    if (stageIndex === 3) nextFlex();

    const finishStage = () => {
      if (finished) return;
      finished = true;
      if (stageIndex === 0 && focusRef.current?.direction === "left" && !focusRef.current.responded) metricsRef.current.focus.incorrect += 1;
      if (stageIndex === 1 && controlRef.current && !controlRef.current.responded) metricsRef.current.control.incorrect += 1;
      if (stageIndex === 3 && flexRef.current && !flexRef.current.responded) {
        metricsRef.current.flexibility.incorrect += 1;
        if (flexRef.current.postSwitch) metricsRef.current.flexibility.postSwitchIncorrect += 1;
      }
      if (stageIndex === 2) {
        const answered = metricsRef.current.memory.correct + metricsRef.current.memory.incorrect;
        metricsRef.current.memory.incorrect += Math.max(0, 5 - answered);
        memoryQuestionRef.current = 5;
      }
      window.clearTimeout(stimulusTimer);
      window.clearTimeout(memoryRevealTimer);
      setTimeLeft(0);
      if (stageIndex < stages.length - 1) setPhase("between");
      else { setPhase("saving"); void completeAttempt(); }
    };

    const ticker = window.setInterval(() => {
      const remaining = Math.max(0, (endsAt - Date.now()) / 1000);
      setTimeLeft(remaining);
      if (remaining <= 0) finishStage();
    }, 80);
    return () => {
      window.clearInterval(ticker);
      window.clearTimeout(stimulusTimer);
      window.clearTimeout(memoryRevealTimer);
      if (memoryAnswerTimerRef.current) window.clearTimeout(memoryAnswerTimerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, stageIndex]);

  function createMemoryQuestion() {
    if (memoryQuestionRef.current >= 5) { setMemoryMode("done"); return; }
    const sequence = memorySequenceRef.current;
    const absent = shuffled(memoryPool.filter((value) => !sequence.includes(value)), rngRef.current)[0];
    const options = shuffled([...shuffled(sequence, rngRef.current).slice(0, 3), absent], rngRef.current);
    memoryAnswerRef.current = absent;
    memoryLockedRef.current = false;
    setMemoryOptions(options);
    setMemoryFeedback(null);
  }

  function clearAttemptState() {
    if (memoryAnswerTimerRef.current) window.clearTimeout(memoryAnswerTimerRef.current);
    metricsRef.current = emptyMetrics();
    focusRef.current = null;
    controlRef.current = null;
    flexRef.current = null;
    memorySequenceRef.current = [];
    memoryAnswerRef.current = "";
    memoryQuestionRef.current = 0;
    memoryAnswerTimerRef.current = null;
    memoryLockedRef.current = false;
    setFocusStimulus(null);
    setControlStimulus(null);
    setFlexStimulus(null);
    setMemorySequence([]);
    setMemoryOptions([]);
    setMemoryMode("show");
    setMemoryFeedback(null);
    setRankingConsent(false);
    setShareStatus("idle");
    setSubmitting(false);
    claimPayloadRef.current = null;
  }

  async function startGame() {
    clearAttemptState();
    setMessage("");
    setPhase("starting");
    try {
      const response = await fetch("/api/neurofitness/start", { method: "POST" });
      const payload = await response.json() as { error?: string; attempt?: Attempt };
      if (!response.ok || !payload.attempt) throw new Error(payload.error || "No pudimos iniciar el reto.");
      setAttempt(payload.attempt);
      rngRef.current = mulberry32(payload.attempt.seed);
      setStageIndex(0);
      setResult(null);
      setCountdown(3);
      setErrorAction("start");
      setPhase("briefing");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No pudimos iniciar el reto.");
      setErrorAction("start");
      setPhase("error");
    }
  }

  function beginStage() {
    setCountdown(3);
    setMessage("");
    setPhase("countdown");
  }

  async function completeAttempt() {
    if (!attempt) { setMessage("El intento perdió su identificación. Inicia nuevamente."); setErrorAction("start"); setPhase("error"); return; }
    try {
      const response = await fetch("/api/neurofitness/complete", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ id: attempt.id, token: attempt.token, metrics: metricsRef.current }) });
      const payload = await response.json() as { error?: string };
      if (!response.ok) {
        setMessage(payload.error || "No pudimos analizar el reto.");
        setErrorAction(response.status >= 500 ? "complete" : "start");
        setPhase("error");
        return;
      }
      setPhase("gate");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No pudimos analizar el reto.");
      setErrorAction("complete");
      setPhase("error");
    }
  }

  function tapFocus() {
    const stimulus = focusRef.current;
    if (!stimulus || stimulus.responded) return;
    stimulus.responded = true;
    if (stimulus.direction === "left") {
      metricsRef.current.focus.correct += 1;
      metricsRef.current.focus.reactionTimes.push(Math.round(performance.now() - stimulus.shownAt));
      setMessage("¡Bien!");
    } else {
      metricsRef.current.focus.incorrect += 1;
      setMessage("Esperá la flecha izquierda");
    }
    setFocusStimulus({ ...stimulus });
  }

  function chooseColor(color: ColorName) {
    const stimulus = controlRef.current;
    if (!stimulus || stimulus.responded) return;
    stimulus.responded = true;
    if (color === stimulus.color) {
      metricsRef.current.control.correct += 1;
      metricsRef.current.control.reactionTimes.push(Math.round(performance.now() - stimulus.shownAt));
      setMessage("Correcto");
    } else {
      metricsRef.current.control.incorrect += 1;
      setMessage(`Era ${stimulus.color.toUpperCase()}`);
    }
    setControlStimulus({ ...stimulus });
  }

  function chooseMemory(option: string) {
    if (memoryMode !== "quiz" || memoryFeedback || memoryLockedRef.current) return;
    memoryLockedRef.current = true;
    const correct = option === memoryAnswerRef.current;
    if (correct) metricsRef.current.memory.correct += 1;
    else metricsRef.current.memory.incorrect += 1;
    memoryQuestionRef.current += 1;
    setMemoryFeedback(correct ? "correct" : "wrong");
    if (memoryAnswerTimerRef.current) window.clearTimeout(memoryAnswerTimerRef.current);
    memoryAnswerTimerRef.current = window.setTimeout(createMemoryQuestion, 520);
  }

  function chooseSide(side: "left" | "right") {
    const stimulus = flexRef.current;
    if (!stimulus || stimulus.responded) return;
    stimulus.responded = true;
    const correct = side === stimulus.expected;
    if (correct) {
      metricsRef.current.flexibility.correct += 1;
      if (stimulus.postSwitch) metricsRef.current.flexibility.postSwitchCorrect += 1;
      setMessage("Correcto");
    } else {
      metricsRef.current.flexibility.incorrect += 1;
      if (stimulus.postSwitch) metricsRef.current.flexibility.postSwitchIncorrect += 1;
      setMessage("Regla incorrecta");
    }
    setFlexStimulus({ ...stimulus });
  }

  async function claimResult(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!attempt) return;
    setSubmitting(true);
    setFormError("");
    const form = new FormData(event.currentTarget);
    const payload: ClaimPayload = {
      id: attempt.id,
      token: attempt.token,
      name: form.get("name"),
      phone: form.get("phone"),
      rankingAlias: form.get("rankingAlias") ?? "",
      resultConsent: form.get("resultConsent") === "on",
      marketingConsent: form.get("marketingConsent") === "on",
      rankingConsent: form.get("rankingConsent") === "on",
      website: form.get("website"),
    };
    claimPayloadRef.current = payload;
    await submitClaim(payload);
  }

  async function submitClaim(claimPayload: ClaimPayload) {
    setSubmitting(true);
    setFormError("");
    try {
      const response = await fetch("/api/neurofitness/claim", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(claimPayload),
      });
      const payload = await response.json() as Result & { error?: string };
      if (!response.ok) throw new Error(payload.error || "No pudimos guardar tu perfil.");
      setResult(payload);
      setPhase("result");
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "No pudimos guardar tu perfil.");
    } finally {
      setSubmitting(false);
    }
  }

  async function shareResult() {
    if (!result) return;
    const text = `🧠 Obtuve ${result.profile.total}/100 en el Reto Neurofitness. Mi mejor desempeño fue ${neurofitnessDomainLabels[result.profile.bestDomain]}. ¿Podés superarme?`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "Reto Neurofitness", text, url: window.location.origin + "/reto-neurofitness" });
        setShareStatus("shared");
      } else {
        await navigator.clipboard.writeText(`${text} ${window.location.origin}/reto-neurofitness`);
        setShareStatus("copied");
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setShareStatus("error");
    }
  }

  function resetGame() {
    clearAttemptState();
    setAttempt(null);
    setResult(null);
    setMessage("");
    setFormError("");
    setStageIndex(0);
    setPhase("intro");
  }

  const activeStage = stages[stageIndex];
  return <div className="neuro-game">
    <div className="neuro-game__aurora" aria-hidden="true" />
    <header className="neuro-game__topbar">
      <a href="/" aria-label="Volver a Gimnasio del Cerebro"><ArrowLeft />Gimnasio del Cerebro</a>
      <span><BrainCircuit />Reto Neurofitness</span>
      <a href="/reto-neurofitness/ranking" aria-label={`Ver ${rankingLabel}`}><Trophy />Ranking</a>
    </header>

    {phase === "intro" && <main className="neuro-intro">
      <section className="neuro-intro__copy">
        <span className="neuro-kicker"><Zap />Experiencia del evento</span>
        <h1>¿Qué tan entrenado está <em>tu cerebro?</em></h1>
        <p>60 segundos. Cuatro desafíos. Un perfil orientativo para descubrir cómo respondés hoy.</p>
        <div className="neuro-intro__metrics"><span><strong>60</strong>segundos</span><span><strong>4</strong>capacidades</span><span><strong>1</strong>resultado</span></div>
        <button className="neuro-game__primary" type="button" onClick={startGame}>Iniciar reto<ArrowRight /></button>
        <small>Al finalizar solicitaremos tu nombre y WhatsApp para mostrarte y enviarte el perfil. Experiencia lúdica; no constituye una evaluación médica ni neuropsicológica.</small>
      </section>
      <aside className="neuro-intro__mascot" aria-hidden="true"><div /><Image src="/images/neurofitness/neurofitness-mascot.png" alt="" width={512} height={768} priority /><span>FOCO · CONTROL · MEMORIA · FLEXIBILIDAD</span></aside>
    </main>}

    {phase === "starting" && <main ref={phaseFocusRef} tabIndex={-1} className="neuro-analyzing neuro-game__phase-focus"><div className="neuro-analyzing__brain"><BrainCircuit /></div><span>PREPARANDO TU RETO…</span><p>Estamos creando una partida segura para vos.</p></main>}
    {phase === "briefing" && <main ref={phaseFocusRef} tabIndex={-1} className="neuro-briefing neuro-game__phase-focus">
      <section>
        <span>DESAFÍO {stageIndex + 1} DE 4 · 15 SEGUNDOS</span>
        <h1>{activeStage.label}</h1>
        <p>{stageIndex === 0 ? "Tocá la tarjeta grande únicamente cuando veas una flecha hacia la izquierda. Si apunta a la derecha, esperá." : stageIndex === 1 ? "Mirá el color de la tinta y tocá el botón de ese color. Ignorá lo que dice la palabra." : stageIndex === 2 ? "Primero memorizá los cinco elementos. Después tocá cuál de las opciones es nuevo." : "Mirá la figura y tocá IZQUIERDA o DERECHA según la regla. Cuando aparezca CAMBIO, invertí la respuesta."}</p>
        <div className={`neuro-briefing__demo neuro-briefing__demo--${activeStage.key}`} aria-hidden="true">
          {stageIndex === 0 && <><i>→</i><i>→</i><i className="is-target">←</i><i>→</i></>}
          {stageIndex === 1 && <><strong style={{ color: colorMap.azul }}>ROJO</strong><b>TOCÁ: AZUL</b></>}
          {stageIndex === 2 && <><i>🍋</i><i>7</i><i>★</i><i>🔑</i><i>3</i></>}
          {stageIndex === 3 && <><b>○ → IZQUIERDA</b><strong>🔄 CAMBIO</strong><b>○ → DERECHA</b></>}
        </div>
        <button className="neuro-game__primary" type="button" onClick={beginStage}>Entendido, comenzar {activeStage.label}<ArrowRight /></button>
      </section>
    </main>}
    {phase === "countdown" && <main ref={phaseFocusRef} tabIndex={-1} className="neuro-countdown neuro-game__phase-focus"><span>{activeStage.label} · Prepará tu atención</span><strong>{countdown || "¡YA!"}</strong><p>{activeStage.instruction}</p></main>}

    {phase === "playing" && <main ref={phaseFocusRef} tabIndex={-1} className="neuro-stage neuro-game__phase-focus">
      <div className="neuro-stage__header">
        <div><span>DESAFÍO {stageIndex + 1} / 4 · 15 SEGUNDOS</span><h1>{activeStage.label}</h1><p>{activeStage.instruction}</p></div>
        <div className="neuro-stage__timer"><strong>{Math.ceil(timeLeft)}</strong><span>seg</span></div>
      </div>
      <div className="neuro-stage__progress"><span style={{ width: `${(timeLeft / 15) * 100}%` }} /></div>

      {stageIndex === 0 && <section className="neuro-play neuro-play--focus">
        <p>TOCÁ LA TARJETA SOLO SI VES ←</p>
        <button type="button" className={`neuro-focus-target ${focusStimulus?.responded ? "answered" : ""}`} onClick={tapFocus} aria-label={`Flecha hacia la ${focusStimulus?.direction === "left" ? "izquierda; responder" : "derecha; no responder"}`}>
          <span className="neuro-stimulus-in" key={focusStimulus?.id}>{focusStimulus?.direction === "left" ? <ChevronLeft /> : <ChevronRight />}</span>
          <b>TOCAR ESTA TARJETA</b>
        </button>
        <span role="status" aria-live="polite">{message || "Observá con atención"}</span>
      </section>}

      {stageIndex === 1 && <section className="neuro-play neuro-play--control">
        <p>NO LEAS LA PALABRA. TOCÁ EL COLOR.</p>
        <strong className="neuro-stimulus-in" key={controlStimulus?.id} role="img" aria-label={`${controlStimulus?.word || "palabra"}, escrita en color ${controlStimulus?.color || "azul"}`} style={{ color: colorMap[controlStimulus?.color || "azul"] }}>{controlStimulus?.word.toUpperCase()}</strong>
        <div>{(Object.keys(colorMap) as ColorName[]).map((color) => <button type="button" aria-label={`Elegir color ${color}`} key={color} onClick={() => chooseColor(color)} style={{ "--choice-color": colorMap[color] } as React.CSSProperties}>{color.toUpperCase()}</button>)}</div>
        <span role="status" aria-live="polite">{message || "Elegí el color de la tinta"}</span>
      </section>}

      {stageIndex === 2 && <section className="neuro-play neuro-play--memory">
        {memoryMode === "show" ? <><p>MEMORIZÁ ESTA SECUENCIA</p><div className="neuro-memory-sequence">{memorySequence.map((item, index) => <strong key={`${item}-${index}`}>{item}</strong>)}</div><span>Desaparecerá en unos segundos…</span></> : memoryMode === "quiz" ? <><p>¿CUÁL NO ESTABA?</p><div ref={memoryOptionsRef} aria-label={`Pregunta ${Math.min(memoryQuestionRef.current + 1, 5)} de 5`} className={`neuro-memory-options ${memoryFeedback || ""}`}>{memoryOptions.map((item) => <button type="button" key={item} onClick={() => chooseMemory(item)}>{item}</button>)}</div><span role="status" aria-live="polite">{memoryFeedback === "correct" ? "¡Correcto!" : memoryFeedback === "wrong" ? "Seguimos" : `Pregunta ${Math.min(memoryQuestionRef.current + 1, 5)} de 5`}</span></> : <><Check className="neuro-memory-done" /><p>MEMORIA COMPLETADA</p><span>Mantené el foco hasta el siguiente desafío.</span></>}
      </section>}

      {stageIndex === 3 && <section className="neuro-play neuro-play--flex">
        <div className={`neuro-rule-card ${flexStimulus?.postSwitch ? "changed" : ""}`} aria-live="assertive"><span>{flexStimulus?.postSwitch ? "🔄 CAMBIO DE REGLA" : "REGLA ACTUAL"}</span><p>{flexStimulus?.postSwitch ? "Círculo → derecha · Cuadrado → izquierda" : "Círculo → izquierda · Cuadrado → derecha"}</p></div>
        <strong key={flexStimulus?.id} className={`neuro-shape neuro-stimulus-in neuro-shape--${flexStimulus?.shape || "circle"}`} aria-label={flexStimulus?.shape === "square" ? "Cuadrado" : "Círculo"} />
        <div className="neuro-flex-actions"><button type="button" onClick={() => chooseSide("left")}><ChevronLeft />IZQUIERDA</button><button type="button" onClick={() => chooseSide("right")}>DERECHA<ChevronRight /></button></div>
        <span role="status" aria-live="polite">{message || "Aplicá la regla"}</span>
      </section>}
    </main>}

    {phase === "between" && <main ref={phaseFocusRef} tabIndex={-1} className="neuro-transition neuro-game__phase-focus"><Zap /><span>{activeStage.label} COMPLETADO</span><h1>Siguiente: {stages[stageIndex + 1]?.label}</h1><p>{stages[stageIndex + 1]?.instruction}</p></main>}
    {phase === "saving" && <main ref={phaseFocusRef} tabIndex={-1} className="neuro-analyzing neuro-game__phase-focus"><div className="neuro-analyzing__brain"><BrainCircuit /></div><span>ANALIZANDO TU RETO…</span><div>{stages.map((stage, index) => <i key={stage.key} style={{ animationDelay: `${index * .16}s` }} />)}</div></main>}

    {phase === "gate" && <main ref={phaseFocusRef} tabIndex={-1} className="neuro-gate neuro-game__phase-focus">
      <section className="neuro-gate__profile"><div className="neuro-gate__lock"><LockKeyhole /></div><span>TU PERFIL ESTÁ LISTO</span><h1>Descubrí cómo respondiste hoy.</h1><div className="neuro-gate__blur" aria-hidden="true">{stages.map((stage, index) => <div key={stage.key}><span>{stage.label}</span><i><b style={{ width: `${62 + index * 8}%` }} /></i><strong>—</strong></div>)}</div><p>Registrate para revelar tu puntuación, recibir el perfil por WhatsApp y participar del ranking si querés.</p></section>
      <form className="neuro-lead-form" onSubmit={claimResult}>
        <span>REGISTRO DEL RESULTADO</span><h2>¿A dónde enviamos tu perfil?</h2>
        <label>Nombre<input name="name" autoComplete="name" minLength={2} maxLength={80} required placeholder="Tu nombre" /></label>
        <label>WhatsApp<input name="phone" inputMode="tel" autoComplete="tel" minLength={9} maxLength={30} required placeholder="Ej. +54 381 300 4167" /></label>
        {rankingConsent && <label>Alias para el ranking <small>Opcional; si queda vacío mostraremos tu nombre e inicial.</small><input name="rankingAlias" maxLength={28} placeholder="Ej. MenteÁgil" /></label>}
        <input className="neuro-honeypot" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
        <label className="neuro-check"><input name="resultConsent" type="checkbox" required /><span><Check />Acepto recibir mi resultado por WhatsApp.</span></label>
        <label className="neuro-check"><input name="marketingConsent" type="checkbox" /><span><Check />Quiero recibir novedades y propuestas de Neurofitness.</span></label>
        <label className="neuro-check"><input name="rankingConsent" type="checkbox" checked={rankingConsent} onChange={(event) => setRankingConsent(event.target.checked)} /><span><Check />Autorizo mostrar mi alias y puntuación en el ranking.</span></label>
        <p>El consentimiento del resultado es necesario para enviarlo. Marketing y ranking son opcionales e independientes. Consulta el <a href="/privacidad" target="_blank">aviso de privacidad</a>.</p>
        {formError && <div className="neuro-form-error" role="alert">{formError}</div>}
        <button className="neuro-game__primary" disabled={submitting}>{submitting ? "Guardando…" : "Quiero mi resultado"}<ArrowRight /></button>
      </form>
    </main>}

    {phase === "result" && result && <main ref={phaseFocusRef} tabIndex={-1} className="neuro-result neuro-game__phase-focus">
      <section className="neuro-result__profile">
        <span>🧠 TU PERFIL NEUROFITNESS</span><h1>{result.profile.total}<small>/ 100</small></h1><p>Puntuación del Reto Neurofitness</p>
        <div className="neuro-score-bars">{(["focus", "control", "memory", "flexibility"] as const).map((domain) => <div key={domain}><span>{neurofitnessDomainLabels[domain]}</span><i><b style={{ width: `${result.profile[domain]}%` }} /></i><strong>{result.profile[domain]}</strong></div>)}</div>
        <div className="neuro-best"><Sparkles /><div><span>Tu mejor desempeño de hoy</span><strong>{neurofitnessDomainLabels[result.profile.bestDomain]}</strong></div></div>
        <small>Resultado lúdico y orientativo. No mide inteligencia, edad cerebral ni constituye un diagnóstico.</small>
      </section>
      <aside className="neuro-result__ranking">
        <Trophy /><span>{result.rankingLabel}</span>
        {result.rank ? <><h2>#{result.rank}</h2><p>de {result.participantCount} cerebros que aceptaron participar{result.rankingScore !== result.profile.total ? ` · puesto calculado con tu mejor marca de ${result.rankingScore}/100` : ""}</p><strong>{result.isPersonalBest ? "Tu mejor marca vigente" : "¿Podés mejorar tu récord?"}</strong></> : <><h2>{result.profile.total}</h2><p>Tu resultado quedó privado, tal como elegiste.</p></>}
        <div className={`neuro-delivery ${result.whatsappDelivery}`}><Check />{result.whatsappDelivery === "sent" ? "Perfil enviado por WhatsApp" : result.whatsappDelivery === "failed" ? "Perfil guardado; WhatsApp no respondió" : "Perfil guardado; el envío está pendiente"}</div>
        {result.whatsappDelivery === "failed" && <button className="neuro-delivery-retry" type="button" disabled={submitting} onClick={() => claimPayloadRef.current && void submitClaim(claimPayloadRef.current)}><RotateCcw />{submitting ? "Reintentando…" : "Reintentar envío"}</button>}
        {result.reward && <a className="neuro-reward" href={result.reward.url} target="_blank" rel="noreferrer">🎁 {result.reward.label}<ArrowRight /></a>}
        <button className="neuro-game__primary" type="button" onClick={shareResult}><Share2 />Compartir mi resultado</button>
        {shareStatus !== "idle" && <small className={`neuro-share-status ${shareStatus}`} role="status">{shareStatus === "copied" ? "Enlace copiado." : shareStatus === "shared" ? "Resultado compartido." : "No pudimos compartirlo; intenta nuevamente."}</small>}
        <div className="neuro-result__actions"><a href="/reto-neurofitness/ranking"><Trophy />Ver Top 10</a><button type="button" onClick={resetGame}><RotateCcw />Nuevo participante</button></div>
      </aside>
    </main>}

    {phase === "error" && <main ref={phaseFocusRef} tabIndex={-1} className="neuro-error neuro-game__phase-focus"><BrainCircuit /><h1>No pudimos continuar</h1><p>{message}</p><div className="neuro-error__actions"><button className="neuro-game__primary" type="button" onClick={() => { if (errorAction === "complete" && attempt) { setPhase("saving"); void completeAttempt(); } else void startGame(); }}><RotateCcw />{errorAction === "complete" && attempt ? "Reintentar el análisis" : "Reiniciar reto"}</button><button type="button" onClick={resetGame}>Volver al inicio</button></div></main>}
  </div>;
}
