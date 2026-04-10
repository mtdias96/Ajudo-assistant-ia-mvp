import { NutritionIntent } from '@application/services/types/ExtractedIntent';
import { Injectable } from '@kernel/decorators/Injectable';

@Injectable()
export class AnalyzeNutrition {
  private static readonly MAX_ITEMS = 10;

  execute(extracted: NutritionIntent): string {
    if (extracted.items.length > AnalyzeNutrition.MAX_ITEMS) {
      return `Envie no máximo ${AnalyzeNutrition.MAX_ITEMS} alimentos por mensagem.`;
    }

    // TODO: validar, persistir no banco e calcular métricas próprias.

    return this.format(extracted);
  }

  private format(data: NutritionIntent): string {
    const items = data.items.map(
      (i) =>
        `${i.name} (${i.quantity})\n` +
        `↳ ${i.calories} kcal | P${i.protein} C${i.carbs} G${i.fat} F${i.fiber}`,
    );

    const { total } = data;

    const footer =
      '━━━━━━━━━━━━━━\n\n' +
      '📊 *Totais*\n' +
      `🔥 ${total.calories} kcal\n` +
      `🥩 Proteína: ${total.protein}g\n` +
      `🍞 Carbo: ${total.carbs}g\n` +
      `🥑 Gordura: ${total.fat}g\n` +
      `🌱 Fibra: ${total.fiber}g`;

    return ['🍽 *Resumo da refeição*\n', ...items, footer].join('\n\n');
  }
}
