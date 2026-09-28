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
  { name: "read-file", prompt: "Read the file AGENTS.md and tell me how many lines it has. Answer with just the number." },
  { name: "list-files", prompt: "List the files in the current directory. Just list the names, nothing else." },
];

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
        if (event.type === "step_finish" && event.part?.tokens) {
          steps.push({
            input: event.part.tokens.input || 0,
            output: event.part.tokens.output || 0,
            reasoning: event.part.tokens.reasoning || 0,
            cacheRead: event.part.tokens.cache?.read || 0,
            cacheWrite: event.part.tokens.cache?.write || 0,
            total: event.part.tokens.total || 0,
          });
        }
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
console.log("RESULTADOS");
console.log("=".repeat(60));

const allInputs = [];
const allOutputs = [];
const allReasoning = [];
const allCacheRead = [];
const allCacheWrite = [];
const allTotals = [];

for (const result of allResults) {
  if (!result.success) continue;
  for (const step of result.steps) {
    allInputs.push(step.input);
    allOutputs.push(step.output);
    allReasoning.push(step.reasoning);
    allCacheRead.push(step.cacheRead);
    allCacheWrite.push(step.cacheWrite);
    allTotals.push(step.total);
  }
}

const inputStats = calcStats(allInputs);
const outputStats = calcStats(allOutputs);
const reasoningStats = calcStats(allReasoning);
const cacheReadStats = calcStats(allCacheRead);
const cacheWriteStats = calcStats(allCacheWrite);
const totalStats = calcStats(allTotals);

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
  const taskResults = allResults.filter((r) => r.task === task.name && r.success);
  const taskInputs = [];
  const taskOutputs = [];
  for (const r of taskResults) {
    for (const s of r.steps) {
      taskInputs.push(s.input);
      taskOutputs.push(s.output);
    }
  }
  const taskInputStats = calcStats(taskInputs);
  const taskOutputStats = calcStats(taskOutputs);
  console.log(`\n  ${task.name}:`);
  console.log(`    Input avg:  ${formatNumber(taskInputStats.avg)}`);
  console.log(`    Output avg: ${formatNumber(taskOutputStats.avg)}`);
}

console.log("\n" + "=".repeat(60));
console.log("CONCLUSIONES");
console.log("=".repeat(60));

const cacheRatio = inputStats.avg > 0 ? ((cacheReadStats.avg / inputStats.avg) * 100).toFixed(1) : "0";
console.log(`\n1. Cache ratio: ${cacheRatio}% de input viene de cache`);
console.log(`   ${cacheReadStats.avg === 0 ? "NO se está usando caché" : "El caché está funcionando"}`);

const inputOutputRatio = outputStats.avg > 0 ? (inputStats.avg / outputStats.avg).toFixed(1) : "∞";
console.log(`\n2. Ratio input/output: ${inputOutputRatio}x`);
console.log(`   ${inputStats.avg > outputStats.avg * 5 ? "El input domina (contexto pesado)" : "Balance razonable"}`);

const reasoningRatio = inputStats.avg > 0 ? ((reasoningStats.avg / inputStats.avg) * 100).toFixed(1) : "0";
console.log(`\n3. Reasoning ratio: ${reasoningRatio}% del input es razonamiento`);
console.log(`   ${reasoningStats.avg > inputStats.avg * 0.3 ? "Alto razonamiento (modelo pensando mucho)" : "Razonamiento normal"}`);

console.log(`\n4. Modelo: ${MODEL}`);
console.log(`   Sesiones: ${NUM_SESSIONS} | Tareas: ${TASKS.map((t) => t.name).join(", ")}`);

console.log("\n" + "=".repeat(60));

// Guardar resultados en JSON
const medicionesDir = join(rootDir, "docs", "harness", "mediciones");
mkdirSync(medicionesDir, { recursive: true });
const date = new Date().toISOString().split("T")[0];
const reportPath = join(medicionesDir, `${date}.json`);
const report = {
  timestamp: new Date().toISOString(),
  model: MODEL,
  numSessions: NUM_SESSIONS,
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
    cacheRatio: `${cacheRatio}%`,
    inputOutputRatio: `${inputOutputRatio}x`,
    reasoningRatio: `${reasoningRatio}%`,
  },
  raw: allResults,
};

writeFileSync(reportPath, JSON.stringify(report, null, 2));
console.log(`\nReporte guardado en: ${reportPath}`);
