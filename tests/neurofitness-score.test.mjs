import assert from "node:assert/strict";
import test from "node:test";
import { calculateNeurofitnessScores, safeRankingName, sanitizePhone } from "../lib/neurofitness.ts";

const perfect = {
  focus: { correct: 14, incorrect: 0, reactionTimes: Array(14).fill(250) },
  control: { correct: 10, incorrect: 0, reactionTimes: Array(10).fill(450) },
  memory: { correct: 5, incorrect: 0 },
  flexibility: { correct: 10, incorrect: 0, postSwitchCorrect: 5, postSwitchIncorrect: 0 },
};

test("un desempeño perfecto obtiene 100 sin convertirlo en diagnóstico", () => {
  assert.deepEqual(calculateNeurofitnessScores(perfect), { focus: 100, control: 100, memory: 100, flexibility: 100, total: 100, bestDomain: "focus" });
});

test("no responder obtiene cero y tocar indiscriminadamente no premia foco", () => {
  const empty = calculateNeurofitnessScores({
    focus: { correct: 0, incorrect: 0, reactionTimes: [] },
    control: { correct: 0, incorrect: 0, reactionTimes: [] },
    memory: { correct: 0, incorrect: 0 },
    flexibility: { correct: 0, incorrect: 0, postSwitchCorrect: 0, postSwitchIncorrect: 0 },
  });
  assert.equal(empty.total, 0);
  const indiscriminate = calculateNeurofitnessScores({ ...perfect, focus: { correct: 10, incorrect: 10, reactionTimes: Array(10).fill(120) } });
  assert.equal(indiscriminate.focus, 0);
});

test("los errores reducen la puntuación y los tiempos extremos quedan limitados", () => {
  const slower = calculateNeurofitnessScores({
    ...perfect,
    control: { correct: 7, incorrect: 3, reactionTimes: Array(7).fill(5000) },
    flexibility: { correct: 6, incorrect: 4, postSwitchCorrect: 1, postSwitchIncorrect: 4 },
  });
  assert.ok(slower.control < 70);
  assert.ok(slower.flexibility < 60);
  assert.ok(slower.total < 100);
});

test("normaliza WhatsApp y protege los alias del ranking", () => {
  assert.equal(sanitizePhone("+54 381 300-4167"), "543813004167");
  assert.equal(sanitizePhone("123"), "");
  assert.equal(safeRankingName("Marisa Cardozo", "<script>Neuro⚡</script>"), "scriptNeuroscript");
  assert.equal(safeRankingName("Marisa Cardozo", ""), "Marisa C.");
});
