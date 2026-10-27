---
type: Execution Slice
title: Fatia 0 — Fundação
description: Scaffold, banco, login, papéis, workspace, auditoria, CI e uma VPS com backup restaurado, prontos para a fatia 1.
tags: [bosun, plano, fatia, fundação]
status: draft
generated:
  by: claude-opus/5.5
  at: 2026-10-23T00:00:00Z
---

# Fatia 0 — Fundação

**Objetivo:** a piloto consegue entrar numa BOSUN real, na VPS dela, com segurança. Nada de produto ainda; a base para a fatia 1 ir ao ar.

**Em paralelo, fora do código (começar no dia 1):** criar o app da Meta e pedir o App Review e a verificação do negócio; criar o projeto no Google Cloud e pedir a verificação dos escopos de Contatos, Agenda e YouTube ([Canal](../product/channel.md)).

## Escopo

- Scaffold Next.js + TypeScript, Prisma + PostgreSQL, Better Auth, Tailwind/shadcn, pg-boss ([Stack](../tech/stack.md)); docker compose local com Postgres, WAHA e RustFS.
- **Projeto-piloto de 1 hora primeiro:** Next.js 16.4 + Prisma 7 + Better Auth + TS 7 + Oxlint compilam e passam juntos; se não, voltar ao TS 6 e registrar no ADR-111.
- Oxlint, typecheck (TS 7), Vitest e Playwright configurados; CI na ordem do [padrão de qualidade](../tech/quality-gate.md).
- Docker Compose para o Coolify (`web`, `worker`, `postgres`, `waha`, `rustfs`) com variáveis geradas; tela de integrações com credenciais cifradas.
- Entidades `Environment`, `Workspace`, `User`, `Membership`, `Invite`, `Session`, `PasswordResetRequest`, `AuditLog`, `Integration` ([Modelo de dados](../tech/data-model.md)).
- Login com segundo fator TOTP (obrigatório para todos) e códigos de recuperação cifrados, sessão de 12 h de inatividade com teto de 7 dias, sessão recente para ações sensíveis, rate limit, Argon2id, logout, sair de todos, senha temporária, troca forçada, `bosun admin create` e `bosun admin unlock` ([Autenticação](../tech/auth.md)).
- Papéis fixos e o guarda de autorização no servidor; convite por link ([Papéis](../product/role.md)).
- Criar e trocar de workspace.
- Cifra AES-256-GCM para segredos (`Integration.encrypted_credentials`).
- VPS com Coolify, Cloudflare Tunnel, Tailscale, disco cifrado e o checklist CIS; backup diário e **uma restauração testada** ([Deploy](../tech/deployment.md)).

## Portar do CRMv2

Cifra, verificação de webhook, logger com redação, início do pg-boss e CSP. CI/CD e design system **não**: CI/CD em [CI/CD](../tech/cicd.md); design system novo antes desta fatia. Caminhos no [mapa de porte](../tech/crmv2-review.md).

## Mapa de módulos

Aprovado em 2026-10-23 (`/agent-skills:spec`, fase 0). Os ids são fixos; cada módulo tem a sua spec abaixo, escrita na ordem.

| Módulo | O que cobre | Depende de |
|---|---|---|
| `toolchain` | Projeto-piloto, scaffold, compose local, padrão de qualidade, `ci.yml` | — |
| `identity` | Login, Argon2id, senha, TOTP, códigos de recuperação, sessão, rate limit, troca forçada, CLI `bosun admin` | toolchain |
| `workspace` | Organization, member, invitation, papéis, guarda no servidor, extensão `workspace_id`, seletor | identity |
| `audit` | `AuditLog` e os eventos auditados | identity, workspace |
| `secrets` | Cifra AES-256-GCM, `Integration`, tela de integrações | workspace, audit |
| `delivery` | Compose do Coolify, `release.yml`, beta, `/api/health`, smoke, backup e restauração | toolchain (fecha depois de todos) |

Ordem: `toolchain` → `identity` → `workspace` → `audit` → `secrets`; `delivery` começa depois do `toolchain`, em paralelo.

Áreas comuns a todos os módulos, não repetidas aqui: [Stack](../tech/stack.md), [Engenharia](../tech/engineering.md) (estrutura, estilo, fronteiras), [Padrão de qualidade](../tech/quality-gate.md), [Estratégia de testes](../tech/test-strategy.md), [CI/CD](../tech/cicd.md).

## Spec

### toolchain

**Objetivo:** um repositório que instala, compila, passa no padrão de qualidade e roda localmente com um comando, antes de qualquer linha de produto. Usuário: quem desenvolve (humano ou agente).

**Premissas:** aplicação Next.js única (sem monorepo), `web` e `worker` da mesma imagem; pnpm; Node LTS fixado no `.nvmrc`.

**Passo 1 — projeto-piloto (até 1 h, descartável, fora do repositório):** Next.js 16.4 com `experimental.useTypeScriptCli`, TS 7, Prisma 7 com uma tabela, Better Auth com email+senha, Oxlint + tsgolint. Passa se `tsc`, `oxlint`, `next build` e um login de teste funcionam. Se falhar: registrar no ADR-111 e usar TS 6 (ou Drizzle, se o problema for o Prisma).

**Comandos (os nomes viram scripts no `package.json`):**

```bash
pnpm install --frozen-lockfile
pnpm dev            # next dev + worker em watch
pnpm typecheck      # tsc --noEmit
pnpm lint           # oxlint --deny-warnings
pnpm test           # vitest run --coverage (unit + integration; precisa do compose)
pnpm test:unit      # vitest run --project unit (sem banco)
pnpm test:int       # vitest run --project integration (Postgres e RustFS reais)
pnpm test:e2e       # playwright test
pnpm dup            # jscpd
pnpm db:migrate     # prisma migrate dev
pnpm verify         # typecheck + lint + lint_exceptions + test + dup + ./scripts/validate.sh ./okf
pnpm services:up    # docker compose com o .env.local: postgres, rustfs, waha
```

