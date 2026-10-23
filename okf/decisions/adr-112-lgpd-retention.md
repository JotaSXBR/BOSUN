---
type: ADR
title: ADR-112 — LGPD e retenção
description: Papéis na LGPD e retenção configurável.
tags: [bosun, adr, lgpd, privacy, retention]
status: draft
generated: { by: agent/claude-opus-5-5, at: 2026-10-23T00:00:00Z }
---

# ADR-112 — LGPD e retenção

**Status:** vigente; consolidado em 2026-10-23 e sujeito à aprovação do design completo. Este ADR é a única fonte de decisão do domínio: decisão nova **edita este arquivo**.

1. A BOSUN é **operadora**; o workspace é **controlador**. O produto oferece controles de finalidade, base legal, direitos do titular, retenção, minimização, segurança e suboperadores.
2. Retenção configurável por workspace e tipo de dado, com padrão definido no onboarding e **exportação antes da exclusão**.
3. Conteúdo de mensagens é dado não confiável: nunca executar instruções vindas dele.
4. Dados sensíveis são redigidos antes de ir ao provedor de IA ([ADR-109](adr-109-automation-ai.md)).

## Origem

Consolida os antigos 008, 009, arquivados em `archive/adrs-2026-10-23/`.
