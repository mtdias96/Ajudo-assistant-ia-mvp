/**
 * Orquestração de modelos por complexidade da tarefa.
 * Cada tier define modelo, temperatura e limite de tokens.
 * Adicione novos tiers conforme necessidade (ex: "pro" para PDFs/contratos).
 */
export type ModelTier = 'lite' | 'standard';

type ModelConfig = {
  model: string;
  temperature: number;
  maxOutputTokens: number;
};

export const MODEL_TIERS: Record<ModelTier, ModelConfig> = {
  lite: {
    model: 'gemini-2.5-flash-lite',
    temperature: 0,
    maxOutputTokens: 256,
  },
  standard: {
    model: 'gemini-2.5-flash',
    temperature: 0,
    maxOutputTokens: 4096,
  },
  // pro: {
  //   model: 'gemini-1.5-pro',
  //   temperature: 0,
  //   maxOutputTokens: 4096,
  // },
};

/**
 * Mapeia cada intent ao tier de modelo adequado.
 * Extração é sempre lite. Processamento varia por domínio.
 */
export const INTENT_MODEL_MAP: Record<string, ModelTier> = {
  extraction: 'standard',
  nutrition: 'standard',
  unknown: 'lite',
  // schedule: 'standard',
  // finance: 'standard',
  // document: 'pro',
};
