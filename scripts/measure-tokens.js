#!/usr/bin/env node
/**
 * measure-tokens.js — Mide el uso de tokens en sesiones de OpenCode
 *
 * Uso: node scripts/measure-tokens.js [num_sesiones]
 *
 * Ejecuta `opencode run --format json` con tareas de ejemplo y calcula
 * estadísticas de uso de tokens (input, output, cache, reasoning).
 */

import { execSync } from "node:child_process";
import { writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, "..");

const MODEL = process.argv[3] || "opencode-go/qwen3.8-flash";
const NUM_SESSIONS = parseInt(process.argv[2] || "1", 10);

const TASKS = [
  { name: "simple-math", prompt: "What is 2+2? Answer with just the number." },
  { name: "read-file", prompt: "Read the file OPENCODE.md and tell me how many lines it has. Answer with just the number." },
  { name: "list-files", prompt: "List the files in the current directory. Just list the names, nothing else." },
];

function pickTokens(event) {
  // Formas toleradas del evento: part.tokens (actual), tokens directo o message.tokens.
  // Sin esta tolerancia, un cambio de formato produce ceros silenciosos.
  const candidates = [
    event && event.part && event.part.tokens,
    event && event.tokens,
    event && event.message && event.message.tokens,
  ];
  for (const t of candidates) {
    if (t && typeof t === "object") {
      const cache = t.cache && typeof t.cache === "object" ? t.cache : {};
      const read = typeof cache.read === "number" ? cache.read : (typeof t.cache_read === "number" ? t.cache_read : 0);
      return {
        input: t.input || 0,
        output: t.output || 0,
        reasoning: t.reasoning || 0,
        cacheRead: read,
        cacheWrite: cache.write || 0,
        total: t.total || 0,
      };
    }
  }
  return null;
}

function isStepFinish(event) {
  if (!event || typeof event !== "object") return false;
  if (event.type === "step_finish") return true;
  const pt = event.part && event.part.type;
  return pt === "step-finish" || pt === "step_finish";
}

function runSession(task) {
  console.log(`\n--- Running: ${task.name} ---`);
  try {
    const output = execSync(
      `opencode run --model ${MODEL} --format json "${task.prompt.replace(/"/g, '\\"')}"`,
      { cwd: rootDir, encoding: "utf-8", timeout: 180000, stdio: ["pipe", "pipe", "pipe"] }
    );

    const lines = output.split("\n").filter((l) => l.trim().startsWith("{"));
    const steps = [];

    for (const line of lines) {
      try {
        const event = JSON.parse(line);
        if (!isStepFinish(event)) continue;
        const tok = pickTokens(event);
        if (!tok) continue;
        const cost = typeof event.cost === "number" ? event.cost : (event.part && typeof event.part.cost === "number" ? event.part.cost : 0);
        steps.push({ ...tok, cost });
      } catch {
        // ignore non-JSON lines
      }
    }

    return { task: task.name, steps, success: true };
  } catch (err) {
    console.error(`  Error: ${err.message}`);
    return { task: task.name, steps: [], success: false, error: err.message };
  }
}

function calcStats(values) {
  if (values.length === 0) return { count: 0, min: 0, max: 0, avg: 0, median: 0, p90: 0 };
  const sorted = [...values].sort((a, b) => a - b);
  const sum = sorted.reduce((a, b) => a + b, 0);
  return {
    count: sorted.length,
    min: sorted[0],
    max: sorted[sorted.length - 1],
    avg: Math.round(sum / sorted.length),
    median: sorted[Math.floor(sorted.length / 2)],
    p90: sorted[Math.floor(sorted.length * 0.9)] || sorted[sorted.length - 1],
  };
}

function formatNumber(n) {
  return n.toLocaleString("en-US");
}

console.log("=".repeat(60));
console.log("MEDICIÓN DE TOKENS — OpenCode");
console.log("=".repeat(60));
console.log(`Sesiones por tarea: ${NUM_SESSIONS}`);
console.log(`Tareas: ${TASKS.map((t) => t.name).join(", ")}`);
console.log("=".repeat(60));

const allResults = [];

for (const task of TASKS) {
  for (let i = 0; i < NUM_SESSIONS; i++) {
    const result = runSession(task);
    allResults.push(result);
  }
}

console.log("\n" + "=".repeat(60));
console.log("RESULTADOS (agregados por sesion: el input real viaja en cache.write/read)");
console.log("=".repeat(60));

