---
type: Current State
title: Estado atual do projeto
description: Status, pendências e próximo passo; as decisões ficam nos 13 ADRs por domínio.
tags: [bosun, memory, status, continuity, product]
status: draft
generated: { by: agent/claude-opus-5-5, at: 2026-10-23T00:00:00Z }
---

# Estado atual

> **Documento derivado.** As decisões vivem nos [ADRs por domínio](../decisions/index.md) e nos conceitos; em conflito, valem eles.

## Status

- Objetivo: definir o **produto BOSUN completo** antes de implementar. O MVP (Onboarding, Contatos/Google, Atendimento por WhatsApp) é recorte já decidido.
- Implementação **pausada**: nenhum código, scaffold, dependência ou migration.
- **Matriz de permissões aprovada** (`stable`). **Design do produto completo não aprovado.**
- Em 2026-10-23: duas rodadas de revisão de lacunas fecharam 34 pontos, e os 69 ADRs cronológicos foram consolidados em **13 ADRs por domínio** (ADR-101 a ADR-113), sem conflito. O histórico está em `archive/adrs-2026-10-23/`.
- Piloto: uma founder de infoprodutos.

## Em aberto

- **Hash de senha e criptografia em repouso** — o usuário pediu explicação antes de decidir ([ADR-111](../decisions/adr-111-architecture-operations.md)).
- Catálogo de marcos da gamificação por módulo.
- Módulos e dados iniciais detalhados do template Serviços.
- Viabilidade de TikTok DM e verificação de seguidor; app review da Meta.
- Limites de execuções simultâneas de agentes por instalação.
- Feriados estaduais/municipais e exceções de horário comercial (o Admin acrescenta).
- Comercial e jurídico: fora do foco até o primeiro cliente pagante.

## Próximo passo

1. Explicar e decidir hash de senha e criptografia em repouso.
2. Revisar `tech/architecture.md`, `tech/deploy.md` e `tech/data-model.md` contra os ADRs 101, 108 e 111.
3. Escrever os docs técnicos na ordem do golden path: broker de OAuth + Meta, motor de automação, e-mail IMAP, sync de calendário, agentes, busca, push.
4. Wireframes de baixa fidelidade pelo golden path: Meu dia, calendário de Publicações, editor de post, ticket, canvas de fluxo, projeto, Base.
5. Revisar os conceitos em draft módulo a módulo; um doc vira `stable` quando não tem pendência que bloqueie o design e cada decisão está no ADR do domínio.
6. Só depois da aprovação do design completo, invocar `writing-plans`.

## Links

- [Handoff](handoff.md)
- [Decisões](../decisions/index.md)
- [Produto](../product/index.md)
- [Índice OKF](../index.md)
- [Log](../log.md)
