import { genai } from '@infrastructure/clients/ia/geminiClient';
import { Injectable } from '@kernel/decorators/Injectable';
import { AppConfig } from '@shared/config/AppConfig';

type CacheEntry = { vector: number[]; expiresAt: number };

@Injectable()
export class EmbeddingsGateway {
  private static readonly CACHE_TTL_MS = 30 * 60 * 1000;
  private static readonly CACHE_MAX_SIZE = 200;

  private readonly cache = new Map<string, CacheEntry>();

  constructor(private readonly config: AppConfig) { }

  async embed({
    input,
    taskType = 'RETRIEVAL_DOCUMENT',
  }: EmbeddingsGateway.EmbedInput): Promise<EmbeddingsGateway.EmbedResult> {
    const inputs = Array.isArray(input) ? input : [input];

    if (inputs.length === 0) {
      return { vectors: [] };
    }

    const now = Date.now();
    const results: (number[] | null)[] = inputs.map(text => {
      const key = this.cacheKey(text, taskType);
      const entry = this.cache.get(key);
      if (entry && entry.expiresAt > now) {
        return entry.vector;
      }
      this.cache.delete(key);
      return null;
    });

    const uncachedIndices = results
      .map((v, i) => (v === null ? i : -1))
      .filter(i => i !== -1);

    if (uncachedIndices.length > 0) {
      const uncachedTexts = uncachedIndices.map(i => inputs[i]);
      const freshVectors = await this.fetchEmbeddings(uncachedTexts, taskType);

      for (let j = 0; j < uncachedIndices.length; j++) {
        const idx = uncachedIndices[j];
        const vector = freshVectors[j];
        results[idx] = vector;

        const key = this.cacheKey(inputs[idx], taskType);
        this.putCache(key, vector, now);
      }
    }

    return { vectors: results as number[][] };
  }

  private async fetchEmbeddings(
    texts: string[],
    taskType: EmbeddingsGateway.TaskType,
  ): Promise<number[][]> {
    const response = await genai.models.embedContent({
      model: this.config.vertexai.embeddingModel,
      contents: texts,
      config: { taskType },
    });

    const embeddings = response.embeddings ?? [];

    return embeddings.map(embedding => {
      const values = embedding.values;
      if (!values) {
        throw new Error('Empty embedding returned from AI provider.');
      }
      return values;
    });
  }

  private cacheKey(text: string, taskType: string): string {
    return `${taskType}:${text.toLowerCase().trim()}`;
  }

  private putCache(key: string, vector: number[], now: number): void {
    if (this.cache.size >= EmbeddingsGateway.CACHE_MAX_SIZE) {
      const firstKey = this.cache.keys().next().value!;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      vector,
      expiresAt: now + EmbeddingsGateway.CACHE_TTL_MS,
    });
  }
}

export namespace EmbeddingsGateway {
  export type TaskType =
    | 'RETRIEVAL_DOCUMENT'
    | 'RETRIEVAL_QUERY'
    | 'SEMANTIC_SIMILARITY'
    | 'CLASSIFICATION'
    | 'CLUSTERING';

  export type EmbedInput = {
    input: string | string[];
    taskType?: TaskType;
  };

  export type EmbedResult = {
    vectors: number[][];
  };
}
