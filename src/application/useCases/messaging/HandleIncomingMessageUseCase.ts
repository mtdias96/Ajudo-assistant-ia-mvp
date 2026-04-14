import { Meal } from '@application/entities/Meal';
import { CompleteProfile } from '@application/entities/Profile';
import { AiService } from '@application/services/AiService';
import { GENERAL_CHAT_PROMPT } from '@application/services/prompts/generalChat';
import { ExtractedIntent } from '@application/services/types/ExtractedIntent';
import { Injectable } from '@kernel/decorators/Injectable';
import { AnalyzeNutritionUseCase } from '../nutrition/AnalyzeNutritionUseCase';
import { EditLastMealUseCase } from '../nutrition/EditLastMealUseCase';
import { SummarizeDailyNutritionUseCase } from '../nutrition/SummarizeDailyNutritionUseCase';

@Injectable()
export class HandleIncomingMessageUseCase {

  constructor(
    private readonly aiService: AiService,
    private readonly analyzeNutrition: AnalyzeNutritionUseCase,
    private readonly summarizeDailyNutrition: SummarizeDailyNutritionUseCase,
    private readonly editLastMeal: EditLastMealUseCase,
  ) { }

  async execute({ extracted, inputType, profile }: HandleIncomingMessageUseCase.Input): Promise<string> {
    switch (extracted.intent) {
      case 'nutrition':
        return this.analyzeNutrition.execute(extracted, profile, inputType);
      case 'summary':
        return this.summarizeDailyNutrition.execute(profile);
      case 'edit_last_meal':
        return this.editLastMeal.execute({
          profile,
          message: extracted.message,
        });
      case 'unknown':
        return this.aiService.generateResponse(
          GENERAL_CHAT_PROMPT,
          extracted.message,
        );
    }
  }
}

export namespace HandleIncomingMessageUseCase {
  export type Input = {
    extracted: ExtractedIntent;
    inputType: Meal.InputType;
    profile: CompleteProfile;
  };
}
