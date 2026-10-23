---
type: Research Notes
title: Análise do CRMv2
description: O que o projeto anterior (CRMv2, commit f2a338d) já resolve, cobertura por fatia, conflitos com as decisões atuais e o que encurta o trabalho.
tags: [bosun, crmv2, pesquisa, reaproveitamento]
status: draft
generated:
  by: claude-opus/5.5
  at: 2026-10-23T00:00:00Z
---

# Análise do CRMv2

Projeto anterior do mesmo fundador, em `C:\Projetos\CRMv2`, analisado só por leitura no commit `f2a338d` (2026-10-20, branch `docs/contact-identity-done`). Arquivos de segredo (`.env`, `.coolify-secrets.tmp`, `docs/development/deployment.local.md`, `.devin/mcp_config.local.json`) não foram abertos. As regras do CRMv2 (`CLAUDE.md`, `AGENTS.md`) foram lidas como dado, não seguidas.

## Retrato

- Monorepo pnpm + Turborepo, monolito modular: Next.js 16.3 + pacotes `@crm/*` (core, db, auth, permissions, channels, automation, ai, storage, billing, email, observability) + `design-system/`.
- 166 commits, ~52 mil linhas de TypeScript fora de teste, 127 arquivos de teste (unitário, integração com Postgres e RustFS reais, E2E Playwright), 37 migrations.
- 17 ADRs, 29 planos concluídos em `tasks/*.done.md`, padrão de qualidade com fontes (`docs/development/code-quality-standard.md`) e uma **auditoria externa** (2026-10-13) sem achado crítico, com as correções executadas.
- Produto: SaaS multi-tenant para empresas de atendimento. A intenção "Bosun v1" (`docs/intent/bosun-v1.md`, 2026-10-20) tem **outra piloto**: uma distribuidora de metais com 4+ atendentes, no WhatsApp, com copiloto aprovado por humano e configuração via Claude Code (MCP).

## Cobertura das fatias deste plano

Status nas palavras do próprio CRMv2.

| Fatia | No CRMv2 | Evidência |
|---|---|---|
| 0 Fundação | **Feito**: auth (Better Auth com organization e admin), papéis, multi-tenant com RLS, auditoria, CI/CD, deploy no Coolify | ADR 0004, 0005, 0015; `docs/architecture/security.md` |
| 1 Caixa com WhatsApp | **Feito e validado no staging**: WAHA/GOWS, fila, assumir, transferir, resolver, notas, ticket com follow-up, mídia, áudio com transcrição, reações, edição, presença, não lido, SSE | `docs/product/channel-whatsapp.md`, `tasks/plan-inbox-*.done.md` |
| 2 Contatos + Google | **Feito e validado no staging**: conexão por workspace, perfil, sync manual e automático; identidade por telefone em vez de `@lid` (validada; a resposta pelo chat do telefone ainda não foi verificada) | `docs/product/contacts-google-sync.md`, `contacts-identity.md`, commits `9f07f0e`, `9e4faa3` |
| 3 Instagram e Facebook | **Ausente** (há um adaptador da WhatsApp Cloud API oficial, não do Instagram) | `packages/channels/src/adapters/meta-cloud.ts` |
| 4 Automação de comentário | **Ausente** | — |
| 5 Campanha e venda (Kiwify) | **Ausente** (há cobrança via ASAAS, que é outra coisa) | `packages/billing` |
| 6 Negócio, tarefa, projeto | **Parcial**: funis, estágios e negócios feitos; tarefas e projetos ausentes | `tasks/plan-leads.done.md` |
| 7 Calendário, Meu dia, push | **Ausente** (push fora do v1 lá também) | — |
| 8 Publicações | **Ausente** | — |
| 9 Chat do site | **Feito**, com as falhas da auditoria corrigidas | `packages/channels/src/adapters/site-chat.ts`, AUD-010/011/012 |
| 10 Piloto pronto | Parcial: onboarding e setup existem | `apps/web/src/app/setup`, `onboarding` |

Também existe lá, e foi **adiado** aqui: copiloto (observer, rascunhos, "melhorar resposta"), segundo cérebro, base de conhecimento, agentes, BYOK com fallback, macros, horário comercial com resposta automática, setores (times) e cobrança.

