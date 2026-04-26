import { Meal } from '@application/entities/Meal';
import { GoalCalculator } from '@application/services/nutrition/GoalCalculator';
import { MealCategoryResolver } from '@application/services/nutrition/MealCategoryResolver';
import { MealIndexResolver } from '@application/services/nutrition/MealIndexResolver';
import { EditMealTarget } from '@application/services/types/ExtractedIntent';
import { Injectable } from '@kernel/decorators/Injectable';
import { DateUtils } from '@shared/utils/DateUtils';

@Injectable()
export class NutritionFormatter {
  private static readonly NUMBER_LABELS = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣'];

  constructor(
    private readonly mealCategoryResolver: MealCategoryResolver,
    private readonly mealIndexResolver: MealIndexResolver,
  ) { }

  formatMealLabel(meal: Meal, meals: Meal[]): string {
    const categoryLabel = this.mealCategoryResolver.label(meal.category);
    const { index, total } = this.mealIndexResolver.positionInCategory(meals, meal);

    if (total <= 1 || index === null) {
      return categoryLabel;
    }

    return `${categoryLabel} #${index}`;
  }

  formatMealMoved(fromLabel: string, destination: Meal.Category): string {
    const toLabel = this.mealCategoryResolver.label(destination);
    return `✅ Movi: *${fromLabel}* → *${toLabel}*`;
  }

  formatMealDeleted(mealLabel: string): string {
    return `🗑 Removi: *${mealLabel}*`;
  }

  formatFoodDeleted(foodName: string, mealLabel: string): string {
    return `🗑 Removi: *${foodName}* (${mealLabel})`;
  }

  formatFoodReplaced(
    verb: string,
    previous: Meal.Food,
    next: Meal.Food,
    mealLabel: string,
  ): string {
    return `✅ ${verb}: *${previous.name}* → *${next.name}* (${next.quantity}) em ${mealLabel}`;
  }

  formatMealNotFound(target: EditMealTarget): string {
    if (target.category === null) {
      return 'Não encontrei nenhuma refeição registrada hoje pra editar.';
    }

    const label = this.mealCategoryResolver.label(target.category);
    if (target.mealIndex !== null) {
      return `Não encontrei a refeição #${target.mealIndex} de ${label} hoje.`;
    }

    return `Não encontrei nenhuma refeição de ${label} hoje.`;
  }

  formatMealAlreadyInCategory(destination: Meal.Category): string {
    return `Essa refeição já está em ${this.mealCategoryResolver.label(destination)}.`;
  }

  formatFoodNotFound(foodName: string, mealLabel: string): string {
    return `Não achei "${foodName}" em ${mealLabel}.`;
  }

