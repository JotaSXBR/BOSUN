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
- Confirmar na Fatia 0: campos de sessão no Better Auth (o modelo padrão já traz `ipAddress` e `userAgent`).
- Parâmetro de rastreio da Kiwify que volta no webhook.
- Iniciar o App Review da Meta e a verificação do app no Google Cloud (risco de prazo).

## Próximo passo

- **Retomar aqui:** Fatia 0, módulo `toolchain`, spec e tarefas aprovadas (T1–T7). T1 a T5 concluídas (stack, scaffold, compose local com worker, lint, testes). Próxima: **T6** (CI e cadeia de suprimentos). Trabalho na branch `slice-00`; PR só depois da última fatia, via `/agent-skills:ship`. Repositório público criado: `github.com/JotaSXBR/BOSUN` (branch `main`, secret scanning, push protection e alertas do Dependabot ligados). Design system: o usuário pede no momento oportuno; entregar com pesquisa do Claude Design mais recente, o prompt e como incluir as imagens de referência. Na T6: CodeQL (licença decidida: nenhuma).
- Servidor: a mesma VPS do usuário, com Coolify, recebe beta e stable. Domínio do painel, IP do Tailscale e token da API ficam **fora do repositório** (público), só na máquina do usuário e nos environments do GitHub.
0. Antes da Fatia 0: entregar ao usuário o prompt do design system novo (ele junta as imagens de referência).
1. O usuário revisa e aprova o [plano em fatias](../plan/index.md).
2. Começar a [Fatia 0](../plan/slice-00-foundation.md) e, no mesmo dia, o App Review da Meta e a verificação do Google.

## Relations

- consumes: [Piloto](../product/pilot.md)
- governed_by: [ADR-101 — Produto, piloto e escopo](../decisions/adr-101-product.md)
