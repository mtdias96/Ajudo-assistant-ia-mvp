import { Schema, Type } from '@google/genai';

export const EXTRACT_INTENT_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    intent: {
      type: Type.STRING,
      enum: ['nutrition', 'summary', 'edit_meal', 'unknown'],
    },
    message: { type: Type.STRING },
    items: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          quantity: { type: Type.STRING },
          quantityGrams: { type: Type.NUMBER },
          foodGroup: { type: Type.STRING },
        },
        required: ['name', 'quantity'],
      },
    },
    category: {
      type: Type.STRING,
      enum: ['BREAKFAST', 'LUNCH', 'SNACK', 'DINNER'],
    },
    operation: {
      type: Type.STRING,
      enum: ['DELETE_MEAL', 'DELETE_FOOD', 'UPDATE_FOOD', 'SWAP_FOOD', 'MOVE_MEAL'],
    },
    target: {
      type: Type.OBJECT,
      properties: {
        category: { type: Type.STRING, nullable: true },
        mealIndex: { type: Type.NUMBER, nullable: true },
        foodName: { type: Type.STRING, nullable: true },
      },
    },
    change: {
      type: Type.OBJECT,
      nullable: true,
      properties: {
        name: { type: Type.STRING },
        quantity: { type: Type.STRING },
        quantityGrams: { type: Type.NUMBER, nullable: true },
        foodGroup: { type: Type.STRING },
        calories: { type: Type.NUMBER },
        protein: { type: Type.NUMBER },
        carbs: { type: Type.NUMBER },
        fat: { type: Type.NUMBER },
        fiber: { type: Type.NUMBER },
      },
      required: ['name', 'calories'],
    },
    destinationCategory: { type: Type.STRING, nullable: true },
  },
  required: ['intent'],
};

export const NUTRITION_RESULT_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    items: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          quantity: { type: Type.STRING },
          quantityGrams: { type: Type.NUMBER },
          foodGroup: { type: Type.STRING },
        },
        required: ['name', 'quantity', 'quantityGrams', 'foodGroup'],
      },
    },
  },
  required: ['items'],
};

export const ONBOARDING_RESULT_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    extracted: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING, nullable: true },
        birthDate: { type: Type.STRING, nullable: true },
        gender: { type: Type.STRING, enum: ['MALE', 'FEMALE'], nullable: true },
        height: { type: Type.NUMBER, nullable: true },
        weight: { type: Type.NUMBER, nullable: true },
        activityLevel: {
          type: Type.STRING,
          enum: ['SEDENTARY', 'LIGHT', 'MODERATE', 'HEAVY', 'ATHLETE'],
          nullable: true,
        },
        goalType: {
          type: Type.STRING,
          enum: ['MAINTAIN', 'GAIN', 'LOSE'],
          nullable: true,
        },
      },
    },
    confirmed: { type: Type.BOOLEAN },
    reply: { type: Type.STRING },
  },
  required: ['extracted', 'confirmed', 'reply'],
};

export const ESTIMATE_NUTRITION_BATCH_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    results: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          itemId: { type: Type.STRING },
          calories: { type: Type.NUMBER },
          protein: { type: Type.NUMBER },
          carbs: { type: Type.NUMBER },
          fat: { type: Type.NUMBER },
          fiber: { type: Type.NUMBER },
        },
        required: ['itemId', 'calories', 'protein', 'carbs', 'fat', 'fiber'],
      },
    },
  },
  required: ['results'],
};