**Estrutura:** a de [Engenharia](../tech/engineering.md); a fatia cria só as pastas que usa.

**Entrega:**
- `.oxlintrc.json` com as regras e limites do padrão de qualidade; `vitest.config.ts` com limites de cobertura; `.jscpd.json`.
- `compose.dev.yml` com Postgres, RustFS e WAHA; `.env.example` sem nenhum valor real.
- `.github/workflows/ci.yml` como em [CI/CD](../tech/cicd.md), ações fixadas por SHA; `dependabot.yml`; hook de pre-commit com gitleaks.
- Página inicial mínima e o `worker` com um job de exemplo no pg-boss.

**Critério de aceite:**
1. Clone limpo + `pnpm install` + `docker compose up` + `pnpm dev` abre a página e o worker processa o job de exemplo.
2. `pnpm verify` sai 0.
3. Um PR com `any`, uma função de 61 linhas ou um segredo falso é **bloqueado** no CI (um caso por regra, em branch de teste).
4. O CI completo leva até 12 min.

**Limites:**
- Sempre: versões exatas no `package.json`; conferir a doc da versão (Context7) antes de configurar cada ferramenta.
- Perguntar antes: qualquer dependência fora da [Stack](../tech/stack.md); afrouxar um limite.
- Nunca: valor real no `.env.example`; domínio, IP ou dado da piloto no repositório.

**A conferir:** opções do `max-lines` no Oxlint, `oxlint-plugin-complexity` como jsPlugin, SHAs das ações.

### identity

**Objetivo:** a piloto entra na BOSUN com usuário ou e-mail, senha e TOTP obrigatório, sessão revogável e recuperação pelo Admin; sem cadastro público. Os três papéis usam o mesmo login; a autorização por papel entra no `workspace`.

**Premissas:**
- Better Auth 1.7.12 com sessão no banco; Argon2id; TOTP obrigatório; 10 códigos de recuperação cifrados ([ADR-102](../decisions/adr-102-identity.md), [Autenticação](../tech/auth.md)).
- Sem o plugin `admin` e sem o plugin `organization` neste módulo; o `organization` entra no `workspace` (organização = workspace).
- Sem envio de e-mail no piloto: a senha temporária é entregue pelo Admin ou pela CLI; não há verificação de e-mail, reset por link nem convite por e-mail.
- UI mínima em pt-BR, sem design system; o design system novo entra depois.
- Uma VPS por cliente; sem SSO, login social ou passkey.

**Escopo:**
- Dependências exatas: `better-auth@1.7.12`, `@node-rs/argon2@2.2.2`, `@prisma/client@7.10.1`, `@prisma/adapter-pg@7.10.1` (com `pg`) e `zod@4.6.7`. O client do Prisma é gerado em `src/generated/prisma` e instanciado com `PrismaPg` em `src/lib/db.ts`.
- Prisma: `User`, `Account`, `Session`, `Verification`, `TwoFactor`, `RateLimit`, `PasswordResetRequest`, `AuthThrottle`, `UsedTotpCode` e `AuditLog`; a primeira migration nasce aqui. `Organization`, `Member` e `Invitation` ficam para o `workspace`.
- Better Auth: e-mail/senha com `disableSignUp`, `username()` sem `displayUsername`, `twoFactor()` e `nextCookies()` por último; Argon2id no `password.hash`/`verify`; rate limit com `storage: "database"`; cookies `__Secure-`; sessão de 12 h com `updateAge` de 5 min, `freshAge` de 10 min e teto absoluto de 7 dias conferido por nós.
- Fluxos: primeiro acesso, login por usuário ou e-mail, desafio 2FA, código de recuperação, setup obrigatório de 2FA, troca forçada, pedido de reset, senha temporária pelo Admin, unlock pela CLI, sessão/recentidade, sessões ativas, logout e sair de todos.
- Rotas e telas: login, desafio 2FA, troca de senha, setup 2FA e segurança (sessões e códigos de recuperação); o layout autenticado tem logout visível.
- CLI: `bosun admin create` e `bosun admin unlock`, em `scripts/bosun.ts`, rodando no mesmo container da aplicação.
- Auditoria: a tabela e o serviço de escrita nascem aqui; a leitura e a exportação são do módulo `audit`.
- Fechamento das pendências do `toolchain` listadas no fim desta spec.
- Fora: workspace, membro, convite, papéis e autorização por papel (módulo `workspace`); envio de e-mail; login social, passkey ou SSO; exclusão ou desativação de conta; reset de 2FA pela UI (só CLI); QR code no setup 2FA; design system; leitura/exportação da auditoria (módulo `audit`).

**Decisões técnicas (a aprovar; reconciliam o ADR-102):**

