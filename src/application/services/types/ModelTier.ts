/**
 * Orquestração de modelos por complexidade da tarefa.
 * Cada tier define modelo, temperatura e limite de tokens.
 * Adicione novos tiers conforme necessidade (ex: "pro" para PDFs/contratos).
 */
export type ModelTier = 'lite' | 'fast' | 'standard' | 'visual' | 'pro';

export type ThinkingLevel = 'low' | 'medium' | 'high';

type ModelConfig = {
  model: string;
  temperature: number;
  maxOutputTokens: number;
  thinkingLevel?: ThinkingLevel;
};

export const MODEL_TIERS: Record<ModelTier, ModelConfig> = {
  lite: {
    model: 'gemini-2.5-flash-lite',
    temperature: 0,
    maxOutputTokens: 256,
  },
  fast: {
    model: 'gemini-2.5-flash-lite',
    temperature: 0,
    maxOutputTokens: 2048,
  },
  standard: {
    model: 'gemini-2.5-flash',
    temperature: 0,
    maxOutputTokens: 4096,
  },
  visual: {
    model: 'gemini-2.5-flash',
    temperature: 0,
    maxOutputTokens: 4096,
  },
  pro: {
    model: 'gemini-2.5-pro',
    temperature: 0,
    maxOutputTokens: 4096,
  },
};

export const INTENT_MODEL_MAP: Record<string, ModelTier> = {
  extraction: 'fast',
  reranking: 'lite',
  nutrition: 'standard',
  nutrition_visual: 'visual',
  nutrition_estimation: 'fast',
  unknown: 'lite',
};
