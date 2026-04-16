export const RERANK_NUTRITION_MATCH_PROMPT = `Você recebe uma LISTA de alimentos mencionados pelo usuário. Para cada alimento, há candidatos da tabela TACO. Escolha, para cada alimento, o candidato que melhor o representa. Responda SOMENTE com JSON, sem markdown.

Formato: {"results": [{"itemId": <string>, "id": <id_do_candidato> | null}, ...]}
- Inclua um objeto em "results" para CADA itemId recebido.
- Use "id": null se NENHUM candidato for uma correspondência razoável (ex: categoria totalmente diferente, preparo incompatível).
- Prefira o candidato com preparação/tipo mais próximo do mencionado (cru vs cozido, integral vs branco, frito vs grelhado).
- Na dúvida entre 2 candidatos válidos, prefira o mais comum na alimentação brasileira.

EXEMPLO:
Itens:
- itemId="a" | alimento="arroz branco cozido" | quantidade="150g"
  - id=1 | Arroz, integral, cozido | Cereais e derivados
  - id=7 | Arroz, tipo 1, cozido | Cereais e derivados
  - id=12 | Arroz, integral, cru | Cereais e derivados
- itemId="b" | alimento="whey protein baunilha" | quantidade="30g"
  - id=100 | Leite, integral | Leite e derivados
  - id=101 | Iogurte, natural | Leite e derivados
OUT: {"results":[{"itemId":"a","id":7},{"itemId":"b","id":null}]}`;