1. **Sem o plugin `admin`.** Ele adiciona papel global, banimento, impersonation e endpoints `/admin/*` que não queremos; o papel é por workspace. Criação de conta, senha temporária e revogação de sessão usam um serviço nosso com Prisma e Argon2. A CLI não precisa de sessão de Admin. Com isso, o item 12 do ADR-102 perde o plugin `admin` e o "bloqueio"; remoção de membro + revogação de sessões cobrem o piloto.
2. **Cookie `__Secure-`, não `__Host-`.** O Better Auth prefixa cookies seguros com `__Secure-`; `__Host-` exigiria forkar o tratamento de cookies. O item 14 do ADR-102 passa a citar `__Secure-`.
3. **Revogação por exclusão da linha da sessão.** O Better Auth não tem `revoked_at`/`revoked_reason`; o motivo vai para o `AuditLog`. O item 5 do ADR-102 perde essas duas colunas. A exclusão vale na requisição seguinte porque o `cookieCache` está desligado.
4. **Cinco sessões concorrentes por usuário.** Ao criar a sexta, a mais antiga é excluída numa única instrução; a sessão atual nunca é a mais antiga. Atende ao ASVS 7.1.2.
5. **Senha de 12 a 128 caracteres**, sem regra de composição, sem truncar nem normalizar; lista embutida das 3.000 senhas mais comuns e das palavras do contexto (`bosun`, `admin`, `workspace`, `piloto`, `senha`), mais o usuário e a parte local do e-mail. A nova não pode ser igual à atual (verificada pelo hash). Sem expiração periódica; só a senha temporária expira. A checagem de senha vazada continua fora (exceção do ADR-102).
6. **TOTP de uso único.** O plugin não impede repetir o mesmo código dentro da janela; o ASVS 6.5.1 (nível 2) exige uso único. A rota de verificação grava `HMAC-SHA-256(BETTER_AUTH_SECRET, userId + ":" + code)` em `UsedTotpCode`, com validade de 120 s e único por `(userId, codeHash)`. Se o código já foi usado, a sessão recém-criada é revogada e a resposta é 401. A limpeza é oportunista e no job diário.
7. **Sessão recente = novo login.** O `freshAge` do Better Auth usa `createdAt`; para uma ação sensível fora dos 10 min, a UI pede senha + TOTP (ou código de recuperação) e a rota refaz o login nativo, cria uma sessão nova, exclui a antiga e troca o cookie. Atende ao ASVS 7.2.4 e 7.5.1 sem inventar um "renovar frescor" que o Better Auth não tem.
8. **Senha temporária gerada pelo sistema, válida por 72 h.** O Admin dispara, mas não escolhe a senha (ASVS 6.4.6, nível 3, como boa prática). São 20 caracteres de `crypto.randomBytes(15).toString("base64url")`, mostrados uma vez, com `mustChangePassword` e `tempPasswordExpiresAt`; a troca zera os dois. O CLI `unlock` faz o mesmo e ainda apaga o `TwoFactor` e todas as sessões. Toda troca de credencial sobe `User.credentialsVersion`; o login lê a versão antes de conferir a senha e recusa no fim se ela mudou; com 2FA, a versão fica presa ao desafio (`Verification` `bosun-cv-<id>`) e a confirmação recusa se ela mudou até a sessão nascer. A senha temporária também apaga os desafios de 2FA pendentes e, depois do commit, as sessões de novo (a senha ainda não foi mostrada). O `unlock` grava `twoFactorResetAt` e o setup do 2FA avisa a pessoa.
9. **Sem QR no setup do TOTP.** A tela mostra o segredo em grupos de 4 e o URI `otpauth://` copiável; o QR entra com o design system. Nenhum pacote novo de QR.
10. **Sem bloqueio global de conta.** A remoção do membro e a revogação de sessões no `workspace` resolvem o acesso; uma conta sem workspace não vê dado. Desativar/excluir conta fica fora do piloto (e o ASVS 7.4.2 só se aplica se existir).

**Fluxos:**

1. **Primeiro acesso (CLI).** `pnpm bosun admin create --username <u> --email <e> --name "<nome>"` cria `User` + `Account` (`providerId: "credential"`) com Argon2id, `emailVerified: true`, `mustChangePassword: true` e senha temporária de 72 h. Imprime a senha uma vez e o endereço de login. O `workspace` depois torna essa conta Admin do primeiro workspace; até lá, o login cai numa página mínima.
2. **Login.** `POST /api/auth/login` recebe `{ identifier, password }`; se tiver `@`, chama `auth.api.signInEmail`; senão, `auth.api.signInUsername`. O wrapper aplica o throttle por conta e por IP, registra falha genérica ("Usuário ou senha inválidos"), não revela se a conta existe e, em sucesso, encaminha os cookies do Better Auth. Com 2FA ligado, a resposta é `{ twoFactorRedirect: true }` e o cookie de desafio; sem 2FA, a sessão já é criada.
3. **Desafio 2FA.** A tela `/login/2fa` envia o código para `POST /api/auth/2fa/verify` (TOTP) ou `/api/auth/2fa/recovery` (código de recuperação). O wrapper valida o desafio, aplica o uso único do TOTP, encaminha o cookie de sessão e audita. O desafio vale 10 min e é de uso único; o lockout do plugin é 10 falhas em 15 min. As rotas nativas `/two-factor/verify-*` e `/two-factor/disable` ficam bloqueadas no catch-all.
4. **Setup obrigatório de 2FA.** Depois da troca de senha, `/setup/2fa` pede a senha, chama `twoFactor.enable` (segredo cifrado e 10 códigos cifrados), mostra o segredo/URI, pede o primeiro código e usa a rota acima para confirmar. O plugin marca `twoFactorEnabled`, rotaciona a sessão e os 10 códigos são mostrados uma vez. Recomeçar substitui o segredo não verificado.
5. **Troca forçada de senha.** `/change-password` pede a senha atual (temporária) e a nova. O serviço nosso verifica a atual, aplica a política, grava o novo hash, zera `mustChangePassword`/`tempPasswordExpiresAt`, revoga as outras sessões e audita. A rota nativa `/change-password` fica bloqueada.
6. **Esqueceu a senha.** `/login` tem "Esqueci a senha"; `POST /api/auth/password-reset-request` responde 202 sempre (exceto 429 com mais de 100 pedidos do IP em 15 min; acima de 3 pedidos do mesmo identificador, 202 sem gravar nada) e, se a conta existir, cria um `PasswordResetRequest` pendente (um por usuário, índice único parcial). O Admin vê o pedido na UI do `workspace` (próximo módulo) e dispara a senha temporária pelo serviço do `identity`; a UI mostra a senha uma vez.
7. **Unlock pela CLI.** `pnpm bosun admin unlock <email> --reason "<texto>"` (motivo obrigatório; a auditoria grava também `usuário@máquina` de quem rodou) gera a senha temporária, zera o `TwoFactor` (segredo e códigos), revoga todas as sessões, resolve pedidos pendentes e audita com ator `operator`. É o último recurso quando o celular e os códigos foram perdidos.
8. **Sessão e recentidade.** Toda rota/página autenticada usa `requireSession()`; o layout `(app)` chama `requireReadySession()` e redireciona para troca de senha ou setup 2FA. O teto de 7 dias é conferido sobre `createdAt`; passou, a sessão é excluída e auditada. Ações sensíveis usam `readFresh()` (o `requireFreshSession()` das rotas: 10 min) e o step-up do item 7 das decisões.
9. **Sessões ativas e logout.** `/security` lista as sessões (dispositivo, IP, criada, visto por último), permite revogar as outras, sair de todos e gerar códigos de recuperação novos (senha + sessão fresca; os anteriores deixam de valer). As rotas de formulário exigem o primeiro acesso concluído; encerrar sessões não pede sessão recente (ação defensiva). O logout fica visível no cabeçalho de toda página autenticada; "sair de todos" revoga inclusive a atual, apaga o cookie e volta ao login.

