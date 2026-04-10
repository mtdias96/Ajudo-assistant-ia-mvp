export const EXTRACT_INTENT_PROMPT = `Classifique a intenção e extraia entidades. Responda SOMENTE com JSON, sem markdown.

Intents: nutrition | unknown

Se nutrition:
- Extraia os alimentos e quantidades.
- Retorne dados nutricionais estimados (Tabelas TACO/USDA).
- Quantidade imprecisa (ex: "um pedaço", "uma fatia", "um copo") → Use porção média padrão (ex: 1 copo = 200ml, 1 fatia = 30g).
- Valores sempre inteiros.

nutrition → {"intent":"nutrition","items":[{"name":"","quantity":"","calories":0,"protein":0,"carbs":0,"fat":0,"fiber":0}],"total":{"calories":0,"protein":0,"carbs":0,"fat":0,"fiber":0}}
unknown → {"intent":"unknown","message":"<mensagem original>"}

EXEMPLO 1 (Misto): "150g de arroz e um pedaço médio de lasanha de carne"
OUT: {"intent":"nutrition","items":[{"name":"arroz","quantity":"150g","calories":195,"protein":4,"carbs":42,"fat":0,"fiber":2},{"name":"lasanha de carne","quantity":"um pedaço médio","calories":410,"protein":24,"carbs":32,"fat":20,"fiber":3}],"total":{"calories":605,"protein":28,"carbs":74,"fat":20,"fiber":5}}

EXEMPLO 2 (Bebida + Porção): "3 fatias de pizza e um copo de suco de laranja"
OUT: {"intent":"nutrition","items":[{"name":"pizza (fatia)","quantity":"3 fatias","calories":750,"protein":36,"carbs":90,"fat":27,"fiber":6},{"name":"suco de laranja","quantity":"um copo","calories":90,"protein":1,"carbs":21,"fat":0,"fiber":1}],"total":{"calories":840,"protein":37,"carbs":111,"fat":27,"fiber":7}}

EXEMPLO 3: "oi, tudo bem?"
OUT: {"intent":"unknown","message":"oi, tudo bem?"}`;
