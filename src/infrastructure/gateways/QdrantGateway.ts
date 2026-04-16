import { qdrantClient } from '@infrastructure/clients/qdrant/qdrantClient';
import { Injectable } from '@kernel/decorators/Injectable';

@Injectable()
export class QdrantGateway {
  async ensureCollection({
    collection,
    vectorSize,
    distance = 'Cosine',
  }: QdrantGateway.EnsureCollectionInput): Promise<void> {
    const { exists } = await qdrantClient.collectionExists(collection);

    if (exists) {
      return;
    }

    await qdrantClient.createCollection(collection, {
      vectors: {
        size: vectorSize,
        distance,
      },
    });
  }

  async upsert<TPayload extends Record<string, unknown>>({
    collection,
    points,
  }: QdrantGateway.UpsertInput<TPayload>): Promise<void> {
    if (points.length === 0) {
      return;
    }

    await qdrantClient.upsert(collection, {
      wait: true,
      points: points.map(point => ({
        id: point.id,
        vector: point.vector,
        payload: point.payload,
      })),
    });
  }

  async search<TPayload extends Record<string, unknown>>({
    collection,
    vector,
    limit = 5,
    scoreThreshold,
  }: QdrantGateway.SearchInput): Promise<QdrantGateway.SearchResult<TPayload>> {
    const [result] = await this.searchBatch<TPayload>({
      collection,
      searches: [{ vector, limit, scoreThreshold }],
    });

    return result ?? { matches: [] };
  }

  async searchBatch<TPayload extends Record<string, unknown>>({
    collection,
    searches,
  }: QdrantGateway.SearchBatchInput): Promise<QdrantGateway.SearchResult<TPayload>[]> {
    if (searches.length === 0) {
      return [];
    }

    const response = await qdrantClient.searchBatch(collection, {
      searches: searches.map(({ vector, limit = 5, scoreThreshold }) => ({
        vector,
        limit,
        with_payload: true,
        ...(scoreThreshold !== undefined && { score_threshold: scoreThreshold }),
      })),
    });

    return response.map(hits => ({
      matches: hits.map(hit => ({
        id: hit.id,
        score: hit.score,
        payload: (hit.payload ?? {}) as TPayload,
      })),
    }));
  }
}

export namespace QdrantGateway {
  export type Distance = 'Cosine' | 'Euclid' | 'Dot' | 'Manhattan';

  export type PointId = string | number;

  export type Point<TPayload extends Record<string, unknown>> = {
    id: PointId;
    vector: number[];
    payload: TPayload;
  };

  export type EnsureCollectionInput = {
    collection: string;
    vectorSize: number;
    distance?: Distance;
  };

  export type UpsertInput<TPayload extends Record<string, unknown>> = {
    collection: string;
    points: Point<TPayload>[];
  };

  export type SearchInput = {
    collection: string;
    vector: number[];
    limit?: number;
    scoreThreshold?: number;
  };

  export type SearchQuery = {
    vector: number[];
    limit?: number;
    scoreThreshold?: number;
  };

  export type SearchBatchInput = {
    collection: string;
    searches: SearchQuery[];
  };

  export type SearchMatch<TPayload extends Record<string, unknown>> = {
    id: PointId;
    score: number;
    payload: TPayload;
  };

  export type SearchResult<TPayload extends Record<string, unknown>> = {
    matches: SearchMatch<TPayload>[];
  };
}