**Modelos** (campos principais; o resto segue o schema do Better Auth):

- `User` (`id` UUID, `name`, `email` único, `emailVerified`, `image`, `username` único, `twoFactorEnabled`, `mustChangePassword`, `tempPasswordExpiresAt`, `credentialsVersion`, `twoFactorResetAt`, `createdAt`, `updatedAt`). `email` e `username` em minúsculas; `username` valida `^[a-z0-9][a-z0-9._-]{2,31}$`. `displayUsername` desligado.
- `Account` (`id`, `accountId`, `providerId`, `userId`, `password`, tokens OAuth nulos, `createdAt`, `updatedAt`); a senha fica no `Account` de `providerId = "credential"`, nunca no `User`.
- `Session` (`id`, `token` único, `userId`, `expiresAt`, `createdAt`, `updatedAt`, `ipAddress`, `userAgent`). `updatedAt` é o "visto por último" (no máximo a cada 5 min); não há `revoked_at`/`revoked_reason`. `activeOrganizationId` entra com o plugin do `workspace`.
- `Verification` (`id`, `identifier`, `value`, `expiresAt`, `createdAt`, `updatedAt`): desafios 2FA e contadores do plugin.
- `TwoFactor` (`id`, `userId`, `secret` cifrado, `backupCodes` cifrados, `verified`, `failedVerificationCount`, `lockedUntil`).
- `RateLimit` (`id`, `key` único, `count`, `lastRequest` bigint): rate limit do Better Auth no banco.
- `AuthThrottle` (`key` PK, `count`, `windowStartedAt`, `blockedUntil`, `updatedAt`): throttle nosso por conta e por IP; incremento atômico.
- `UsedTotpCode` (`id`, `userId`, `codeHash`, `expiresAt`, `createdAt`); único `(userId, codeHash)` e índice em `expiresAt`.
- `PasswordResetRequest` (`id`, `userId`, `status`: pending | resolved | dismissed, `requestedAt`, `resolvedAt`, `resolvedByUserId`, `createdAt`, `updatedAt`); um pendente por usuário por índice único parcial.
- `AuditLog` (`id`, `workspaceId?`, `actorType`: user | operator | system, `actorId?`, `action`, `targetType?`, `targetId?`, `data` JSONB, `createdAt`). Sem FK de workspace no identity; `workspaceId` é nulo nos eventos de autenticação. Só inserção; nenhum segredo no `data`.

**Rotas e telas:**

- Públicas: `/login`, `/login/2fa`; `POST /api/auth/login`, `/api/auth/2fa/verify`, `/api/auth/2fa/recovery`, `/api/auth/password-reset-request`.
- Autenticadas: `/change-password`, `/setup/2fa`, `/security`; `POST /api/auth/step-up`; `GET /api/auth/session` (a nossa, com o teto de 7 dias); o catch-all `/api/auth/[...all]` só expõe o que a UI usa e bloqueia as rotas nativas de credencial/2FA listadas.
- Layout: `(auth)` público, `(onboarding)` exige sessão mas aceita `mustChangePassword`/2FA pendente, `(app)` exige `requireReadySession()`. O `proxy.ts` cuida só da CSP e do nonce; nenhuma decisão de autorização nele.
- CLI: `pnpm bosun admin create ...` e `pnpm bosun admin unlock ...`; o script importa o serviço do `identity`, abre o Prisma, executa e fecha; imprime a senha temporária só em stdout, nunca em log.

**Segurança e limites operacionais:**

- **Throttle do login:** falhas por conta em 15 min: 5 → 30 s de espera; 10 → 5 min; 20 → 15 min; sucesso zera. Por IP: 100 tentativas em 15 min. O `RateLimit` do Better Auth protege o resto do catch-all (100 req/min por IP) e sobrevive a reinício.
- **Throttle do 2FA:** lockout nativo do plugin em 10 falhas/15 min por conta; por IP, 50 tentativas/15 min na nossa rota. O desafio de 10 min é de uso único.
- **Cookies/CSRF:** `__Secure-bosun.session_token` em produção (sem `Domain`), `HttpOnly`, `Secure`, `SameSite=Lax`, `Path=/`; `bosun.session_token` em dev. `cookieCache` desligado. Mutações nossas exigem `Origin` do `BETTER_AUTH_URL` e JSON; as Server Actions usam a checagem do Next; o Better Auth valida `trustedOrigins`.
- **Senha:** Argon2id com 64 MiB, 3 iterações, 4 lanes e 32 bytes; medir no VPS e baixar para 32 MiB/3 se passar de 500 ms. `type=password`, colar e gerenciador de senhas permitidos; sem normalização.
- **Segredos:** `BETTER_AUTH_SECRET` (32+ bytes) cifra o segredo TOTP e os códigos de recuperação; precisa estar no backup e não pode ser rotacionado sem plano (rotação = todos perdem 2FA). Nunca logar senha, código, token, segredo ou cookie.
- **CSP:** `src/proxy.ts` gera nonce por requisição e envia `Content-Security-Policy` + `x-nonce`; `script-src 'self' 'nonce-…' 'strict-dynamic'` (+ `'unsafe-eval'` só em dev), `style-src` com nonce em produção e `'unsafe-inline'` em dev, `img-src 'self' blob: data:`, `font-src 'self'`, `connect-src 'self'`, `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`, `frame-ancestors 'none'`, `upgrade-insecure-requests` só em produção. Páginas dinâmicas (`connection()` no layout raiz).
- **Auditoria:** eventos `auth.account.created`, `auth.login.failed`, `auth.login.succeeded`, `auth.2fa.challenge`, `auth.2fa.succeeded`, `auth.2fa.failed`, `auth.2fa.replayed`, `auth.2fa.enrolled`, `auth.2fa.reset`, `auth.recovery_code.used`, `auth.password.changed`, `auth.password.temp_issued`, `auth.password.reset_requested`, `auth.session.revoked`, `auth.session.absolute_expired`, `auth.rate_limited`, `auth.logout`, `auth.logout_all`, `auth.step_up.succeeded`, `auth.step_up.failed`. Estado sensível + auditoria na mesma transação; eventos de login podem ser best-effort com erro no logger. Sem identificador cru de tentativa desconhecida: guardar hash.