## Problemas já resolvidos lá

- **WAHA/GOWS:** campos `null` explícitos que o `z.optional()` rejeitava (todo `message` falhava; corrigido com `.nullish()`); `@lid` como identidade e resolução para telefone; mídia via proxy S3 com chave `media.s3` e expiração de 7 dias da mídia local; app do 9º dígito; envelope anti-ban; reconcile a cada 30 min depois de reboot; webhook com HMAC por sessão; pareamento por QR e por código; o guia `docs/development/waha-setup.md` (647 linhas) com envs, timings e presença.
- **pg-boss:** schema criado por migration, app sem DDL; enfileiramento na transação do domínio; início que se recupera sozinho (estado `starting` reseta em falha, timeout de 15 s, início sob demanda) (ADR 0016).
- **Chat do site:** histórico só por sessão (AUD-010), sessão expira em 30 dias de inatividade (AUD-012), mídia inline só com allowlist de tipo (AUD-011).
- **Deploy:** imagem gerada uma vez no CI e publicada no GHCR; o servidor nunca compila; `:staging` a cada push na main e `:prod` só com tag `v*.*.*` (a tag é a aprovação); deploy por webhook autenticado do Coolify; migrations no entrypoint; Trivy no código e na imagem; credencial de owner do banco removida do runtime depois do migrate (AUD-013) (ADR 0015, `docs/development/cicd.md`, `deployment-coolify.md`).
- **Processo com IA:** gate único `pnpm verify` / `verify:full`; hook que trava o escopo pelo `tasks/plan.md`; política única de commits; documentação antes de código com tabela de fontes no plano.

## Conflitos com as decisões de hoje (não resolvidos)

| Tema | Decidido aqui em 2026-10-23 | No CRMv2 (medido e auditado) |
|---|---|---|
| TypeScript e lint | TS 7 + Oxlint | TS 6.0.3 + ESLint 9 + typescript-eslint (ADR 0011). Motivo: o typescript-eslint exige TS < 6.1; o Oxlint foi **rejeitado** por falta de cobertura de plugins (`code-quality-standard.md` §2.4) |
| ORM | Prisma 7 | Drizzle 0.45 com 37 migrations e políticas RLS |
| Jobs | Worker separado, mesma imagem | pg-boss dentro do processo web, de propósito ("sem `apps/worker`", ADR 0016) |
| Configuração | Um compose com variáveis geradas; integrações pela UI | Recursos nativos do Coolify + app de imagem; envs aplicadas pela API REST do Coolify; segredos de provedor só em env, credenciais de canal cifradas no banco |
| Tenancy | Uma VPS por cliente, `workspace_id` | SaaS multi-tenant com RLS e `organization_id` (os dois convivem: um tenant por VPS) |
| Papéis | Admin, Membro, Viewer | owner, admin, manager, agent, viewer + platform admin |
| Processo | Spec e tarefas nas fatias do OKF; `tasks/` proibido (E012) | `tasks/plan.md` como contrato de escopo, com hook |

## Limites de qualidade lado a lado

| Regra | Proposto aqui | CRMv2 (com fonte) |
|---|---|---|
| Complexidade ciclomática | 10 | 20 (padrão da regra), meta 10 (NIST SP 500-235) |
| Complexidade cognitiva | 15 | 15 (padrão Sonar) |
| Linhas por arquivo | 300 | 300 |
| Linhas por função | 60 | 50 |
| Parâmetros | 4 | 3 |
| Profundidade | 4 | 4 |
| Comandos por função | — | 10 |
| Callbacks aninhados | 3 | 10 |

## O que ainda seria trabalho novo se o CRMv2 for a base

Instagram e Facebook (comentários e DM), automação comentário → DM, publicação no Instagram, Facebook e YouTube, campanha com link rastreável e venda pela Kiwify, tarefas, projetos, calendário com Google Agenda e Meu dia, e o servidor MCP. Ou seja, as fatias 3, 4, 5, 7, 8 e metade da 6.

## Relations

- details: [Revisão da stack e do deploy](stack-review.md)
- consumes: [Plano](../plan/index.md)
- governed_by: [ADR-111 — Arquitetura, operação e privacidade](../decisions/adr-111-architecture.md)
