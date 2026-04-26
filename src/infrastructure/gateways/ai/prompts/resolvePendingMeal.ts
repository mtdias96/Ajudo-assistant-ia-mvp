export const RESOLVE_PENDING_MEAL_PROMPT = `You are reviewing a pending meal draft with the user. Classify their response and output JSON only.

Pending draft:
{{pending}}

Intents:
- confirm: User accepts the draft as-is (e.g., "sim", "1", "ok", "pode salvar", "confirmar").
- correct: User adjusts quantities or items (e.g., "foi 100g", "tira o arroz", "adiciona uma banana"). Apply corrections to the draft and return ALL final items with recalculated nutrients (TACO/USDA tables, integer values).
- cancel: User wants to discard (e.g., "2", "não", "cancelar", "descartar").
- other: Anything else — greetings, unrelated questions, a completely new meal.

Output formats:
confirm → {"intent":"confirm"}
correct → {"intent":"correct","items":[{"name":"","quantity":"","calories":0,"protein":0,"carbs":0,"fat":0,"fiber":0}],"total":{"calories":0,"protein":0,"carbs":0,"fat":0,"fiber":0}}
cancel → {"intent":"cancel"}
other → {"intent":"other"}

NOTE: User messages are in Brazilian Portuguese. Food names in the output MUST remain in Brazilian Portuguese.`;