**Critério de aceite:**

1. `bosun admin create` cria a conta; o primeiro login com a senha temporária força a troca e, em seguida, o setup do TOTP com 10 códigos mostrados uma vez; depois de logout, o login exige TOTP.
2. Usuário inexistente e senha errada devolvem a mesma mensagem; a conta é throttled conforme a tabela e o evento é auditado; o contador sobrevive a reinício do processo.
3. Sessão expira após 12 h sem uso e após 7 dias absolutos; "sair de todos" revoga todas; trocar a senha revoga as outras; a sexta sessão remove a mais antiga.
4. Ação sensível com sessão de mais de 10 min recebe `SESSION_NOT_FRESH`; o step-up com senha + TOTP (ou recuperação) cria sessão nova, revoga a antiga e volta à ação.
5. O mesmo código TOTP não é aceito duas vezes dentro da janela, inclusive em duas requisições concorrentes; a segunda tem a sessão revogada.
6. `bosun admin unlock` reseta senha e 2FA, revoga sessões e grava auditoria com ator `operator`; a senha temporária expira em 72 h.
7. A CSP com nonce aparece em toda página; em produção não há `unsafe-inline`/`unsafe-eval`; `/api/dev/*` não existe.
8. `pnpm verify` sai 0; o glob do `identity` tem 90% de ramos e 80% de linhas; a integração aplica migrations no `bosun_test`; o job `e2e` sobe Postgres, migra, semeia e roda o fluxo de login.
9. Nenhum segredo (senha, TOTP, código de recuperação, token de sessão, `BETTER_AUTH_SECRET`) aparece em log, auditoria ou erro HTTP.
10. As tabelas e índices do item "Modelos" existem na migration; nenhuma consulta do `identity` fica sem o escopo do usuário/sessão correto.

**Testes:**

- Unitários: Argon2id (hash/verify), política de senha (12/128, lista comum, contexto, nova = atual), throttle (janela, bloqueio, reset, incremento atômico), replay do TOTP (primeiro uso, repetição, expiração), teto de 7 dias e `mustChangePassword` no `requireSession`, CSP (prod/dev), sanitização da auditoria, shutdown com timeout e job por estado.
- Integração (Postgres real): migration; CLI create; login certo/errado; throttle após N falhas; setup 2FA e 10 códigos cifrados; login com TOTP; replay; código de recuperação usado uma vez; troca de senha (hash novo, antigo falha, outras sessões somem); senha temporária expirada; unlock (2FA zerado, sessões revogadas, auditoria `operator`); quinta/sexta sessão; teto absoluto; limpeza diária; job com retry, duplicado e shutdown com job em andamento.
- E2E (Playwright, build de produção): login com senha temporária → troca → setup 2FA (segredo e código capturados) → logout → login com TOTP → home; erro genérico; código de recuperação; CSP sem violação no console.
- Cobertura: `src/modules/identity/**` com 90% de ramos e 80% de linhas; páginas/layouts ficam no E2E.

**Limites:**

- Sempre: autorização e sessão no servidor; `workspace_id` em toda consulta de negócio (quando a tabela existir); auditar ação sensível; conferir a doc da versão do Better Auth antes de configurar; rodar o validador e os testes.
- Perguntar antes: trocar a versão do Better Auth, mudar duração de sessão, afrouxar rate limit ou política de senha, adicionar fator de autenticação, criar rota nativa nova no catch-all, mexer no segredo que cifra o 2FA.
- Nunca: confiar em permissão do cliente; logar segredo, senha, código ou token; guardar senha em texto; deixar `/sign-up`, `/forget-password`, `/reset-password`, `/change-password`, `/set-password`, `/two-factor/verify-*`, `/two-factor/disable`, `/get-session` ou `/admin/*` nativos abertos; rodar a CLI com senha em argumento.

**Pendências herdadas do `toolchain` (fecham aqui):**

- CSP com nonce: `src/proxy.ts` + `x-nonce`, páginas dinâmicas; teste de header e de console no E2E.
- `/api/dev/*`: apagar a rota e o teste unitário; a integração enfileira direto; o E2E afirma 404.
- Cobertura de 90% de ramos por glob: threshold `src/modules/identity/**` no `vitest.config.ts`.
- Banco fora do ar na rota: teste com dublê da camada de dados garante 503 genérico, sem vazar erro.
- Job que falha com retry, job duplicado e shutdown com job em andamento: testes do job de limpeza e do `createShutdown`, com timeout de 10 s.
- Confirmar o job pelo estado no pg-boss: o teste de integração usa `getJobById`/estado `completed`, não o texto do log.
- Portas do compose configuráveis: `POSTGRES_PORT`, `RUSTFS_PORT` e `WAHA_PORT` no `compose.dev.yml` e no `.env.example`.
- `prisma migrate deploy` no setup de integração e no job `e2e` do CI, com Postgres, seed e variáveis de teste; `bosun_test` e `bosun_e2e` separados.

