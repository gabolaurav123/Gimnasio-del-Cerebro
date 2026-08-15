"use client";

import { useEffect, useState } from "react";
import { Play, X } from "lucide-react";
import type { Testimonial } from "../../db/repository";
import { SectionEyebrow } from "./SiteChrome";

function getYouTubeId(url: string) {
  try {
    const parsed = new URL(url);
    if (parsed.hostname === "youtu.be") return parsed.pathname.slice(1);
    if (parsed.pathname.startsWith("/shorts/")) return parsed.pathname.split("/")[2];
    if (parsed.pathname.startsWith("/embed/")) return parsed.pathname.split("/")[2];
    return parsed.searchParams.get("v");
  } catch {
    return null;
  }
}

export function TestimonialStories({ testimonials }: { testimonials: Testimonial[] }) {
  const [active, setActive] = useState<Testimonial | null>(null);

  useEffect(() => {
    if (!active) return;
    const previousOverflow = document.body.style.overflow;
    const closeWithEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActive(null);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeWithEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeWithEscape);
    };
  }, [active]);

  if (!testimonials.length) return null;
  const activeVideoId = active ? getYouTubeId(active.videoUrl) : null;

  return (
    <section className="stories-section" aria-labelledby="stories-title">
      <div className="shell">
        <div className="stories-heading">
          <div>
            <SectionEyebrow>Experiencias compartidas</SectionEyebrow>
            <h2 id="stories-title">Historias reales.<br /><em>Resultados reales.</em></h2>
          </div>
          <p>Conoce las experiencias publicadas por personas que han participado en los entrenamientos de Gimnasio del Cerebro.</p>
        </div>
        <div className="stories-track">
          {testimonials.map((testimonial, index) => (
            <button className="story-card" type="button" onClick={() => setActive(testimonial)} aria-label={`Reproducir ${testimonial.name}`} key={testimonial.id}>
              <img src={testimonial.thumbnail} alt="" width={540} height={960} loading="lazy" />
              <span className="story-card__shade" />
              <span className="story-card__number">{String(index + 1).padStart(2, "0")}</span>
              <span className="story-card__play"><Play fill="currentColor" /></span>
              <span className="story-card__copy">
                <small>{testimonial.program ?? "Historia real"}</small>
                <strong>{testimonial.name}</strong>
              </span>
            </button>
          ))}
        </div>
      </div>

      {active && activeVideoId && (
        <div className="video-modal" role="dialog" aria-modal="true" aria-label={active.name}>
          <div className="video-modal__panel">
            <div className="video-modal__heading">
              <div><span>{active.program ?? "Historia real"}</span><strong>{active.name}</strong></div>
              <button type="button" onClick={() => setActive(null)} aria-label="Cerrar video"><X /></button>
            </div>
            <div className="video-modal__frame">
              <iframe src={`https://www.youtube-nocookie.com/embed/${activeVideoId}?autoplay=1&rel=0`} title={active.name} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
