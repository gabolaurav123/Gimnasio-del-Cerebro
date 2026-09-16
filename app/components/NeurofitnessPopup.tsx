"use client";

import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { ArrowRight, BrainCircuit, Clock3, Trophy, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export type NeurofitnessPublicConfig = {
  enabled: boolean;
  campaignKey: string;
  frequency: "session" | "day" | "always";
  delayMs: number;
  eyebrow: string;
  title: string;
  description: string;
  cta: string;
  eventLabel: string;
  rankingLabel: string;
};

const excludedPrefixes = ["/login", "/checkout", "/pago", "/mi-cuenta", "/reto-neurofitness", "/privacidad", "/terminos", "/cookies"];

function shouldSuppress(config: NeurofitnessPublicConfig) {
  const key = `gdc:reto-popup:${config.campaignKey}`;
  if (config.frequency === "always") return false;
  if (config.frequency === "session") return window.sessionStorage.getItem(key) === "dismissed";
  const dismissedAt = Number(window.localStorage.getItem(key) || 0);
  return dismissedAt > 0 && Date.now() - dismissedAt < 24 * 60 * 60 * 1000;
}

function rememberDismissal(config: NeurofitnessPublicConfig) {
  const key = `gdc:reto-popup:${config.campaignKey}`;
  if (config.frequency === "session") window.sessionStorage.setItem(key, "dismissed");
  if (config.frequency === "day") window.localStorage.setItem(key, String(Date.now()));
}

export function NeurofitnessPopup({ config }: { config: NeurofitnessPublicConfig }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!config.enabled || excludedPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))) return;
    if (shouldSuppress(config)) return;
    const timer = window.setTimeout(() => setOpen(true), config.delayMs);
    return () => window.clearTimeout(timer);
  }, [config, pathname]);

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") dismiss();
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = [...dialogRef.current.querySelectorAll<HTMLElement>('button, a[href], input, [tabindex]:not([tabindex="-1"])')].filter((element) => !element.hasAttribute("disabled"));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      previouslyFocused?.focus();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function dismiss() {
    rememberDismissal(config);
    setOpen(false);
  }

  function start() {
    rememberDismissal(config);
    setOpen(false);
    router.push("/reto-neurofitness");
  }

  if (!open) return null;
  return <div className="neuro-popup" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) dismiss(); }}>
    <div className="neuro-popup__panel" role="dialog" aria-modal="true" aria-labelledby="neuro-popup-title" ref={dialogRef}>
      <button className="neuro-popup__close" type="button" aria-label="Cerrar invitación" onClick={dismiss} ref={closeButtonRef}><X /></button>
      <div className="neuro-popup__copy">
        <span className="neuro-popup__event"><span />{config.eyebrow}</span>
        <p className="neuro-popup__label">{config.eventLabel}</p>
        <h2 id="neuro-popup-title">{config.title}</h2>
        <p>{config.description}</p>
        <div className="neuro-popup__facts" aria-label="Información del reto">
          <span><Clock3 />60 segundos</span><span><BrainCircuit />4 desafíos</span><span><Trophy />Ranking en vivo</span>
        </div>
        <button className="neuro-popup__start" type="button" onClick={start}>{config.cta}<ArrowRight /></button>
        <small>Al finalizar solicitaremos nombre y WhatsApp para mostrar y enviar el perfil. Experiencia lúdica; no constituye una evaluación médica ni neuropsicológica.</small>
      </div>
      <div className="neuro-popup__visual" aria-hidden="true">
        <div className="neuro-popup__halo" />
        <Image src="/images/neurofitness/neurofitness-mascot.png" alt="" width={512} height={768} priority />
        <span>¿Listo para entrenar?</span>
      </div>
    </div>
  </div>;
}