**Decisões (aprovadas pelo usuário em 2026-10-26, todas como recomendado):**

1. As três reconciliações do ADR-102: sem plugin `admin`, cookie `__Secure-`, revogação por exclusão (sem `revoked_at`/`revoked_reason`).
2. Cinco sessões concorrentes; senha mínima de 12.
3. `UsedTotpCode` para uso único do TOTP; step-up é um novo login que revoga a sessão antiga.
4. Senha temporária gerada pelo sistema, mostrada uma vez, válida por 72 h, no lugar de "Admin define a senha".
5. Setup 2FA sem QR no piloto (segredo + URI em texto); o QR entra com o design system.
6. `emailVerified: true` no provisionamento; sem bloqueio nem desativação de conta no piloto.

### workspace, audit, secrets, delivery

A escrever, um por vez, depois da aprovação da spec anterior.

## Dependências

Nenhuma fatia. Bloqueio externo: VPS e domínio da piloto.

## Critério de aceite

1. O Admin criado pela CLI entra, troca a senha e convida um Membro, que entra pelo link.
2. Um Viewer recebe 403 numa ação de escrita, testada no servidor.
3. Uma consulta sem `workspace_id` não passa no teste de repositório.
4. A restauração do backup na VPS devolve o banco com os usuários.

## Testes

- Unitários: hash e verificação de senha, cifra, guarda de autorização.
- Integração: login, revogação de sessão, convite, troca forçada.
- E2E: login → troca de senha → convite → aceite.

## Perguntas abertas

Nenhuma. As seis do `identity` foram decididas em 2026-10-26 (ver a spec acima).

## Tarefas

Feito com `/agent-skills:plan` em 2026-10-23. Módulo `toolchain`; os outros módulos ganham tarefas quando a spec deles for aprovada. Uma tarefa = um commit; `[x]` só com a verificação mostrada.

### toolchain

Grafo: T1 → T2 → (T3, T4, T5) → T6 → T7. T3, T4 e T5 podem correr em paralelo.

- [x] **T1 — Projeto-piloto da stack** (fora do repositório, até 1 h)
  - Aceite: Next 16.4 + `useTypeScriptCli` + TS 7, Prisma 7 com uma tabela, Better Auth email+senha e Oxlint + tsgolint passam em `tsc`, `oxlint`, `next build` e um login de teste. Opções do `max-lines` e o `oxlint-plugin-complexity` como jsPlugin conferidos.
  - Verificar: saída dos quatro comandos colada no log; resultado (passou ou fallback) registrado no ADR-111.
  - Arquivos: `okf/decisions/adr-111-architecture.md`, `okf/log.md`.
- [x] **T2 — Scaffold que roda** (fatia vertical mínima)
  - Aceite: `pnpm install --frozen-lockfile` + `pnpm dev` abre a página inicial; versões exatas; `.nvmrc`; `.env.example` sem valor real.
  - Verificar: clone limpo em pasta temporária, os dois comandos, página responde 200.
  - Arquivos: `package.json`, `pnpm-lock.yaml`, `.nvmrc`, `next.config.ts`, `tsconfig.json`, `src/app/page.tsx`, `src/app/layout.tsx`, `pnpm-workspace.yaml`, `.env.example`.
- [x] **T3 — Banco e worker locais**
  - Aceite: `compose.dev.yml` sobe Postgres, RustFS e WAHA; `pnpm db:migrate` cria o schema e o do pg-boss; o `worker` processa um job de exemplo enfileirado pelo `web`.
  - Verificar: `docker compose -f compose.dev.yml up -d`, `pnpm db:migrate`, log do worker com o job concluído.
  - Arquivos: `compose.dev.yml`, `prisma/schema.prisma`, `prisma.config.ts`, `worker/index.ts`, `worker/migrate.ts`, `src/lib/queue.ts`, `src/app/api/dev/example-job/route.ts`. `prisma/migrations/` nasce com o primeiro modelo, no `identity`.
- [x] **T4 — Lint e typecheck no padrão de qualidade**
  - Aceite: `.oxlintrc.json` com todas as regras e limites do [padrão de qualidade](../tech/quality-gate.md); `pnpm typecheck` e `pnpm lint` saem 0; um arquivo de teste com `any` e outro com função de 61 linhas falham.
  - Verificar: os dois comandos verdes; os dois casos ruins vermelhos (e removidos depois).
  - Arquivos: `.oxlintrc.json`, `package.json`, `src/lib/logger.ts` (único ponto com `console`).
- [x] **T5 — Testes, cobertura e duplicação**
  - Aceite: Vitest com projetos `unit` e `integration` e limites de cobertura; Playwright com um teste da página inicial; jscpd com limite de 3%; `pnpm verify` sai 0.
  - Verificar: `pnpm test`, `pnpm test:int` (contra o compose), `pnpm test:e2e`, `pnpm dup`, `pnpm verify`.
  - Arquivos: `vitest.config.ts`, `playwright.config.ts`, `e2e/home.spec.ts`, `.jscpd.json`, `package.json`, `tests/integration/`, `src/lib/worker.ts` e os `*.test.ts`. A meta de 90% de ramos nos módulos críticos entra nas fatias que os criam.
- [x] **T6 — CI e cadeia de suprimentos**
  - Aceite: `ci.yml` com os jobs `check`, `e2e`, `security` (gitleaks, osv-scanner) e CodeQL (o Semgrep saiu: regras do registro sem versão fixa), ações fixadas por SHA e `permissions: contents: read`; job `check` com Postgres de serviço (o `pnpm test` inclui a integração), `playwright install chromium` no job `e2e`; passo que reprova `oxlint-disable` sem `-- motivo` e conta as exceções contra um teto (o oxlint não faz isso); `dependabot.yml`; pre-commit com gitleaks; secret scanning e push protection ligados no GitHub.
  - Verificar: PR de teste verde em até 12 min; três PRs de teste (`any`, função longa, segredo falso) bloqueados.
  - Arquivos: `.github/workflows/ci.yml`, `.github/workflows/codeql.yml`, `.github/dependabot.yml`, `.githooks/pre-commit`, `osv-scanner.toml`, `scripts/lint_exceptions.sh` e o self-test. Sem job `integration` próprio: a integração roda no `check`. Hook git em vez do framework pre-commit, que exigiria Python e Go.
