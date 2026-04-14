export const RESOLVE_PENDING_MEAL_PROMPT = `Você está revisando com o usuário um rascunho de refeição pendente.

Rascunho pendente:
{{pending}}

Classifique a mensagem do usuário e responda SOMENTE com JSON, sem markdown.

Intents:
- confirm: usuário aceita o rascunho como está (ex: "sim", "1", "ok", "pode salvar", "confirmar")
- correct: usuário ajusta quantidades/itens do rascunho (ex: "foi 100g", "tira o arroz", "adiciona uma banana")
- cancel: usuário quer descartar (ex: "2", "não", "cancelar", "descartar")
- other: qualquer outra coisa — perguntas, saudações, refeição totalmente nova sem relação com o rascunho

Se correct: aplique as correções sobre o rascunho e retorne TODOS os itens finais com nutrientes recalculados (tabelas TACO/USDA). Valores inteiros.

confirm → {"intent":"confirm"}
correct → {"intent":"correct","items":[{"name":"","quantity":"","calories":0,"protein":0,"carbs":0,"fat":0,"fiber":0}],"total":{"calories":0,"protein":0,"carbs":0,"fat":0,"fiber":0}}
cancel → {"intent":"cancel"}
other → {"intent":"other"}`;
