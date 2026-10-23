---
type: ADR
title: ADR-107 — Atendimento e Social
description: Canais, ticket por conversa, fila, SLA, CSAT, e-mail IMAP e caixa de atendimento.
tags: [bosun, adr, service, social, tickets, sla, email, whatsapp]
status: draft
generated: { by: agent/claude-opus-5-5, at: 2026-10-23T00:00:00Z }
---

# ADR-107 — Atendimento e Social

**Status:** vigente; consolidado em 2026-10-23 e sujeito à aprovação do design completo. Este ADR é a única fonte de decisão do domínio: decisão nova **edita este arquivo**.

## Áreas e canais

1. Duas áreas sobre **uma única entidade de ticket**: **Social** (Instagram, Facebook, TikTok) e **Atendimento** (WhatsApp, chat do site, Telegram, e-mail). Kwai fica fora até existir API.
2. WhatsApp via **WAHA self-hosted com GOWS**, atrás de um adaptador `WhatsAppProvider`; várias sessões.
3. **Ticket por conversa de canal**: dono, status, SLA, CSAT e histórico próprios; uma conversa aberta por thread. A pessoa é reunida numa **linha do tempo** na ficha do contato; o ticket avisa se há outra conversa aberta. Fusão é exceção manual auditada; divisão fica de fora.

## Dono e handoff

4. Cadeia: **automação → agente → aguardando humano → humano → encerrado**. Enviar exige **"assumir e responder"**, que pausa automação e agente. Devolver só ao agente; automação recomeça por novo gatilho.
5. Promoção de Social para Atendimento é **automática** nos seis gatilhos: pedido explícito, baixa confiança/fora da base, reclamação/reembolso/jurídico, negociação de preço, duas tentativas sem avanço, fora do horário comercial.
6. **Falso positivo:** humano devolve ao Social com motivo; o SLA aberto é cancelado e entra numa métrica por gatilho.

## Fila e operação

7. Fila FIFO **apenas ordena**; atribuição **manual**; se ninguém assumir no SLA, só notifica. Admin pode restringir sessões por papel.
8. Caixa em **três colunas** (sessões, conversas, conversa) com drawer lateral. Filtros: Fila, Minhas, Aguardando, Resolvidas, **Pendentes** (reservado a agentes de IA; no MVP visível e desabilitado).
9. Notas internas com menções.

## SLA e métricas

10. SLA **por canal**, só em horário comercial, com **calendário de feriados** por workspace (nacionais do Brasil pré-carregados); o relógio **pausa em "aguardando cliente"**. Social não tem SLA nem CSAT antes do handoff.
11. **CSAT 1 a 5** com comentário opcional, enviado uma vez ao encerrar, aceito por 24 h; desligável por canal.
12. Métricas: primeira resposta, resolução, volume, SLA, CSAT, carga por atendente. Dashboard social mede funil e venda confirmada.

## E-mail

13. **Sempre IMAP/SMTP, sem OAuth**, para qualquer provedor (Gmail com senha de app). Uma caixa por workspace na primeira versão; sem endereço BOSUN.
14. Thread por `Message-ID`/`In-Reply-To`/`References`; IMAP IDLE; antilaço por `Auto-Submitted`/`X-Autoreply`; `APPEND` em Enviados quando o servidor não grava; anexos no RustFS.
15. O ticket nasce depois da primeira resposta ou por promoção manual. E-mail tem UI própria.
16. **Risco aceito:** Microsoft 365 e Outlook.com não aceitam senha em IMAP; ficam sem suporte enquanto esta regra valer.

## Capacidade futura

- SLA por prioridade; várias caixas de e-mail; divisão de ticket.

## Origem

Consolida os antigos 003, 012, 015, 019, 032, 038, 044, 062, arquivados em `archive/adrs-2026-10-23/`.