// Agregacion por sesion: promediar por paso produce numeros enganosos
// ("input avg 6") porque el input cacheado se cuenta en cache.write/read.
const sessionTotals = [];
for (const result of allResults) {
  if (!result.success) continue;
  const sum = { input: 0, output: 0, reasoning: 0, cacheRead: 0, cacheWrite: 0, total: 0, cost: 0, task: result.task };
  for (const step of result.steps) {
    sum.input += step.input || 0;
    sum.output += step.output || 0;
    sum.reasoning += step.reasoning || 0;
    sum.cacheRead += step.cacheRead || 0;
    sum.cacheWrite += step.cacheWrite || 0;
    sum.total += step.total || 0;
    sum.cost += step.cost || 0;
  }
  sessionTotals.push(sum);
}

// Fail-closed: sin steps parseados no hay medicion; no escribir reporte basura.
const parsedSteps = allResults.reduce((n, r) => n + (r.steps ? r.steps.length : 0), 0);
if (parsedSteps === 0) {
  console.error("ERROR: no se pudo parsear ningun step_finish con tokens. Revisa el formato de `opencode run --format json`.");
  process.exit(1);
}

const allInputs = sessionTotals.map((s) => s.input);
const allOutputs = sessionTotals.map((s) => s.output);
const allReasoning = sessionTotals.map((s) => s.reasoning);
const allCacheRead = sessionTotals.map((s) => s.cacheRead);
const allCacheWrite = sessionTotals.map((s) => s.cacheWrite);
const allTotals = sessionTotals.map((s) => s.total);
const allCosts = sessionTotals.map((s) => s.cost);
// Sesiones pedidas vs medidas: un fallo parcial no puede pasar por OK.
const requested = TASKS.length * NUM_SESSIONS;
const measured = allResults.length;
const okSessions = allResults.filter((r) => r.success).length;

const inputStats = calcStats(allInputs);
const outputStats = calcStats(allOutputs);
const reasoningStats = calcStats(allReasoning);
const cacheReadStats = calcStats(allCacheRead);
const cacheWriteStats = calcStats(allCacheWrite);
const totalStats = calcStats(allTotals);
const costStats = calcStats(allCosts);

console.log("\n--- Tokens de ENTRADA (input) ---");
console.log(`  Count: ${inputStats.count}`);
console.log(`  Min:   ${formatNumber(inputStats.min)}`);
console.log(`  Max:   ${formatNumber(inputStats.max)}`);
console.log(`  Avg:   ${formatNumber(inputStats.avg)}`);
console.log(`  Median:${formatNumber(inputStats.median)}`);
console.log(`  P90:   ${formatNumber(inputStats.p90)}`);

console.log("\n--- Tokens de SALIDA (output) ---");
console.log(`  Count: ${outputStats.count}`);
console.log(`  Min:   ${formatNumber(outputStats.min)}`);
console.log(`  Max:   ${formatNumber(outputStats.max)}`);
console.log(`  Avg:   ${formatNumber(outputStats.avg)}`);
console.log(`  Median:${formatNumber(outputStats.median)}`);
console.log(`  P90:   ${formatNumber(outputStats.p90)}`);

console.log("\n--- Tokens de RAZONAMIENTO (reasoning) ---");
console.log(`  Count: ${reasoningStats.count}`);
console.log(`  Min:   ${formatNumber(reasoningStats.min)}`);
console.log(`  Max:   ${formatNumber(reasoningStats.max)}`);
console.log(`  Avg:   ${formatNumber(reasoningStats.avg)}`);
console.log(`  Median:${formatNumber(reasoningStats.median)}`);
console.log(`  P90:   ${formatNumber(reasoningStats.p90)}`);

console.log("\n--- Tokens de CACHE (read) ---");
console.log(`  Count: ${cacheReadStats.count}`);
console.log(`  Min:   ${formatNumber(cacheReadStats.min)}`);
console.log(`  Max:   ${formatNumber(cacheReadStats.max)}`);
console.log(`  Avg:   ${formatNumber(cacheReadStats.avg)}`);
console.log(`  Median:${formatNumber(cacheReadStats.median)}`);
console.log(`  P90:   ${formatNumber(cacheReadStats.p90)}`);

console.log("\n--- Tokens de CACHE (write) ---");
console.log(`  Count: ${cacheWriteStats.count}`);
console.log(`  Min:   ${formatNumber(cacheWriteStats.min)}`);
console.log(`  Max:   ${formatNumber(cacheWriteStats.max)}`);
console.log(`  Avg:   ${formatNumber(cacheWriteStats.avg)}`);
console.log(`  Median:${formatNumber(cacheWriteStats.median)}`);
console.log(`  P90:   ${formatNumber(cacheWriteStats.p90)}`);

