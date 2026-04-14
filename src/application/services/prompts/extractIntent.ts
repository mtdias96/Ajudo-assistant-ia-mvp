export const EXTRACT_INTENT_PROMPT = `Classifique a intenção e extraia entidades. Responda SOMENTE com JSON, sem markdown.

Intents: nutrition | summary | edit_last_meal | unknown

Se nutrition:
- Extraia os alimentos e quantidades.
- Retorne dados nutricionais estimados (Tabelas TACO/USDA).
- Quantidade imprecisa (ex: "um pedaço", "uma fatia", "um copo") → Use porção média padrão (ex: 1 copo = 200ml, 1 fatia = 30g).
- Valores sempre inteiros.
- Se o usuário mencionar explicitamente a refeição (ex: "no café da manhã", "almocei", "jantei", "lanchei"), inclua "category" com um de: BREAKFAST, LUNCH, SNACK, DINNER. Se não mencionar, omita "category".

Se edit_last_meal: o usuário quer editar ou apagar a última refeição já registrada (ex: "apaga a última", "remove o arroz", "desfaz", "errei, deleta", "tira o pão").

nutrition → {"intent":"nutrition","items":[{"name":"","quantity":"","calories":0,"protein":0,"carbs":0,"fat":0,"fiber":0}],"total":{"calories":0,"protein":0,"carbs":0,"fat":0,"fiber":0},"category":"LUNCH"}
summary → {"intent":"summary","message":"<mensagem original>"}
edit_last_meal → {"intent":"edit_last_meal","message":"<mensagem original>"}
unknown → {"intent":"unknown","message":"<mensagem original>"}

EXEMPLO 1 (Misto): "150g de arroz e um pedaço médio de lasanha de carne"
OUT: {"intent":"nutrition","items":[{"name":"arroz","quantity":"150g","calories":195,"protein":4,"carbs":42,"fat":0,"fiber":2},{"name":"lasanha de carne","quantity":"um pedaço médio","calories":410,"protein":24,"carbs":32,"fat":20,"fiber":3}],"total":{"calories":605,"protein":28,"carbs":74,"fat":20,"fiber":5}}

EXEMPLO 2 (Bebida + Porção): "3 fatias de pizza e um copo de suco de laranja"
OUT: {"intent":"nutrition","items":[{"name":"pizza (fatia)","quantity":"3 fatias","calories":750,"protein":36,"carbs":90,"fat":27,"fiber":6},{"name":"suco de laranja","quantity":"um copo","calories":90,"protein":1,"carbs":21,"fat":0,"fiber":1}],"total":{"calories":840,"protein":37,"carbs":111,"fat":27,"fiber":7}}

EXEMPLO 2b (Com categoria explícita): "no café da manhã comi 2 ovos e um pão"
OUT: {"intent":"nutrition","items":[{"name":"ovo","quantity":"2 unidades","calories":156,"protein":13,"carbs":1,"fat":11,"fiber":0},{"name":"pão francês","quantity":"1 unidade","calories":150,"protein":4,"carbs":30,"fat":1,"fiber":1}],"total":{"calories":306,"protein":17,"carbs":31,"fat":12,"fiber":1},"category":"BREAKFAST"}

EXEMPLO 3 (Resumo): "como estão meus macros hoje?"
OUT: {"intent":"summary","message":"como estão meus macros hoje?"}

EXEMPLO 4 (Resumo): "quanto eu ainda posso comer?"
OUT: {"intent":"summary","message":"quanto eu ainda posso comer?"}

EXEMPLO 5 (Edit): "apaga a última refeição"
OUT: {"intent":"edit_last_meal","message":"apaga a última refeição"}

EXEMPLO 6 (Edit): "tira o arroz da última"
OUT: {"intent":"edit_last_meal","message":"tira o arroz da última"}

EXEMPLO 7: "oi, tudo bem?"
OUT: {"intent":"unknown","message":"oi, tudo bem?"}`;
