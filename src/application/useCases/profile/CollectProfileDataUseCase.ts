import { NutritionGoal } from '@application/entities/NutritionGoal';
import { CompleteProfile, Profile } from '@application/entities/Profile';
import { AiService } from '@application/services/AiService';
import { GoalCalculator } from '@application/services/nutrition/GoalCalculator';
import { WELCOME_MESSAGE } from '@application/services/prompts/onboardingPrompt';
import { NutritionGoalRepository } from '@infrastructure/database/dynamo/repositories/NutritionGoalRepository';
import { ProfileRepository } from '@infrastructure/database/dynamo/repositories/ProfileRepository';
import { Injectable } from '@kernel/decorators/Injectable';

@Injectable()
export class CollectProfileDataUseCase {
  constructor(
    private readonly aiService: AiService,
    private readonly profileRepository: ProfileRepository,
    private readonly nutritionGoalRepository: NutritionGoalRepository,
  ) { }

  async execute(input: CollectProfileDataUseCase.Input): Promise<string> {
    const existing = await this.profileRepository.findByAccountId(
      input.accountId,
    );

    if (!existing) {
      await this.profileRepository.save(new Profile({ accountId: input.accountId }));
      return WELCOME_MESSAGE;
    }

    const collected = this.toCollected(existing);
    const result = await this.aiService.collectProfileData(
      input.message,
      collected,
    );

    this.applyExtracted(existing, result.extracted);

    if (result.confirmed && existing.hasAllFields()) {
      existing.onboardingCompleted = true;
      await this.profileRepository.save(existing);

      const profileComplete = existing as CompleteProfile;
      const goalMetrics = GoalCalculator.calculate(profileComplete);

      const nutritionGoal = new NutritionGoal({
        accountId: profileComplete.accountId,
        tdee: goalMetrics.calories,
        calories: goalMetrics.calories,
        proteins: goalMetrics.proteins,
        carbohydrates: goalMetrics.carbohydrates,
        fats: goalMetrics.fats,
      });
      await this.nutritionGoalRepository.create(nutritionGoal);

      return (
        '✅ *Perfil salvo com sucesso!*\n\n' +
        '🎯 Seu plano diário foi calculado com base na biologia moderna usando a *Equação Mifflin-St Jeor*:\n\n' +
        `🔥 *Calorias:* ${goalMetrics.calories} kcal\n` +
        `🥩 *Proteína:* ${goalMetrics.proteins}g\n` +
        `🍞 *Carboidratos:* ${goalMetrics.carbohydrates}g\n` +
        `🥑 *Gorduras:* ${goalMetrics.fats}g\n\n` +
        'Agora você pode começar a registrar suas refeições. ' +
        'Envie o que comeu por texto ou mande uma foto do prato 📸'
      );
    }

    await this.profileRepository.save(existing);

    return result.reply;
  }

  private applyExtracted(
    profile: Profile,
    extracted: Record<string, unknown>,
  ): void {
    if (extracted.name !== undefined) { profile.name = extracted.name as string; }
    if (extracted.birthDate !== undefined) { profile.birthDate = new Date(extracted.birthDate as string); }
    if (extracted.gender !== undefined) { profile.gender = String(extracted.gender).toUpperCase() as Profile.Gender; }
    if (extracted.height !== undefined) { profile.height = extracted.height as number; }
    if (extracted.weight !== undefined) { profile.weight = extracted.weight as number; }
    if (extracted.activityLevel !== undefined) { profile.activityLevel = String(extracted.activityLevel).toUpperCase() as Profile.ActivityLevel; }
    if (extracted.goalType !== undefined) { profile.goalType = String(extracted.goalType).toUpperCase() as Profile.Goal; }
  }

  private toCollected(profile: Profile): Record<string, unknown> {
    const fields: Record<string, unknown> = {};
    if (profile.name !== undefined) { fields.name = profile.name; }
    if (profile.birthDate !== undefined) { fields.birthDate = profile.birthDate.toISOString(); }
    if (profile.gender !== undefined) { fields.gender = profile.gender; }
    if (profile.height !== undefined) { fields.height = profile.height; }
    if (profile.weight !== undefined) { fields.weight = profile.weight; }
    if (profile.activityLevel !== undefined) { fields.activityLevel = profile.activityLevel; }
    if (profile.goalType !== undefined) { fields.goalType = profile.goalType; }
    return fields;
  }
}

export namespace CollectProfileDataUseCase {
  export type Input = {
    accountId: string;
    message: string;
  };
}