- [x] **T7 — Fechamento do módulo**
  - Aceite: comandos exatos no `AGENTS.md` (seção Comandos); `resource` preenchido nos conceitos materializados; os quatro critérios de aceite do `toolchain` com evidência.
  - Verificar: `./scripts/validate.sh ./okf` sem erro; revisão com `/agent-skills:review`.
  - Arquivos: `AGENTS.md`, `okf/tech/stack.md`, `okf/log.md`, esta fatia.

**Pendências do `/agent-skills:ship` do `toolchain`** (2026-10-23), a assumir nos módulos indicados:
- `identity`: CSP com nonce (os outros cabeçalhos de segurança já estão no `next.config.ts`); remover ou bloquear `/api/dev/*` quando houver auth; limite de 90% de ramos no Vitest por glob do módulo; testes de banco fora do ar na rota, de job que falha com retry, de job duplicado e de shutdown com job em andamento; `createShutdown` com timeout no `stop`; confirmar o job pelo estado no pg-boss, não pelo texto do log; portas do compose configuráveis para worktrees em paralelo.
- `delivery`: dois papéis no Postgres (`migrate` com DDL, `web` e `worker` sem) e `sslmode` explícito fora do loopback; healthcheck de RustFS e WAHA; cobertura de 80% também no código novo (diferencial).

**Ponto de checagem:** depois da T1 (stack confirmada ou trocada) e depois da T7 (módulo aceito), antes de escrever a spec do `identity`.

**Riscos:** TS 7 sem suporte do Prisma ou do Next (mitigado pela T1); regras do Oxlint sem a opção esperada (T1 confere, T4 registra a exceção); repositório no GitHub ainda não criado (necessário na T6: o usuário cria o repositório público).

### identity

Feito com `/agent-skills:plan` em 2026-10-26. Grafo: I1 → I2 → I3 → I4 → I5 → (I6, I7) → I9 → I10. I8 é independente e pode correr em paralelo desde o início. Checkpoints com o usuário depois de I5 (fluxo de login completo) e antes de I10.

- [x] **I1 — Schema, cliente e banco de teste**
  - Aceite: dependências exatas da spec instaladas; os 10 modelos com índices (únicos e parcial do `PasswordResetRequest`) na primeira migration; `src/lib/db.ts` com `PrismaPg`; a integração roda `prisma migrate deploy` no `bosun_test`; portas do compose configuráveis.
  - Verificar: `pnpm db:migrate`, `pnpm test:int` contra banco limpo; `\d` das tabelas confere com "Modelos".
  - Arquivos: `package.json`, `prisma/schema.prisma`, `prisma/migrations/`, `src/lib/db.ts`, `tests/integration/global-setup.ts`, `compose.dev.yml`, `.env.example`.
- [x] **I2 — Senha, auditoria e `bosun admin create`**
  - Aceite: Argon2id com os parâmetros da spec; política de senha (12–128, lista comum, contexto, nova ≠ atual); serviço de auditoria só inserção e sem segredo; CLI cria `User` + `Account` com senha temporária de 72 h impressa uma vez, `emailVerified: true`, auditando `auth.account.created`.
  - Verificar: unitários de hash, política e sanitização; integração da CLI create.
  - Arquivos: `src/modules/identity/password.ts`, `src/modules/identity/audit.ts`, `src/modules/identity/accounts.ts`, `scripts/bosun.ts` e os testes.
- [x] **I3 — Login e sessão**
  - Aceite: Better Auth configurado (sem `admin`, `disableSignUp`, `username`, cookie `__Secure-`, `cookieCache` off, rate limit no banco); catch-all bloqueia as rotas nativas da lista "Nunca"; `POST /api/auth/login` com mensagem genérica, throttle por conta e IP (`AuthThrottle`) e auditoria; `/login`; `requireSession()` com teto de 7 dias; limite de 5 sessões; logout no cabeçalho.
  - Verificar: unitários do throttle e do teto; integração login certo/errado, throttle após N falhas, sexta sessão, teto absoluto, rotas nativas 404.
  - Arquivos: `src/modules/identity/auth.ts`, `src/modules/identity/session.ts`, `src/modules/identity/throttle.ts`, `src/app/api/auth/`, `src/app/(auth)/login/page.tsx`.
- [x] **I4 — Troca forçada de senha**
  - Aceite: layouts `(onboarding)` e `(app)` com `requireReadySession()`; `/change-password` valida a atual, aplica a política, zera `mustChangePassword`/`tempPasswordExpiresAt`, revoga as outras sessões e audita na mesma transação; senha temporária vencida não entra.
  - Verificar: integração da troca (hash novo, antigo falha, outras sessões somem) e da temporária expirada.
  - Arquivos: `src/modules/identity/accounts.ts`, `src/app/(onboarding)/change-password/`, `src/app/(app)/layout.tsx`, `src/app/(onboarding)/layout.tsx`.
- [x] **I5 — 2FA: setup, desafio, uso único e recuperação**
  - Aceite: `/setup/2fa` sem QR (segredo em grupos de 4 e URI); 10 códigos cifrados mostrados uma vez; `/login/2fa` + `/api/auth/2fa/verify|recovery`; `UsedTotpCode` com HMAC rejeita replay inclusive concorrente e revoga a sessão nova; throttle por IP de 50/15 min; auditoria.
  - Verificar: unitário do replay; integração setup, login com TOTP, replay concorrente, código de recuperação uma vez; E2E do caminho completo (critério 1).
  - Arquivos: `src/modules/identity/totp.ts`, `src/app/api/auth/2fa/`, `src/app/(auth)/login/2fa/`, `src/app/(onboarding)/setup/2fa/`, `e2e/login.spec.ts`.