console.log("\n--- Tokens TOTALES ---");
console.log(`  Count: ${totalStats.count}`);
console.log(`  Min:   ${formatNumber(totalStats.min)}`);
console.log(`  Max:   ${formatNumber(totalStats.max)}`);
console.log(`  Avg:   ${formatNumber(totalStats.avg)}`);
console.log(`  Median:${formatNumber(totalStats.median)}`);
console.log(`  P90:   ${formatNumber(totalStats.p90)}`);

console.log("\n--- POR TAREA ---");
for (const task of TASKS) {
  const taskTotals = sessionTotals.filter((s) => s.task === task.name);
  console.log(`\n  ${task.name}:`);
  const tIn = taskTotals.map((s) => s.input + s.cacheWrite);
  const tOut = taskTotals.map((s) => s.output);
  const tCost = taskTotals.reduce((n, s) => n + s.cost, 0);
  console.log(`    Input (nuevo+write): ${formatNumber(calcStats(tIn).avg)} avg`);
  console.log(`    Output avg:          ${formatNumber(calcStats(tOut).avg)}`);
  console.log(`    Costo total:         $${tCost.toFixed(6)}`);
}

console.log("\n" + "=".repeat(60));
console.log("CONCLUSIONES");
console.log("=".repeat(60));

const freshInput = inputStats.avg + cacheWriteStats.avg;
const cachedShare = freshInput + cacheReadStats.avg > 0 ? ((cacheReadStats.avg / (freshInput + cacheReadStats.avg)) * 100).toFixed(1) : "0";
console.log(`\n1. Cache: ${cachedShare}% del input por sesion viene de cache (read ${formatNumber(cacheReadStats.avg)} vs nuevo+write ${formatNumber(freshInput)})`);
console.log(`   ${cacheReadStats.avg === 0 ? "NO se está usando caché" : "El caché está funcionando"}`);

const ioRatio = outputStats.avg > 0 ? (totalStats.avg / outputStats.avg).toFixed(1) : "∞";
console.log(`\n2. Ratio total/output por sesion: ${ioRatio}x`);
console.log(`   ${totalStats.avg > outputStats.avg * 5 ? "El input domina (contexto pesado)" : "Balance razonable"}`);

const reasoningRatio = totalStats.avg > 0 ? ((reasoningStats.avg / totalStats.avg) * 100).toFixed(1) : "0";
console.log(`\n3. Reasoning ratio: ${reasoningRatio}% del total es razonamiento`);
console.log(`   ${reasoningStats.avg > totalStats.avg * 0.3 ? "Alto razonamiento (modelo pensando mucho)" : "Razonamiento normal"}`);

const totalCost = allCosts.reduce((n, v) => n + v, 0);
console.log(`\n4. Costo total medido: $${totalCost.toFixed(6)} en ${sessionTotals.length} sesiones`);

console.log(`\n5. Modelo: ${MODEL}`);
console.log(`   Sesiones: ${NUM_SESSIONS} | Tareas: ${TASKS.map((t) => t.name).join(", ")}`);
   Sesiones pedidas: ${requested} | ejecutadas: ${measured} | con exito: ${okSessions}`;

console.log("\n" + "=".repeat(60));

// Guardar resultados en JSON
const medicionesDir = join(rootDir, "docs", "harness", "mediciones");
mkdirSync(medicionesDir, { recursive: true });
const date = new Date().toISOString().split("T")[0];
const reportPath = join(medicionesDir, `${date}.json`);
const report = {
  timestamp: new Date().toISOString(),
  model: MODEL,
  numSessionsRequested: requested,
  numSessionsExecuted: measured,
  numSessionsOk: okSessions,
  tasks: TASKS.map((t) => t.name),
  stats: {
    input: inputStats,
    output: outputStats,
    reasoning: reasoningStats,
    cacheRead: cacheReadStats,
    cacheWrite: cacheWriteStats,
    total: totalStats,
  },
  conclusions: {
    cacheShare: `${cachedShare}%`,
    inputOutputRatio: `${ioRatio}x`,
    reasoningRatio: `${reasoningRatio}%`,
    totalCost: totalCost,
  },
  sessions: sessionTotals,
  raw: allResults,
};

writeFileSync(reportPath, JSON.stringify(report, null, 2));
console.log(`\nReporte guardado en: ${reportPath}`);
