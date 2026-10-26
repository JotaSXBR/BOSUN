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

- 2026-10-26: spec do módulo `identity` aprovada na [Fatia 0](../plan/slice-00-foundation.md) (seis decisões, todas como recomendado).
- 2026-10-23: o produto foi cortado ao golden path da piloto ([Piloto](../product/pilot.md)); o adiado está em [Para depois](../product/later.md).
- 9 ADRs por domínio, todos em draft. Nada está `stable` até o usuário aprovar.
- Módulo `toolchain` concluído e na `main` (PR #5, merge `84d2edf`). Nenhum modelo do produto, migration ou dependência de autenticação ainda.

## Em aberto

- Reconciliar o ADR-102, [Autenticação](../tech/auth.md) e [modelo de dados](../tech/data-model.md) com as decisões aprovadas do `identity`.
- Parâmetro de rastreio da Kiwify que volta no webhook.
- Iniciar o App Review da Meta e a verificação do app no Google Cloud (risco de prazo).

## Próximo passo

- **Retomar aqui:** aplicar as reconciliações aprovadas no ADR-102 e nos conceitos e rodar `/agent-skills:plan` para gerar as tarefas do módulo. Módulo `toolchain` concluído e na `main` (PR #5, merge `84d2edf`, ship com as três personas), PR por módulo na Fatia 0. Repositório público: `github.com/JotaSXBR/BOSUN` (branch `main`, secret scanning, push protection e alertas do Dependabot ligados). Design system: o usuário pede no momento oportuno; entregar com pesquisa do Claude Design mais recente, o prompt e como incluir as imagens de referência.
- Servidor: a mesma VPS do usuário, com Coolify, recebe beta e stable. Domínio do painel, IP do Tailscale e token da API ficam **fora do repositório** (público), só na máquina do usuário e nos environments do GitHub.
1. Reconciliar o ADR-102, [Autenticação](../tech/auth.md) e [modelo de dados](../tech/data-model.md) com as decisões aprovadas.
2. `/agent-skills:plan` do `identity`; depois build, test, review, code-simplify e ship do módulo.
3. Iniciar o App Review da Meta e a verificação do Google no mesmo dia.
4. Entregar ao usuário o prompt do design system novo quando ele pedir (ele junta as imagens de referência).

## Relations

- consumes: [Piloto](../product/pilot.md)
- governed_by: [ADR-101 — Produto, piloto e escopo](../decisions/adr-101-product.md)
