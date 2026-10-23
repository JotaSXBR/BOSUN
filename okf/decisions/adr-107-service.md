---
type: ADR
title: ADR-107 — Canais e atendimento
description: Canais do piloto, ticket por conversa, roteamento de entrada, caixa de atendimento e chat do site.
domain: atendimento
tags: [bosun, adr, atendimento, ticket, whatsapp, chat]
status: draft
generated:
  by: claude-opus/5.5
  at: 2026-10-23T00:00:00Z
---

# ADR-107 — Canais e atendimento

**Status:** vigente, em draft. Fonte única do domínio.

## Decisões

1. Canais de conversa do piloto: **Instagram** (comentário, resposta de story, menção e DM), **Facebook** (comentário e Messenger), **WhatsApp** e **chat do site**.
2. WhatsApp via **WAHA self-hosted com GOWS**, atrás do adaptador `WhatsAppProvider`. O modelo aceita várias sessões; o piloto usa uma.
3. **Ticket por conversa de canal**: uma conversa aberta por thread; a ficha do contato reúne todos os tickets numa linha do tempo; o ticket avisa se há outra conversa aberta.
4. **Estado do ticket** (um campo só): `automation`, `pending_agent`, `waiting_human`, `human`, `resolved`.
5. **Roteamento de entrada:** comentário, resposta de story ou menção que casa com um fluxo ativo → `automation`. Qualquer outra entrada → `pending_agent` se houver agente de IA habilitado, senão `waiting_human`. No piloto não há agente, então `pending_agent` existe no modelo e nunca é atingido.
6. Dentro da automação, a conversa vai para `waiting_human` quando: a pessoa responde fora do fluxo, usa uma palavra de handoff configurada, ou alguém promove manualmente.
7. Enviar uma mensagem exige **assumir** o ticket, o que pausa a automação nele. A automação só recomeça por um gatilho novo.
8. Fila FIFO **apenas ordena** (espera mais longa primeiro); atribuição **manual**; o tempo de espera é visível.
9. Caixa em **três colunas** (canais/sessões, conversas, conversa), com a ficha do contato em drawer lateral. Filtros: Fila, Minhas, Automação, Resolvidas e Pendentes (visível e desabilitado sem agente). Notas internas sem menções.
10. **Chat do site**: widget na landing page do infoproduto; exige **nome, e-mail e telefone** antes da primeira mensagem, com finalidade e base legal na coleta; dados declarados entram não verificados e não autorizam envio proativo.
11. Painel por campanha: comentários → DMs → tickets → negócios → vendas e receita. Sem SLA, CSAT nem métricas de atendente no piloto.
12. **Instagram e Facebook são conexões separadas:** Instagram pela API com Instagram Login (conta profissional, sem página do Facebook; escopos `instagram_business_basic`, `instagram_business_manage_messages`, `instagram_business_manage_comments`, `instagram_business_content_publish`); Facebook pelo Facebook Login com a página. Decidido em 2026-10-23.
13. **Limites da Meta:** sem DM fria; resposta privada a comentário dentro da janela permitida; janela de conversa de 7 dias; token de 60 dias renovado; conta profissional com página vinculada.

## Relations

- details: [Ticket](../product/ticket.md)
- details: [Canal](../product/channel.md)
- details: [Chat do site](../product/site-chat.md)
- depends_on: [ADR-109 — Automação](adr-109-automation.md)