- [x] **Checkpoint: login completo** — `pnpm verify` e `pnpm test:e2e` verdes; revisão com o usuário antes de seguir.
- [x] **I6 — Sessões ativas, sair de todos e step-up**
  - Aceite: `/security` lista sessões, revoga as outras, sair de todos (inclui a atual) e gera códigos novos com senha + sessão fresca; `readFresh()` devolve `SESSION_NOT_FRESH`; `POST /api/auth/step-up` cria sessão nova e apaga a antiga.
  - Verificar: integração dos critérios 3 e 4.
  - Arquivos: `src/modules/identity/session.ts`, `src/app/api/auth/step-up/route.ts`, `src/app/(app)/security/`.
- [x] **I7 — Pedido de reset, senha temporária e `bosun admin unlock`**
  - Aceite: `POST /api/auth/password-reset-request` sempre 202 e um pendente por usuário; serviço de senha temporária para o Admin (a UI fica no `workspace`); `unlock` zera senha e `TwoFactor`, revoga sessões, resolve pedidos e audita com ator `operator`.
  - Verificar: integração do pedido (conta existente e inexistente) e do unlock (critério 6).
  - Arquivos: `src/modules/identity/recovery.ts`, `src/app/api/auth/password-reset-request/route.ts`, `src/app/(auth)/login/`, `scripts/bosun.ts`.
- [x] **I8 — CSP com nonce e fim do `/api/dev`**
  - Aceite: `src/proxy.ts` com nonce e a política da spec (sem `unsafe-*` em produção); layout raiz dinâmico; `/api/dev/*` e o teste apagados; a integração enfileira direto e confirma o job pelo estado no pg-boss.
  - Verificar: unitário da CSP prod/dev; E2E com header, console sem violação e `/api/dev/example-job` 404.
  - Arquivos: `src/proxy.ts`, `src/app/layout.tsx`, `src/app/api/dev/` (apagar), `tests/integration/`, `e2e/home.spec.ts`.
- [x] **I9 — Limpeza diária e robustez da fila**
  - Aceite: job diário apaga `UsedTotpCode`, `AuthThrottle` e `Verification` vencidos; testes de retry, job duplicado e shutdown com job em andamento (timeout de 10 s); banco fora do ar devolve 503 genérico.
  - Verificar: integração do job e do shutdown; unitário do 503 com dublê.
  - Arquivos: `worker/index.ts`, `src/modules/identity/cleanup.ts`, `src/lib/worker.ts` e os testes.
- [x] **I10 — Fechamento do módulo**
  - Aceite: job `e2e` do CI sobe Postgres, migra `bosun_e2e`, semeia e roda o login; threshold de 90% ramos/80% linhas em `src/modules/identity/**`; os 10 critérios de aceite do `identity` com evidência; nenhum segredo em log (critério 9).
  - Verificar: `pnpm verify`, PR com CI verde, `./scripts/validate.sh ./okf`, `/agent-skills:review`.
  - Arquivos: `.github/workflows/ci.yml`, `vitest.config.ts`, `AGENTS.md`, `okf/tech/stack.md`, `okf/log.md`, esta fatia.

### Evidência dos critérios de aceite do `identity`

Conferida em 2026-10-27 (`pnpm verify` com 146 testes, E2E com 11, `./scripts/validate.sh ./okf` sem erro):

1. Primeiro acesso completo: `e2e/login.spec.ts` (CLI cria a conta → senha temporária → troca → setup do 2FA com 10 códigos → logout → login com TOTP → login com código de recuperação), sobre o build de produção e o banco `bosun_e2e`.
2. Mensagem genérica, throttle por conta e por IP, auditoria, contador no banco: `tests/integration/login.test.ts`, `e2e/home.spec.ts` ("login errado").
3. Sessão (12 h, 7 dias, sair de todos, troca de senha revoga as outras, sexta sessão): `tests/integration/sessions.test.ts`, `login.test.ts`, `password-change.test.ts`.
4. Sessão recente e step-up: `tests/integration/sessions.test.ts` (`SESSION_NOT_FRESH`, step-up troca a sessão, 10 min no limite, códigos novos).
5. TOTP de uso único, inclusive concorrente: `tests/integration/two-factor.test.ts`; versão da credencial presa ao desafio: `challenge.test.ts`.
6. `bosun admin unlock`: `tests/integration/recovery.test.ts` (2FA zerado, sessões revogadas, ator `operator`, 72 h, motivo obrigatório).
7. CSP com nonce, sem `unsafe-*` em produção, `/api/dev` inexistente: `src/proxy.test.ts`, `e2e/home.spec.ts`.
8. `pnpm verify` sai 0; `src/modules/identity/**` com piso de 90% de ramos e 80% de linhas no `vitest.config.ts` (hoje 92%); integração no `bosun_test`; o job `e2e` do CI sobe o Postgres e o Playwright cria e migra o `bosun_e2e`, semeia pela CLI e roda o login.
9. Nenhum segredo em log, auditoria ou erro HTTP: `tests/integration/no-secrets.test.ts` (senha, temporária, TOTP, códigos de recuperação, token de sessão e `BETTER_AUTH_SECRET`).
10. Tabelas e índices na migration: `tests/integration/db.test.ts`; consultas do `identity` filtram pelo usuário ou pela sessão (revisões das tarefas).

## Ao terminar

Acrescente ao `AGENTS.md` os comandos exatos (instalar, lint, typecheck, testes, migrations, ambiente local) e preencha o `resource` dos conceitos que a fatia materializou.

## Relations

- details: [Arquitetura](../tech/architecture.md)
- depends_on: [Papéis](../product/role.md)
- governed_by: [ADR-111 — Arquitetura, operação e privacidade](../decisions/adr-111-architecture.md)
