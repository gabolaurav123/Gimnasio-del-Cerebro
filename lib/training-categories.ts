import type { Training } from "../db/repository";

export const trainingCategories = [
  { key: "programas", label: "Programas", eyebrow: "Métodos principales", description: "Rutas centrales de formación para comprender la mente y entrenar nuevas posibilidades." },
  { key: "cursos", label: "Cursos", eyebrow: "Formación concentrada", description: "Experiencias enfocadas para comenzar o profundizar un tema específico." },
  { key: "neuroretos", label: "Neuroretos", eyebrow: "Práctica cotidiana", description: "Recorridos de 21 días para transformar la comprensión en hábitos de observación." },
  { key: "talleres", label: "Talleres", eyebrow: "Experiencias temáticas", description: "Espacios de aprendizaje y práctica organizados por tema." },
] as const;

export type TrainingCategoryKey = (typeof trainingCategories)[number]["key"];

const programAcronyms = new Set(["NFA", "NTR", "BFT", "NTM", "ALP", "NCO"]);

export function trainingBelongsTo(training: Training, category: TrainingCategoryKey) {
  if (category === "programas") return programAcronyms.has(training.acronym);
  if (category === "cursos") return training.acronym === "CURSO";
  if (category === "neuroretos") return training.acronym === "RETO";
  return training.acronym === "TALLER";
}
