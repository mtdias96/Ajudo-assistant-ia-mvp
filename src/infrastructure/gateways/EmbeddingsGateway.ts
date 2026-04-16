import { vertexAuth } from '@infrastructure/clients/ia/vertexEmbeddingsClient';
import { Injectable } from '@kernel/decorators/Injectable';
import { AppConfig } from '@shared/config/AppConfig';

@Injectable()
export class EmbeddingsGateway {
  constructor(private readonly config: AppConfig) { }

  async embed({
    input,
    taskType = 'RETRIEVAL_DOCUMENT',
  }: EmbeddingsGateway.EmbedInput): Promise<EmbeddingsGateway.EmbedResult> {
    const inputs = Array.isArray(input) ? input : [input];

    if (inputs.length === 0) {
      return { vectors: [] };
    }

    const { project, location, embeddingModel } = this.config.vertexai;
    const url = `https://${location}-aiplatform.googleapis.com/v1/projects/${project}/locations/${location}/publishers/google/models/${embeddingModel}:predict`;

    const client = await vertexAuth.getClient();

    const { data } = await client.request<EmbeddingsGateway.PredictResponse>({
      url,
      method: 'POST',
      data: {
        instances: inputs.map(content => ({ content, task_type: taskType })),
      },
    });

    const vectors = data.predictions.map(prediction => prediction.embeddings.values);

    return { vectors };
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

  export type PredictResponse = {
    predictions: {
      embeddings: {
        values: number[];
      };
    }[];
  };
}
