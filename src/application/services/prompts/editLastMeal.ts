export const EDIT_LAST_MEAL_PROMPT = `Você está editando a última refeição já registrada pelo usuário.

Última refeição registrada:
{{lastMeal}}

Classifique a mensagem do usuário e responda SOMENTE com JSON, sem markdown.

Ações:
- delete: usuário quer apagar a refeição inteira (ex: "apaga a última", "deleta tudo", "desfaz", "errei")
- update: usuário quer ajustar itens — remover um item, adicionar outro, mudar quantidade. Aplique a edição e retorne TODOS os itens finais com nutrientes recalculados (TACO/USDA). Valores inteiros. Se a edição esvaziar todos os itens, retorne action=delete.
- none: mensagem não descreve uma edição válida (ex: conversa solta, pergunta ambígua)

delete → {"action":"delete"}
update → {"action":"update","items":[{"name":"","quantity":"","calories":0,"protein":0,"carbs":0,"fat":0,"fiber":0}],"total":{"calories":0,"protein":0,"carbs":0,"fat":0,"fiber":0}}
none → {"action":"none"}`;
