import { Schema, ThinkingLevel as SdkThinkingLevel } from '@google/genai';

import { genai } from '@infrastructure/clients/ia/geminiClient';
import { Injectable } from '@kernel/decorators/Injectable';

import { ThinkingLevel } from '@application/services/types/ModelTier';

const THINKING_LEVEL_MAP: Record<ThinkingLevel, SdkThinkingLevel> = {
  low: SdkThinkingLevel.LOW,
  medium: SdkThinkingLevel.MEDIUM,
  high: SdkThinkingLevel.HIGH,
};

@Injectable()
export class AiGateway {
  async chat({
    messages,
    model,
    temperature,
    maxOutputTokens,
    thinkingLevel,
    responseSchema,
  }: AiGateway.ChatInput): Promise<AiGateway.ChatResult> {
    const systemMessage = messages.find(msg => msg.role === 'system');
    const conversationMessages = messages.filter(msg => msg.role !== 'system');

    const response = await genai.models.generateContent({
      model: model ?? 'gemini-2.5-flash-lite',
      contents: conversationMessages.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      })),
      config: {
        ...(systemMessage && { systemInstruction: systemMessage.content }),
        ...(temperature !== undefined && { temperature }),
        ...(maxOutputTokens !== undefined && { maxOutputTokens }),
        ...(thinkingLevel && {
          thinkingConfig: { thinkingLevel: THINKING_LEVEL_MAP[thinkingLevel] },
        }),
        ...(responseSchema && {
          responseMimeType: 'application/json',
          responseSchema,
        }),
      },
    });

    const content = response.text;

    if (!content) {
      throw new Error('Empty response from AI provider.');
    }

    return { content };
  }

  async analyzeImage({
    systemPrompt,
    image,
    model,
    temperature,
    maxOutputTokens,
    thinkingLevel,
    responseSchema,
  }: AiGateway.AnalyzeImageInput): Promise<AiGateway.ChatResult> {
    const response = await genai.models.generateContent({
      model: model ?? 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                mimeType: image.mimeType,
                data: image.base64,
              },
            },
          ],
        },
      ],
      config: {
        systemInstruction: systemPrompt,
        ...(temperature !== undefined && { temperature }),
        ...(maxOutputTokens !== undefined && { maxOutputTokens }),
        ...(thinkingLevel && {
          thinkingConfig: { thinkingLevel: THINKING_LEVEL_MAP[thinkingLevel] },
        }),
        ...(responseSchema && {
          responseMimeType: 'application/json',
          responseSchema,
        }),
      },
    });

    const content = response.text;

    if (!content) {
      throw new Error('Empty response from AI provider.');
    }

    return { content };
  }
}

export namespace AiGateway {
  export type Message = {
    role: 'system' | 'user' | 'assistant';
    content: string;
  };

  export type ChatInput = {
    messages: Message[];
    model?: string;
    temperature?: number;
    maxOutputTokens?: number;
    thinkingLevel?: ThinkingLevel;
    responseSchema?: Schema;
  };

  export type ImagePayload = {
    mimeType: string;
    base64: string;
  };

  export type AnalyzeImageInput = {
    systemPrompt: string;
    image: ImagePayload;
    model?: string;
    temperature?: number;
    maxOutputTokens?: number;
    thinkingLevel?: ThinkingLevel;
    responseSchema?: Schema;
  };

  export type ChatResult = {
    content: string;
  };
}
