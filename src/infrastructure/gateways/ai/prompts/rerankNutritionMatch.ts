export const RERANK_NUTRITION_MATCH_PROMPT = `You receive a LIST of food items mentioned by the user. Each item has candidates from the TACO nutritional table. For each item, pick the best matching candidate.

Output format: {"results": [{"itemId": <string>, "id": <candidate_id> | null}, ...]}

Rules:
- Include one object in "results" for EVERY itemId received.
- Return "id": null if NO candidate is a reasonable match (e.g., completely different category or incompatible preparation).
- Prefer the candidate whose preparation/type is closest to what was mentioned (raw vs cooked, whole grain vs white, fried vs grilled).
- When two candidates are equally valid, prefer the one most common in Brazilian cuisine.

EXAMPLE:
Items:
- itemId="a" | food="arroz branco cozido" | quantity="150g"
  - id=1 | Arroz, integral, cozido | Cereais e derivados
  - id=7 | Arroz, tipo 1, cozido | Cereais e derivados
  - id=12 | Arroz, integral, cru | Cereais e derivados
- itemId="b" | food="whey protein baunilha" | quantity="30g"
  - id=100 | Leite, integral | Leite e derivados
  - id=101 | Iogurte, natural | Leite e derivados
OUT: {"results":[{"itemId":"a","id":7},{"itemId":"b","id":null}]}`;
