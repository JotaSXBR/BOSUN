---
type: Current State
title: Estado atual do projeto
description: Status, pendências e próximo passo; as decisões ficam nos ADRs por domínio.
tags: [bosun, memória, status]
status: draft
generated:
  by: claude-opus/5.5
  at: 2026-10-23T00:00:00Z
---

# Estado atual

> Resumo derivado. Em conflito, valem os [ADRs](../decisions/index.md) e os conceitos.

## Status

- 2026-10-23: o produto foi cortado ao golden path da piloto ([Piloto](../product/pilot.md)); o adiado está em [Para depois](../product/later.md).
- 9 ADRs por domínio, todos em draft. Nada está `stable` até o usuário aprovar.
- Nenhum código, scaffold, dependência ou migration.

## Em aberto

- Aprovar o [padrão de qualidade](../tech/quality-gate.md) (limites propostos).
- Confirmar na Fatia 0: Prisma 7 e Next.js com TS 7; opções do Oxlint; campos de sessão no Better Auth.
- Parâmetro de rastreio da Kiwify que volta no webhook.
- Iniciar o App Review da Meta e a verificação do app no Google Cloud (risco de prazo).

## Próximo passo

- Decidir a licença do repositório público (ADR-111 item 14).
0. Antes da Fatia 0: entregar ao usuário o prompt do design system novo (ele junta as imagens de referência).
1. O usuário revisa e aprova o [plano em fatias](../plan/index.md).
2. Começar a [Fatia 0](../plan/slice-00-foundation.md) e, no mesmo dia, o App Review da Meta e a verificação do Google.

## Relations

- consumes: [Piloto](../product/pilot.md)
- governed_by: [ADR-101 — Produto, piloto e escopo](../decisions/adr-101-product.md)
