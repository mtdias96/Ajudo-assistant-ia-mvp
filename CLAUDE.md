# CLAUDE.md

Guia para o Claude trabalhar neste repositório. Mantenha curto e objetivo.

## Stack

- **Runtime:** Node.js 24, TypeScript estrito
- **Deploy:** Serverless Framework v4 → AWS Lambda (sa-east-1), bundle via esbuild
- **Validação:** Zod (decorator `@Schema`)
- **DI:** Container caseiro em [Registry](src/kernel/di/Registry.ts) + decorator `@Injectable` (usa `reflect-metadata`)
- **Testes:** Vitest
- **Path aliases:** `@application/*`, `@kernel/*`, `@main/*`, `@shared/*`, `@infrastructure/*`, `@tests/*`

## Arquitetura (Clean Architecture / DDD enxuto)

```
src/
├── application/      # camada de aplicação (use cases, controllers, contratos, errors)
│   ├── contracts/    # interfaces que a aplicação expõe (ex.: Controller)
│   ├── controller/   # implementações de Controller (entrypoint da camada)
│   │   └── schemas/  # Zod schemas dos bodies dos controllers
│   ├── errors/       # ApplicationError, HttpError, ErrorCode
│   └── useCases/     # (a criar) regras de negócio orquestradas
├── infrastructure/   # (a criar) implementações concretas (repos, gateways HTTP, etc.)
├── kernel/           # infra técnica do framework (DI, decorators, clients AWS)
│   ├── aws/          # clients SDK v3 já instanciados
│   ├── decorators/   # @Injectable, @Schema
│   └── di/           # Registry
├── main/             # composição: adapters Lambda, factories, bootstrap HTTP
│   ├── adapters/     # ex.: lambdaHttpAdapter (Lambda → Controller)
│   └── utils/        # parsers / formatters de borda
├── shared/           # tipos utilitários sem dependência de domínio
└── bootstrap.ts      # side-effects globais (reflect-metadata)
```

**Regra de dependência:** `main` → `application` → `domain`. `kernel` é transversal técnico.
`infrastructure` implementa contratos definidos em `application`. Nunca importe de `main` para dentro de `application`.

## Padrões obrigatórios

### Controller

Todo controller estende [Controller](src/application/contracts/Controller.ts) e implementa apenas `handle`. O método público `execute` valida o body via `@Schema` antes de chamar `handle`.

```ts
import { Controller } from '@application/contracts/Controller';
import { Injectable } from '@kernel/decorators/Injectable';
import { Schema } from '@kernel/decorators/Schema';
import { MyBodySchema, MyBody } from './schemas/MyBody';

@Injectable()
@Schema(MyBodySchema)
export class MyController extends Controller<'public', { ok: true }> {
  protected async handle(
    request: Controller.Request<'public'>,
  ): Promise<Controller.Response<{ ok: true }>> {
    const body = request.body as MyBody;
    // ...
    return { statusCode: 200, body: { ok: true } };
  }
}
```

- Generic 1 (`TAccess`): `'public'` | `'private'`. `'private'` força `accountId: string`.
- Generic 2 (`TResponseBody`): tipo do `body` da resposta.
- Schemas Zod ficam em `application/controller/schemas/<NomeBody>.ts` exportando o schema **e** o tipo inferido.
- Controllers devem ter `@Injectable()` para o `Registry` resolver via `lambdaHttpAdapter`.

### Erros

- Lance `HttpError(statusCode, ErrorCode, message)` para erros HTTP esperados.
- Lance `ApplicationError(code, message, statusCode?)` para erros de regra de negócio.
- O `lambdaHttpAdapter` traduz `ZodError`, `HttpError` e `ApplicationError` em respostas. Erros desconhecidos viram 500.

### DI / Injectable

- Tudo que precisa ser resolvido pelo `Registry` recebe `@Injectable()`.
- O Registry usa `impl.name` como token e lê dependências via `Reflect.getMetadata('design:paramtypes', impl)` (requer `experimentalDecorators` + `emitDecoratorMetadata` no tsconfig **e** que o transpiler do build preserve essa metadata).
- Cada **lambda function** em `src/main/functions/` deve importar `'reflect-metadata'` na primeira linha. Isso garante que o polyfill esteja carregado antes de qualquer decorator rodar. Não há `bootstrap.ts` global.
- Implementações concretas em `infrastructure` são automaticamente registradas quando o controller que delas depende é importado pela lambda — não precisa importar manualmente.
- Não use singletons globais; passe pelo container.

### Adapter Lambda

- Cada handler exportado em `serverless.yml` deve ser um `lambdaHttpAdapter(MeuController)` (ver [lambdaHttpAdapter](src/main/adapters/lambdaHttpAdapter.ts)).
- O handler do Lambda fica em `src/main/functions/<nome>.ts` (a criar conforme necessário).

## Regras de estilo

- TypeScript estrito; nada de `any` solto. Prefira `unknown` + narrow.
- Imports usam **path aliases**, nunca caminhos relativos longos (`../../..`).
- Sem barrel files (`index.ts` reexportando) — importe direto do arquivo.
- Sem comentários óbvios. Comente só o "porquê" não-trivial.
- Sem overengineering: não crie abstrações para um único uso, não adicione fallbacks especulativos, não invente camadas que ainda não têm cliente.
- Idioma: código em inglês, mensagens de domínio em português quando fizer sentido para o usuário final.

## Comandos úteis

- `pnpm typecheck` — `tsc --noEmit`
- `pnpm lint` / `pnpm lint:fix`
- `pnpm test` / `pnpm test:watch`
- `pnpm dev` — `serverless offline` com `.env.local`
- `pnpm localstack:up` / `pnpm localstack:down`

## Convenções de commit

Padrão: `tipo / caminho/arquivo: descrição curta` (ver `git log`). Hook em `.husky/commit-msg` valida.
