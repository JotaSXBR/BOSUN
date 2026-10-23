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

- Parâmetro de rastreio da Kiwify que volta no webhook.
- Iniciar o App Review da Meta e a verificação do app no Google Cloud (risco de prazo).

## Próximo passo

1. Migrar o bundle para o [Perfil OKF BOSUN](../okf-profile.md) (Etapa 5).
2. Reescrever AGENTS.md e README.md (Etapa 6).
3. Escrever o plano em fatias e o guia de trabalho com IA (Etapa 7).

## Relations

- consumes: [Piloto](../product/pilot.md)
- governed_by: [ADR-101 — Produto, piloto e escopo](../decisions/adr-101-product.md)
