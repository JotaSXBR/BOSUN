---
type: ADR
title: ADR-110 — Notificações, gamificação e apps
description: Níveis de interrupção, gamificação para adoção e offline/apps como capacidade futura.
tags: [bosun, adr, notifications, gamification, offline, pwa]
status: draft
generated: { by: agent/claude-opus-5-5, at: 2026-10-23T00:00:00Z }
---

# ADR-110 — Notificações, gamificação e apps

**Status:** vigente; consolidado em 2026-10-23 e sujeito à aprovação do design completo. Este ADR é a única fonte de decisão do domínio: decisão nova **edita este arquivo**.

## Notificações

1. Canais: in-app e web push; e-mail opt-in, nunca interrompe.
2. Três níveis: **interrompe** (menção, atribuição, aprovação, conta/segurança) com push; **agrupa** (comentário, status, time) in-app; **só no Meu dia** (prazo, Observer, arquivamento).
3. Silêncio cala os níveis 2 e 3; conta e segurança furam. SLA só alerta em horário comercial.
4. Preferências por membro e workspace, por módulo. Notificação guarda referência e resolve permissão no read time. Sem copy que pressione.

## Gamificação

5. Objetivo: **incentivar o uso de todos os módulos**. Individual, com progresso e marcos; **sem pontos, ranking ou perda**.
6. O **Manager vê a adoção por módulo** (usou ou não, marcos) dos membros dos seus times; **nunca conteúdo nem área pessoal**. Admin vê todos. Liderado = membro de time em que a pessoa é Manager.
7. Sem notificação comparativa; atendimento não é gamificado por volume.

## Offline e apps (capacidade futura)

8. Offline não entra no design atual. Quando entrar: leitura em cache e captura, fila idempotente, conflito por campo; **PWA** como base e **casca Capacitor** (Android primeiro). Sem nativo separado nem desktop.

## Origem

Consolida os antigos 034, 039, 040, 055, 067, arquivados em `archive/adrs-2026-10-23/`.
