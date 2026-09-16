"use client";

import { Check, Copy, Eye, EyeOff, Save, Trophy } from "lucide-react";
import { FormEvent, useState } from "react";

export function NeurofitnessSettings({ settings }: { settings: Record<string, string> }) {
  const [enabled, setEnabled] = useState(settings.neurofitnessEnabled === "true");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "copied" | "error">("idle");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("saving");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/admin/neurofitness", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          enabled,
          campaignKey: form.get("campaignKey"),
          popupFrequency: form.get("popupFrequency"),
          popupDelayMs: Number(form.get("popupDelayMs")),
          popupEyebrow: form.get("popupEyebrow"),
          popupTitle: form.get("popupTitle"),
          popupDescription: form.get("popupDescription"),
          popupCta: form.get("popupCta"),
          eventLabel: form.get("eventLabel"),
          rankingLabel: form.get("rankingLabel"),
          rewardLabel: form.get("rewardLabel"),
          rewardUrl: form.get("rewardUrl"),
        }),
      });
      setStatus(response.ok ? "saved" : "error");
    } catch {
      setStatus("error");
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/reto-neurofitness`);
      setStatus("copied");
    } catch {
      setStatus("error");
    }
  }

  return <form className="neuro-admin-settings" onSubmit={submit}>
    <div className="neuro-admin-toggle">
      <div className={enabled ? "active" : "inactive"}>{enabled ? <Eye /> : <EyeOff />}</div>
      <div><strong>Ventana del Reto Neurofitness</strong><p>{enabled ? "Activa: se mostrará según la frecuencia elegida." : "Desactivada: el juego seguirá disponible por su enlace directo."}</p></div>
      <label className="admin-switch"><span className="sr-only">Mostrar la ventana del Reto Neurofitness</span><input type="checkbox" checked={enabled} onChange={(event) => setEnabled(event.target.checked)} /><span className="admin-switch__track" aria-hidden="true" /></label>
    </div>
    <div className="neuro-admin-grid">
      <label>Clave de campaña<input name="campaignKey" pattern="[a-z0-9-]+" defaultValue={settings.neurofitnessCampaignKey} required /><small>Cámbiala solo al lanzar una campaña nueva: también iniciará un conjunto separado de participantes y ranking.</small></label>
      <label>Frecuencia<input value="En cada recarga" readOnly aria-readonly="true" /><input name="popupFrequency" type="hidden" value="always" /><small>El anuncio vuelve a mostrarse cada vez que alguien recarga la web.</small></label>
      <label>Demora antes de abrir<input name="popupDelayMs" type="number" min={0} max={15000} step={100} defaultValue={settings.neurofitnessPopupDelayMs || "1400"} /><small>Milisegundos. Recomendado: 1400.</small></label>
      <label>Etiqueta superior<input name="popupEyebrow" maxLength={80} defaultValue={settings.neurofitnessPopupEyebrow} required /></label>
      <label>Título<input name="popupTitle" maxLength={100} defaultValue={settings.neurofitnessPopupTitle} required /></label>
      <label>Evento<input name="eventLabel" maxLength={100} defaultValue={settings.neurofitnessEventLabel} required /></label>
      <label className="neuro-admin-wide">Descripción<textarea name="popupDescription" rows={3} maxLength={320} defaultValue={settings.neurofitnessPopupDescription} required /></label>
      <label>Texto del botón<input name="popupCta" maxLength={60} defaultValue={settings.neurofitnessPopupCta} required /></label>
      <label>Nombre del ranking<input name="rankingLabel" maxLength={100} defaultValue={settings.neurofitnessRankingLabel} required /></label>
      <label>Regalo (opcional)<input name="rewardLabel" maxLength={120} defaultValue={settings.neurofitnessRewardLabel} placeholder="Ej. Entrenamiento de 5 minutos" /></label>
      <label>Enlace del regalo (opcional)<input name="rewardUrl" type="url" maxLength={500} defaultValue={settings.neurofitnessRewardUrl} placeholder="https://..." /></label>
    </div>
    <div className="neuro-admin-actions">
      <button className="button button--primary" disabled={status === "saving"}><Save />{status === "saving" ? "Guardando…" : "Guardar campaña"}</button>
      <button className="button button--secondary" type="button" onClick={copyLink}><Copy />Copiar enlace directo</button>
      <a className="button button--secondary" href="/reto-neurofitness/ranking" target="_blank"><Trophy />Ver ranking</a>
      <span aria-live="polite">
        {status === "saved" && <span className="inline-success"><Check />Configuración actualizada</span>}
        {status === "copied" && <span className="inline-success"><Check />Enlace copiado</span>}
        {status === "error" && <span className="inline-error">No se pudo completar la acción. Revisa los campos o permisos del navegador.</span>}
      </span>
    </div>
  </form>;
}
