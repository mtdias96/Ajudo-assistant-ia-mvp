import { NutritionKnowledge } from '@application/services/nutrition/NutritionKnowledge';
import { EmbeddingsGateway } from '@infrastructure/gateways/EmbeddingsGateway';
import { QdrantGateway } from '@infrastructure/gateways/QdrantGateway';
import { Injectable } from '@kernel/decorators/Injectable';
import { AppConfig } from '@shared/config/AppConfig';

import { NutritionPoint } from '../points/NutritionPoint';

@Injectable()
export class NutritionKnowledgeRepository {
  private static readonly DEFAULT_VECTOR_SIZE = 768;

  constructor(
    private readonly config: AppConfig,
    private readonly qdrantGateway: QdrantGateway,
    private readonly embeddingsGateway: EmbeddingsGateway,
  ) { }

  async ensureCollection(vectorSize: number = NutritionKnowledgeRepository.DEFAULT_VECTOR_SIZE): Promise<void> {
    await this.qdrantGateway.ensureCollection({
      collection: this.config.qdrant.collections.nutrition,
      vectorSize,
    });
  }

  async upsertMany(entries: NutritionKnowledge[]): Promise<void> {
    if (entries.length === 0) {
      return;
    }

    const { vectors } = await this.embeddingsGateway.embed({
      input: entries.map(NutritionPoint.buildEmbeddingText),
      taskType: 'RETRIEVAL_DOCUMENT',
    });

    await this.qdrantGateway.upsert<NutritionPoint.Payload>({
      collection: this.config.qdrant.collections.nutrition,
      points: entries.map((entry, index) => ({
        id: entry.id,
        vector: vectors[index],
        payload: NutritionPoint.toPayload(entry),
      })),
    });
  }

  async searchByName(input: NutritionKnowledgeRepository.SearchInput): Promise<NutritionKnowledgeRepository.SearchMatch[]> {
    const [matches] = await this.searchByNames({
      queries: [input.query],
      limit: input.limit,
      scoreThreshold: input.scoreThreshold,
    });

    return matches ?? [];
  }

  async searchByNames({
    queries,
    limit = 3,
    scoreThreshold,
  }: NutritionKnowledgeRepository.SearchManyInput): Promise<NutritionKnowledgeRepository.SearchMatch[][]> {
    if (queries.length === 0) {
      return [];
    }

    const { vectors } = await this.embeddingsGateway.embed({
      input: queries,
      taskType: 'RETRIEVAL_QUERY',
    });

    const results = await this.qdrantGateway.searchBatch<NutritionPoint.Payload>({
      collection: this.config.qdrant.collections.nutrition,
      searches: vectors.map(vector => ({ vector, limit, scoreThreshold })),
    });

    return results.map(({ matches }) => matches.map(match => ({
      score: match.score,
      knowledge: NutritionPoint.toEntity(match.payload),
    })));
  }
}

export namespace NutritionKnowledgeRepository {
  export type SearchInput = {
    query: string;
    limit?: number;
    scoreThreshold?: number;
  };

  export type SearchManyInput = {
    queries: string[];
    limit?: number;
    scoreThreshold?: number;
  };

  export type SearchMatch = {
    score: number;
    knowledge: NutritionKnowledge;
  };
}
