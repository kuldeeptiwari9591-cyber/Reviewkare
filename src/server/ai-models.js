// @ts-check
"use strict";

/**
 * Allowlisted models. The client never chooses a model: only IDs in this file
 * can be selected through `AI_MODELS`, so a compromised or careless request
 * cannot route review text to an arbitrary provider.
 *
 * Prices are public OpenRouter list prices in USD per million tokens, used only
 * to estimate spend when the provider omits a cost. Free endpoints are priced 0.
 */
const MODELS = [
  // Zero-cost set. Useful for a pilot, but free endpoints usually have tight
  // rate limits and may have different retention/training policies.
  {
    id: "google/gemma-4-31b-it:free",
    label: "Gemma 4 31B",
    style: "Warm",
    promptPrice: 0,
    completionPrice: 0,
    free: true,
  },
  {
    id: "nvidia/nemotron-3.5-lightning:free",
    label: "Nemotron 3.5 Lightning",
    style: "Concise",
    promptPrice: 0,
    completionPrice: 0,
    free: true,
  },
  {
    id: "inclusionai/ling-3.2-flash:free",
    label: "Ling 3.2 Flash",
    style: "Direct",
    promptPrice: 0,
    completionPrice: 0,
    free: true,
  },
  {
    id: "baidu/ernie-5.5-flash-preview:free",
    label: "ERNIE 5.5 Flash",
    style: "Formal",
    promptPrice: 0,
    completionPrice: 0,
    free: true,
  },
  {
    id: "nvidia/nemotron-3-ultra-550b-a55b:free",
    label: "Nemotron 3 Ultra",
    style: "Detailed",
    promptPrice: 0,
    completionPrice: 0,
    free: true,
  },
  // Low-cost paid set. Recommended for production after the bake-off.
  {
    id: "google/gemini-2.5-flash-lite",
    label: "Gemini 2.5 Flash Lite",
    style: "Concise",
    promptPrice: 0.1,
    completionPrice: 0.4,
    free: false,
  },
  {
    id: "openai/gpt-5-nano",
    label: "GPT-5 Nano",
    style: "Direct",
    promptPrice: 0.05,
    completionPrice: 0.4,
    free: false,
  },
  {
    id: "anthropic/claude-haiku-5.5",
    label: "Claude Haiku 5.5",
    style: "Empathetic",
    promptPrice: 0.1,
    completionPrice: 0.5,
    free: false,
  },
  {
    id: "meta-llama/llama-4-scout",
    label: "Llama 4 Scout",
    style: "Warm",
    promptPrice: 0.1,
    completionPrice: 0.3,
    free: false,
  },
  {
    id: "deepseek/deepseek-v4-flash-0731",
    label: "DeepSeek V4 Flash",
    style: "Plain English",
    promptPrice: 0.06,
    completionPrice: 0.18,
    free: false,
  },
];

const FREE_MODELS = MODELS.filter((model) => model.free).map(
  (model) => model.id,
);
const PAID_MODELS = MODELS.filter((model) => !model.free).map(
  (model) => model.id,
);

/**
 * @param {string} id
 * @returns {(typeof MODELS)[number] | null}
 */
function findModel(id) {
  return MODELS.find((model) => model.id === id) || null;
}

/**
 * Resolve an environment list into allowlisted models. Unknown IDs are
 * reported instead of silently becoming a request to an arbitrary model.
 *
 * @param {string | undefined} value
 * @returns {{ models: Array<(typeof MODELS)[number]>, unknown: string[] }}
 */
function resolveModels(value) {
  const requested = String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  const ids = requested.length ? requested : FREE_MODELS;
  /** @type {Array<(typeof MODELS)[number]>} */
  const models = [];
  const unknown = [];
  for (const id of ids) {
    const model = findModel(id);
    if (!model) {
      unknown.push(id);
      continue;
    }
    if (!models.some((item) => item.id === model.id)) models.push(model);
  }
  return { models: models.slice(0, 5), unknown };
}

module.exports = {
  MODELS,
  FREE_MODELS,
  PAID_MODELS,
  findModel,
  resolveModels,
};
