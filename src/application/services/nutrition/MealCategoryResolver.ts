import { Meal } from '@application/entities/Meal';
import { Injectable } from '@kernel/decorators/Injectable';
import { DateUtils } from '@shared/utils/DateUtils';

@Injectable()
export class MealCategoryResolver {
  private readonly LABELS: Record<Meal.Category, string> = {
    [Meal.Category.BREAKFAST]: 'Café da Manhã',
    [Meal.Category.LUNCH]: 'Almoço',
    [Meal.Category.SNACK]: 'Lanche da Tarde',
    [Meal.Category.DINNER]: 'Jantar',
    [Meal.Category.OTHER]: 'Outras Refeições',
  };

  private readonly ICONS: Record<Meal.Category, string> = {
    [Meal.Category.BREAKFAST]: '🌅',
    [Meal.Category.LUNCH]: '🍽',
    [Meal.Category.SNACK]: '🥪',
    [Meal.Category.DINNER]: '🌙',
    [Meal.Category.OTHER]: '🍴',
  };

  fromDate(date: Date): Meal.Category {
    const hours = DateUtils.getSaoPauloHours(date);
    const minutes = DateUtils.getSaoPauloMinutes(date);
    const totalMinutes = hours * 60 + minutes;

    if (totalMinutes >= 5 * 60 && totalMinutes < 10 * 60 + 30) {
      return Meal.Category.BREAKFAST;
    }
    if (totalMinutes >= 10 * 60 + 30 && totalMinutes < 15 * 60) {
      return Meal.Category.LUNCH;
    }
    if (totalMinutes >= 15 * 60 && totalMinutes < 18 * 60 + 30) {
      return Meal.Category.SNACK;
    }
    if (totalMinutes >= 18 * 60 + 30 && totalMinutes < 23 * 60) {
      return Meal.Category.DINNER;
    }
    return Meal.Category.OTHER;
  }

  label(category: Meal.Category): string {
    return this.LABELS[category];
  }

  icon(category: Meal.Category): string {
    return this.ICONS[category];
  }
}
