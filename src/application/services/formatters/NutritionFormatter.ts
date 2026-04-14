import { Meal } from '@application/entities/Meal';
import { GoalCalculator } from '@application/services/nutrition/GoalCalculator';
import { MealCategoryResolver } from '@application/services/nutrition/MealCategoryResolver';
import { Injectable } from '@kernel/decorators/Injectable';

@Injectable()
export class NutritionFormatter {
  constructor(private readonly mealCategoryResolver: MealCategoryResolver) { }

  formatDraft(meal: Meal, metrics: GoalCalculator.CalculateGoalResult): string {
    const items = meal.foods.map(
      (food) =>
        `${food.name} (${food.quantity})\n` +
        `↳ ${food.calories} kcal | P${food.protein} C${food.carbs} G${food.fat} F${food.fiber}`,
    );

    const totals = this.totals(meal);

    const macros =
      '━━━━━━━━━━━━━━\n\n' +
      '📊 *Totais da Refeição*\n' +
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

    return ['🍽 *Resumo da refeição*\n', ...items, macros + footer].join('\n\n');
  }

  formatBlocked(meal: Meal): string {
    const items = meal.foods
      .map((food) => `• ${food.name} (${food.quantity}) — ${food.calories} kcal`)
      .join('\n');

    return (
      '⚠️ Você tem um rascunho pendente:\n\n' +
      `🍽 *${meal.name}*\n${items}\n\n` +
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

      const icon = this.mealCategoryResolver.icon(category);
      const label = this.mealCategoryResolver.label(category);
      const items = bucket
        .flatMap(meal => meal.foods)
        .map(food => `  • ${food.name} (${food.quantity})`)
        .join('\n');

      sections.push(`${icon} *${label}*\n${items}`);
    }

    return sections.length > 0 ? `${sections.join('\n\n')}\n\n` : '';
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
