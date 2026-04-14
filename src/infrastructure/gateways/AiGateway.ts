
import { vertexai } from '@infrastructure/clients/ia/geminiClient';
import { Injectable } from '@kernel/decorators/Injectable';

@Injectable()
export class AiGateway {
  async chat({
    messages,
    model,
    temperature,
    maxOutputTokens,
  }: AiGateway.ChatInput): Promise<AiGateway.ChatResult> {
    const systemMessage = messages.find(msg => msg.role === 'system');
    const conversationMessages = messages.filter(msg => msg.role !== 'system');

    const generativeModel = vertexai.getGenerativeModel({
      model: model ?? 'gemini-2.5-flash-lite',
      ...(systemMessage && {
        systemInstruction: {
          parts: [{ text: systemMessage.content }],
          role: 'system',
        },
      }),
      generationConfig: {
        ...(temperature !== undefined && { temperature }),
        ...(maxOutputTokens !== undefined && { maxOutputTokens }),
      },
    });

    const response = await generativeModel.generateContent({
      contents: conversationMessages.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      })),
    });

    const content =
      response.response.candidates?.[0]?.content?.parts?.[0]?.text;

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
  }: AiGateway.AnalyzeImageInput): Promise<AiGateway.ChatResult> {
    const generativeModel = vertexai.getGenerativeModel({
      model: model ?? 'gemini-2.5-flash',
      systemInstruction: {
        parts: [{ text: systemPrompt }],
        role: 'system',
      },
      generationConfig: {
        ...(temperature !== undefined && { temperature }),
        ...(maxOutputTokens !== undefined && { maxOutputTokens }),
      },
    });

    const response = await generativeModel.generateContent({
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
    });

    const content =
      response.response.candidates?.[0]?.content?.parts?.[0]?.text;

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
  };

  export type ChatResult = {
    content: string;
  };
}
