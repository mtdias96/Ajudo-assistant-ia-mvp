import { NutritionItem, NutritionTotal } from './NutritionResult';

export type ConfirmPendingIntent = {
  intent: 'confirm';
};

export type CorrectPendingIntent = {
  intent: 'correct';
  items: NutritionItem[];
  total: NutritionTotal;
};

export type CancelPendingIntent = {
  intent: 'cancel';
};

export type OtherPendingIntent = {
  intent: 'other';
};

export type PendingResolutionIntent =
  | ConfirmPendingIntent
  | CorrectPendingIntent
  | CancelPendingIntent
  | OtherPendingIntent;
