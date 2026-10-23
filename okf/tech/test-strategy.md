---
type: Test Strategy
title: Estratégia de testes
description: Unitários, integração e E2E dos fluxos críticos, com ferramentas e critérios.
tags: [bosun, testing, vitest, playwright, qa]
status: draft
generated: { by: reference_agent/deepseek-v4.1-flash-free, at: 2026-10-21T00:00:00Z }
---

# Testes

## Estratégia

**Unitários + integração + E2E dos fluxos críticos.** Uma pessoa + IA precisa de confiança para evoluir rápido sem regressões.

Ferramentas: **Vitest** e **Playwright**.

## Unitários

- Normalização de telefone E.164.
- Regras de identidade e conflito de contato.
- RBAC: recurso/ação por papel.
- Transições de status de ticket.
- Regras de senha e `must_change_password`.
- Mapeamento de payload WAHA e Google.
- Cálculo de fila FIFO.

## Integração

- Login, convite e troca de senha.
- Sessão em tabela `Session` com `sid`, revogação por dispositivo, expiração absoluta e trava de inatividade.
- Guardas de autorização.
- Webhook WAHA idempotente.
- Criação de contato/conversa a partir de mensagem.
- Sync Google com provider mockado.
- Upload/download de mídia.
- Jobs de expurgo e retenção.
- Auditoria.

## E2E

Fluxos críticos:

1. Login do Admin, setup e Meu dia; o golden path completo entra na Fatia 10.
2. Convidar usuário e entrar com papel.
3. Receber mensagem inbound e responder.
4. Sincronizar contato Google e editar.
5. Solicitar troca de senha, Admin define temporária e usuário troca.
6. Revogar sessão e validar logout.
7. Aplicar permissão e validar acesso negado.

## Fixtures e mocks

- Banco de teste isolado por execução.
- Seed mínimo: workspace, Admin, Membro, Viewer e o seed do pipeline.
- Mock/contract test para WAHA e Google People API.
- Payloads reais anonimizados para webhook.
- Relógio controlável para retenção e prazos.

## CI

- Lint + typecheck.
- Unitários.
- Integração com PostgreSQL.
- E2E em ambiente efêmero.
- Migration check.
- Cobertura mínima definida no plano; priorizar fluxos críticos, não percentual cego.

## Critérios de aceite

- Todos os fluxos críticos têm teste E2E.
- Webhook duplicado não duplica dados.
- Permissão negada é testada para cada papel.
- Restauração de backup é validada mensalmente.
- Testes rodam no CI antes do deploy.

## Relations

- governed_by: [ADR-111 — Arquitetura, operação e privacidade](../decisions/adr-111-architecture.md)
- details: [Arquitetura](architecture.md)
