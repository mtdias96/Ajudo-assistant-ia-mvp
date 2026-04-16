export const EXTRACT_INTENT_PROMPT = `Classifique a intenção e extraia entidades. Responda SOMENTE com JSON, sem markdown.

Intents: nutrition | summary | edit_meal | unknown

Se nutrition:
- Extraia os alimentos e quantidades.
- Retorne dados nutricionais estimados (Tabelas TACO/USDA).
- "name": seja ESPECÍFICO, incluindo tipo e preparo quando razoável. Ex: "arroz" → "arroz branco cozido"; "pão" → "pão francês"; "leite" → "leite integral"; "batata" → "batata inglesa cozida"; "frango" → "peito de frango grelhado". Se o usuário for ambíguo e não houver contexto, use o tipo mais comum no Brasil.
- "foodGroup": grupo alimentar no estilo TACO, em minúsculas. Use um destes quando aplicável: "cereais e derivados", "carnes e derivados", "leite e derivados", "frutas e derivados", "verduras, hortaliças e derivados", "leguminosas e derivados", "ovos e derivados", "pescados e frutos do mar", "bebidas", "açúcares e doces", "óleos e gorduras", "miscelâneas". Se não souber, omita o campo.
- Quantidade imprecisa (ex: "um pedaço", "uma fatia", "um copo") → Use porção média padrão (ex: 1 copo = 200ml, 1 fatia = 30g).
- Valores sempre inteiros.
- "quantityGrams": estimativa em GRAMAS como número inteiro (ex: "200g" → 200, "1 fatia de pão" → 50, "1 prato" → 250, "1 copo de leite" → 200). Se for impossível estimar (ex: "à vontade"), use null.
- "category": SOMENTE inclua se o usuário citar LITERALMENTE o período com palavras como "café da manhã", "almoço"/"almocei", "lanche"/"lanchei", "jantar"/"jantei", "café"/"janta". Valores: BREAKFAST, LUNCH, SNACK, DINNER. Na dúvida, NÃO inclua "category" — o horário de envio será usado. Nunca inferir categoria pelo horário da mensagem ou pelo tipo de alimento.

Se edit_meal: o usuário quer apagar, alterar ou MOVER uma refeição já registrada.
- "operation":
  - DELETE_MEAL → apagar uma refeição inteira.
  - DELETE_FOOD → remover um alimento específico de uma refeição.
  - UPDATE_FOOD → trocar só a quantidade de um alimento (mesmo alimento, peso diferente).
  - SWAP_FOOD → substituir um alimento por outro.
  - MOVE_MEAL → mudar uma refeição de um período para outro (ex: "mova a refeição 2 do café da manhã para o almoço").
- "target.category": BREAKFAST | LUNCH | SNACK | DINNER. null se o usuário disser "última" ou não mencionar período.
- "target.mealIndex": número 1-based da refeição dentro do período (ex: "segundo jantar" → 2, "refeição 2 da janta" → 2). null quando o usuário disser "a última" / "a única" / não especificar.
- "target.foodName": nome do alimento alvo (DELETE_FOOD, UPDATE_FOOD, SWAP_FOOD). null para DELETE_MEAL e MOVE_MEAL.
- "destinationCategory": SOMENTE para MOVE_MEAL — período de destino (BREAKFAST | LUNCH | SNACK | DINNER). null para as demais operações.
- "change": SOMENTE para UPDATE_FOOD e SWAP_FOOD. Retorne o novo alimento COM MACROS recalculados via TACO/USDA:
  - UPDATE_FOOD → mesmo "name", novo "quantity"/"quantityGrams", macros proporcionais.
  - SWAP_FOOD → novo "name" (específico), novo "quantity"/"quantityGrams" e macros do novo alimento.
  - Se não tiver peso, estime a porção média padrão.
  - DELETE_MEAL, DELETE_FOOD e MOVE_MEAL → change = null.

nutrition → {"intent":"nutrition","items":[{"name":"","quantity":"","quantityGrams":0,"foodGroup":"","calories":0,"protein":0,"carbs":0,"fat":0,"fiber":0}],"total":{"calories":0,"protein":0,"carbs":0,"fat":0,"fiber":0},"category":"LUNCH"}
summary → {"intent":"summary","message":"<mensagem original>"}
edit_meal → {"intent":"edit_meal","operation":"DELETE_MEAL|DELETE_FOOD|UPDATE_FOOD|SWAP_FOOD|MOVE_MEAL","target":{"category":null,"mealIndex":null,"foodName":null},"change":null,"destinationCategory":null,"message":"<mensagem original>"}
unknown → {"intent":"unknown","message":"<mensagem original>"}

EXEMPLO 1 (Nutrition misto): "150g de arroz e um pedaço médio de lasanha de carne"
OUT: {"intent":"nutrition","items":[{"name":"arroz branco cozido","quantity":"150g","quantityGrams":150,"foodGroup":"cereais e derivados","calories":195,"protein":4,"carbs":42,"fat":0,"fiber":2},{"name":"lasanha de carne","quantity":"um pedaço médio","quantityGrams":200,"foodGroup":"miscelâneas","calories":410,"protein":24,"carbs":32,"fat":20,"fiber":3}],"total":{"calories":605,"protein":28,"carbs":74,"fat":20,"fiber":5}}

EXEMPLO 2 (Bebida + Porção): "3 fatias de pizza e um copo de suco de laranja"
OUT: {"intent":"nutrition","items":[{"name":"pizza muçarela (fatia)","quantity":"3 fatias","quantityGrams":300,"foodGroup":"miscelâneas","calories":750,"protein":36,"carbs":90,"fat":27,"fiber":6},{"name":"suco de laranja natural","quantity":"um copo","quantityGrams":200,"foodGroup":"bebidas","calories":90,"protein":1,"carbs":21,"fat":0,"fiber":1}],"total":{"calories":840,"protein":37,"carbs":111,"fat":27,"fiber":7}}

EXEMPLO 2b (Com categoria explícita): "no café da manhã comi 2 ovos e um pão"
OUT: {"intent":"nutrition","items":[{"name":"ovo de galinha cozido","quantity":"2 unidades","quantityGrams":100,"foodGroup":"ovos e derivados","calories":156,"protein":13,"carbs":1,"fat":11,"fiber":0},{"name":"pão francês","quantity":"1 unidade","quantityGrams":50,"foodGroup":"cereais e derivados","calories":150,"protein":4,"carbs":30,"fat":1,"fiber":1}],"total":{"calories":306,"protein":17,"carbs":31,"fat":12,"fiber":1},"category":"BREAKFAST"}

EXEMPLO 3 (Summary): "como estão meus macros hoje?"
OUT: {"intent":"summary","message":"como estão meus macros hoje?"}

EXEMPLO 4 (Delete última): "apaga a última refeição"
OUT: {"intent":"edit_meal","operation":"DELETE_MEAL","target":{"category":null,"mealIndex":null,"foodName":null},"change":null,"destinationCategory":null,"message":"apaga a última refeição"}

EXEMPLO 5 (Delete refeição por índice): "remova a refeição 2 da janta"
OUT: {"intent":"edit_meal","operation":"DELETE_MEAL","target":{"category":"DINNER","mealIndex":2,"foodName":null},"change":null,"destinationCategory":null,"message":"remova a refeição 2 da janta"}

EXEMPLO 6 (Delete item de refeição específica): "tira o pão da segunda janta"
OUT: {"intent":"edit_meal","operation":"DELETE_FOOD","target":{"category":"DINNER","mealIndex":2,"foodName":"pão"},"change":null,"destinationCategory":null,"message":"tira o pão da segunda janta"}

EXEMPLO 7 (Delete item da última): "tira o arroz da última"
OUT: {"intent":"edit_meal","operation":"DELETE_FOOD","target":{"category":null,"mealIndex":null,"foodName":"arroz"},"change":null,"destinationCategory":null,"message":"tira o arroz da última"}

EXEMPLO 8 (Update quantidade): "no almoço 1 foi 150g de arroz, não 100"
OUT: {"intent":"edit_meal","operation":"UPDATE_FOOD","target":{"category":"LUNCH","mealIndex":1,"foodName":"arroz"},"change":{"name":"arroz branco cozido","quantity":"150g","quantityGrams":150,"foodGroup":"cereais e derivados","calories":195,"protein":4,"carbs":42,"fat":0,"fiber":2},"destinationCategory":null,"message":"no almoço 1 foi 150g de arroz, não 100"}

EXEMPLO 9 (Swap por outro alimento): "no almoço 2, troca o arroz por 200g de batata"
OUT: {"intent":"edit_meal","operation":"SWAP_FOOD","target":{"category":"LUNCH","mealIndex":2,"foodName":"arroz"},"change":{"name":"batata inglesa cozida","quantity":"200g","quantityGrams":200,"foodGroup":"verduras, hortaliças e derivados","calories":104,"protein":2,"carbs":24,"fat":0,"fiber":2},"destinationCategory":null,"message":"no almoço 2, troca o arroz por 200g de batata"}

EXEMPLO 10 (Move refeição): "mova a refeição 2 do café da manhã para o almoço"
OUT: {"intent":"edit_meal","operation":"MOVE_MEAL","target":{"category":"BREAKFAST","mealIndex":2,"foodName":null},"change":null,"destinationCategory":"LUNCH","message":"mova a refeição 2 do café da manhã para o almoço"}

EXEMPLO 11 (Move última): "joga a última pro lanche"
OUT: {"intent":"edit_meal","operation":"MOVE_MEAL","target":{"category":null,"mealIndex":null,"foodName":null},"change":null,"destinationCategory":"SNACK","message":"joga a última pro lanche"}

EXEMPLO 12: "oi, tudo bem?"
OUT: {"intent":"unknown","message":"oi, tudo bem?"}`;