  formatDraft(
    meal: Meal,
    metrics: GoalCalculator.CalculateGoalResult,
    consumedBefore: NutritionFormatter.Totals = { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
  ): string {
    const items = meal.foods.map(
      (food) =>
        `*${food.name}* — ${food.quantity}\n` +
        `🔥 *${food.calories} kcal*\n` +
        `🥩 Proteína: ${food.protein}g\n` +
        `🍞 Carboidrato: ${food.carbs}g\n` +
        `🥑 Gordura: ${food.fat}g\n` +
        `🌱 Fibra: ${food.fiber}g`,
    );

    const mealTotals = this.totals(meal);
    const totals = {
      calories: mealTotals.calories + consumedBefore.calories,
      protein: mealTotals.protein + consumedBefore.protein,
      carbs: mealTotals.carbs + consumedBefore.carbs,
      fat: mealTotals.fat + consumedBefore.fat,
      fiber: mealTotals.fiber + consumedBefore.fiber,
    };

    const mealSummary =
      '━━━━━━━━━━━━━━\n\n' +
      '🍴 *Total da Refeição*\n' +
      `🔥 *Calorias:* ${mealTotals.calories} kcal\n` +
      `🥩 *Proteína:* ${mealTotals.protein}g\n` +
      `🍞 *Carboidratos:* ${mealTotals.carbs}g\n` +
      `🥑 *Gorduras:* ${mealTotals.fat}g\n` +
      `🌱 *Fibra:* ${mealTotals.fiber}g`;

    const macros =
      '\n\n━━━━━━━━━━━━━━\n\n' +
      '📊 *Totais do Dia*\n' +
      this.row('🔥', 'Calorias', totals.calories, metrics.calories, ' kcal') + '\n' +
      this.row('🥩', 'Proteína', totals.protein, metrics.proteins, 'g') + '\n' +
      this.row('🍞', 'Carboidratos', totals.carbs, metrics.carbohydrates, 'g') + '\n' +
      this.row('🥑', 'Gorduras', totals.fat, metrics.fats, 'g') + '\n' +
      `🌱 *Fibra:* ${totals.fiber}g`;

    const footer =
      '\n\n━━━━━━━━━━━━━━\n' +
      '*Posso registrar?*\n' +
      '1 - Confirmar\n' +
      '2 - Cancelar\n' +
      'Ou envie a correção (ex: "foi 100g")';

    return ['🍽 *Resumo da refeição*\n', ...items, mealSummary + macros + footer].join('\n\n');
  }

  formatBlocked(meal: Meal): string {
    const items = meal.foods
      .map(
        (food) =>
          `*${food.name}* — ${food.quantity}\n` +
          `🔥 *${food.calories} kcal*\n` +
          `🥩 Proteína: ${food.protein}g\n` +
          `🍞 Carboidrato: ${food.carbs}g\n` +
          `🥑 Gordura: ${food.fat}g\n` +
          `🌱 Fibra: ${food.fiber}g`,
      )
      .join('\n\n');

    return (
      '⚠️ Você tem um rascunho pendente:\n\n' +
      `🍽 *${meal.name}*\n\n${items}\n\n` +
      '*Responda:*\n' +
      '1 - Confirmar e salvar\n' +
      '2 - Cancelar rascunho\n' +
      'Ou envie a correção (ex: "foi 100g")'
    );
  }

  private row(emoji: string, label: string, consumed: number, goal: number, unit: string): string {
    const diff = goal - consumed;
    if (diff >= 0) {
      return `${emoji} *${label}:* ${consumed}/${goal}${unit} (Faltam ${diff}${unit})`;
    }
    return `${emoji} *${label}:* ${consumed}/${goal}${unit} 🚩 (Passou ${Math.abs(diff)}${unit})`;
  }

  private totals(meal: Meal): Meal.Food {
    return meal.foods.reduce<Meal.Food>(
      (acc, food) => ({
        name: '',
        quantity: '',
        calories: acc.calories + food.calories,
        protein: acc.protein + food.protein,
        carbs: acc.carbs + food.carbs,
        fat: acc.fat + food.fat,
        fiber: acc.fiber + food.fiber,
      }),
      { name: '', quantity: '', calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
    );
  }

  formatDailySummary(meals: Meal[], totals: { calories: number; protein: number; carbs: number; fat: number; fiber: number }, goalMetrics: GoalCalculator.CalculateGoalResult): string {
    const title = '📅 *Resumo do seu Dia*\n\n';
    const body = this.formatSummaryBody(totals, goalMetrics);

    if (meals.length === 0) {
      return `${title}Você ainda não registrou nenhuma refeição hoje!\n\n${body}`;
    }

    const grouped = this.formatGrouped(meals);
    return `${title}${grouped}━━━━━━━━━━━━━━\n\n${body}`;
  }

  private formatGrouped(meals: Meal[]): string {
    const CATEGORY_ORDER: Meal.Category[] = [
      Meal.Category.BREAKFAST,
      Meal.Category.LUNCH,
      Meal.Category.SNACK,
      Meal.Category.DINNER,
      Meal.Category.OTHER,
    ];

    const byCategory = new Map<Meal.Category, Meal[]>();
    for (const meal of meals) {
      const bucket = byCategory.get(meal.category) ?? [];
      bucket.push(meal);
      byCategory.set(meal.category, bucket);
    }

    const sections: string[] = [];
    for (const category of CATEGORY_ORDER) {
      const bucket = byCategory.get(category);
      if (!bucket || bucket.length === 0) { continue; }

      bucket.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

      const icon = this.mealCategoryResolver.icon(category);
      const label = this.mealCategoryResolver.label(category);
      const body = bucket.length === 1
        ? this.formatSingleMeal(bucket[0])
        : bucket
          .map((meal, index) => this.formatNumberedMeal(meal, index + 1))
          .join('\n\n');

      sections.push(`${icon} *${label}*\n${body}`);
    }

    return sections.length > 0 ? `${sections.join('\n\n━━━━━━━━━━━━━━\n\n')}\n\n` : '';
  }

  private formatNumberedMeal(meal: Meal, position: number): string {
    const label = NutritionFormatter.NUMBER_LABELS[position - 1] ?? `#${position}`;
    const header = `  ${label} *${this.formatTime(meal.createdAt)}*`;
    const items = meal.foods
      .map(food => `     • ${food.name} (${food.quantity})`)
      .join('\n');

    return `${header}\n${items}`;
  }

  private formatSingleMeal(meal: Meal): string {
    const header = `  🕐 *${this.formatTime(meal.createdAt)}*`;
    const items = meal.foods
      .map(food => `     • ${food.name} (${food.quantity})`)
      .join('\n');

    return `${header}\n${items}`;
  }

  private formatTime(date: Date): string {
    const h = DateUtils.getSaoPauloHours(date).toString().padStart(2, '0');
    const m = DateUtils.getSaoPauloMinutes(date).toString().padStart(2, '0');
    return `${h}:${m}`;
  }

  private formatSummaryBody(totals: { calories: number; protein: number; carbs: number; fat: number; fiber: number }, goalMetrics: GoalCalculator.CalculateGoalResult): string {
    return (
      '📊 *Balanço Nutricional*\n\n' +
      this.formatSummaryCategory('🔥', 'Calorias', totals.calories, goalMetrics.calories, 'kcal') + '\n\n' +
      this.formatSummaryCategory('🥩', 'Proteínas', totals.protein, goalMetrics.proteins, 'g') + '\n\n' +
      this.formatSummaryCategory('🍞', 'Carbos', totals.carbs, goalMetrics.carbohydrates, 'g') + '\n\n' +
      this.formatSummaryCategory('🥑', 'Gorduras', totals.fat, goalMetrics.fats, 'g') + '\n\n' +
      `🌱 *Fibra total:* ${totals.fiber}g`
    );
  }

  private formatSummaryCategory(emoji: string, label: string, consumed: number, goal: number, unit: string): string {
    const percent = Math.min(Math.round((consumed / goal) * 100), 100);
    const progressBar = this.makeProgressBar(percent);
    const diff = goal - consumed;
    const roundedDiff = Math.abs(Math.round(diff));

    const status = diff > 0.9
      ? `(Faltam ${roundedDiff}${unit})`
      : diff < -0.9
        ? `🚩 (Passou ${roundedDiff}${unit})`
        : '✅ (Meta batida!)';

    return `${emoji} *${label}:* ${Math.round(consumed)}/${Math.round(goal)}${unit}\n` +
      `${progressBar} ${percent}%\n` +
      `_${status}_`;
  }

  private makeProgressBar(percent: number): string {
    const size = 10;
    const completed = Math.floor((percent / 100) * size);
    const remains = size - completed;
    return '`[' + '■'.repeat(completed) + '□'.repeat(remains) + ']`';
  }
}

export namespace NutritionFormatter {
  export type Totals = {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
}
