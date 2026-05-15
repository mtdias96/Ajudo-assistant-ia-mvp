<!--
title: 'Ajudo Assistant'
description: 'AI-powered nutrition assistant on WhatsApp — serverless, event-driven, built with Clean Architecture'
-->

# Ajudo Assistant

<p align="center">
  <img src="https://img.shields.io/badge/status-MVP-blue" />
  <img src="https://img.shields.io/badge/node-%3E%3D18-green" />
  <img src="https://img.shields.io/badge/typescript-v6-blue" />
  <img src="https://img.shields.io/badge/serverless-v4-orange" />
  <img src="https://img.shields.io/badge/aws-lambda-yellow" />
  <img src="https://img.shields.io/badge/database-dynamodb-blue" />
  <img src="https://img.shields.io/badge/vector--db-qdrant-red" />
</p>

Assistente de nutrição via WhatsApp que analisa refeições em linguagem natural (texto ou foto), calcula macros com base em dados científicos e acompanha o progresso diário do usuário em relação às suas metas.

---

## Objetivo

Construir um sistema de produção completo — do onboarding ao acompanhamento diário — que demonstre como resolver problemas reais combinando **IA generativa**, **busca vetorial** e **arquitetura serverless orientada a eventos**, aplicando princípios de engenharia de software que vão além de um CRUD.

## Estratégia técnica

O projeto ataca deliberadamente problemas de complexidade crescente:

1. **NLP aplicado a domínio específico** — A IA extrai intents estruturados de mensagens livres (ex: "comi 200g de frango com arroz"). Cada intent é tipado (`nutrition`, `edit_meal`, `summary`, `unknown`) e roteado para um use case dedicado.

2. **Orquestração inteligente de modelos** — Um sistema de tiers (`lite`, `standard`, `pro`) seleciona automaticamente o modelo Gemini adequado para cada tarefa: Flash Lite para classificação rápida, Flash para extração de dados, Pro para análise de imagens. Isso otimiza custo sem comprometer precisão.

3. **RAG nutricional com dados TACO** — A base de conhecimento nutricional (Tabela TACO) é vetorizada no Qdrant. Quando o usuário registra um alimento, o sistema busca por similaridade semântica via embeddings (Vertex AI), aplica re-ranking com LLM para validar o match e usa os dados reais em vez de estimativas da IA.

4. **Guardrails e validação** — Camada de sanitização (`NutritionGuardrails`) que limita valores por 100g, reconcilia calorias declaradas vs derivadas (4·P + 4·C + 9·G) e impede dados absurdos de chegarem ao usuário.

5. **Onboarding conversacional** — A coleta de perfil (nome, idade, gênero, peso, altura, nível de atividade, objetivo) acontece via conversa natural. A IA extrai dados progressivamente de mensagens livres até completar o perfil, quando calcula as metas nutricionais via equação de Mifflin-St Jeor.

---

## Funcionalidades implementadas

- **Registro de refeições por texto** — "almocei arroz, feijão e bife" gera análise nutricional completa
- **Registro por imagem** — foto do prato é analisada pelo Gemini Pro com visão computacional
- **Edição de refeições** — deletar, trocar, atualizar alimentos ou mover refeições entre categorias
- **Resumo diário** — balanço de macros consumidos vs meta, agrupado por refeição
- **Categorização automática** — classifica refeições em café da manhã/almoço/lanche/janta com base no horário
- **Onboarding conversacional** — coleta perfil via chat e calcula metas personalizadas
- **Chat geral** — perguntas fora do domínio nutricional são respondidas por LLM

---

## Arquitetura

```
WhatsApp → API Gateway → Lambda → Controller → Use Cases → Entities
                                       │
                                       ├── AiService (Gemini Flash/Pro via Vertex AI)
                                       ├── NutritionEnricher (Qdrant + Embeddings + Re-ranking)
                                       ├── GoalCalculator (Mifflin-St Jeor)
                                       └── Repositories (DynamoDB / Qdrant)
```

**Camadas:**

| Camada | Responsabilidade | Exemplos |
|---|---|---|
| `main/` | Adaptadores de infra (Lambda handler) | `lambdaHttpAdapter`, `whatsappWebhook` |
| `application/` | Use cases, entidades, serviços de domínio | `AnalyzeNutritionUseCase`, `Meal`, `AiService` |
| `infrastructure/` | Gateways e repositórios concretos | `AiGateway` (Vertex AI), `MealRepository` (DynamoDB) |
| `kernel/` | IoC container e decorators | `@Injectable()`, `Registry` |

**Decisões de design:**

- **Injeção de dependência via decorators** — Container IoC próprio com `@Injectable()` e resolução recursiva de dependências via `reflect-metadata`, sem framework externo
- **Entidades geram sua própria identidade** — Construtores produzem `id` (KSUID) e `createdAt`, sem factories estáticas
- **Multi-model routing** — Cada operação de IA usa o modelo com melhor relação custo/qualidade para aquela tarefa
- **Single-table design** — DynamoDB com tabela única e items tipados por entidade

---

## Stack

| Categoria | Tecnologia |
|---|---|
| Runtime | Node.js + TypeScript |
| IA | Google Vertex AI (Gemini 2.5 Flash / Flash Lite / Pro) |
| Vector DB | Qdrant (busca semântica + embeddings) |
| Database | DynamoDB (single-table design) |
| Infra | AWS Lambda, API Gateway, S3, SQS, SSM |
| Deploy | Serverless Framework v4 |
| Validação | Zod v4 |
| Qualidade | ESLint, Husky, lint-staged, Vitest |

---

## Autor

**Matheus Dias**
