---
type: Architecture
title: Arquitetura
description: Contexto, módulos, fluxos principais, requisitos não funcionais e riscos do piloto.
tags: [bosun, arquitetura, nextjs, pg-boss]
status: draft
generated:
  by: claude-opus/5.5
  at: 2026-10-23T00:00:00Z
---

# Arquitetura

## Contexto

Um monolito Next.js por instalação, numa VPS dedicada ([Deploy](deploy.md)). Integrações externas: Meta Graph API (Instagram e Facebook), WAHA (WhatsApp), YouTube Data API, Google People API, Google Calendar API, Kiwify (webhook) e o widget do chat do site. Stack em [Stack](stack.md).

## Módulos

Módulos de domínio em `src/modules/<nome>`, cada um com serviço, repositório e rotas; nenhum módulo lê a tabela de outro diretamente.

- `identity` (auth, sessão, papéis, convites, auditoria)
- `workspace` (workspaces, integrações, setup)
- `contacts` (contato, identidades, mesclagem, Google Contatos)
- `inbox` (ticket, mensagem, roteamento, caixa, chat do site)
- `channels` (adaptadores: `MetaProvider`, `WhatsAppProvider`, `SiteChatProvider`)
- `automation` (fluxos, execução, deduplicação)
- `publishing` (post, target, `YouTubeProvider`, publicação)
- `crm` (negócio, venda, link rastreável, painel da campanha)
- `work` (tarefa, projeto, evento, Google Agenda, Meu dia)
- `library` (documentos, RustFS)
- `notify` (notificações, web push)

## Fluxos principais

### Evento da Meta (comentário ou DM)

1. O webhook valida a assinatura, grava o evento bruto com o ID externo e responde 200.
2. Um job do pg-boss processa: resolve o contato pela identidade atestada, aplica o roteamento do [Ticket](../product/ticket.md) e, se casar, executa o fluxo ([Automação](../product/automation.md)).
3. As chamadas de saída (resposta pública, DM) são jobs idempotentes pelo ID do evento.

### Mensagem do WhatsApp

WAHA → webhook → idempotência por `external_id` → contato por telefone E.164 → ticket → fila. Envio: assumir → gravar otimista → `sendText` → atualizar pelo ack.

### Publicação

O agendamento cria um job por `PostTarget` no horário; cada job publica, grava `external_id` e atualiza o status do post. Uma falha agenda retry ou marca o target `failed`.

### Venda

Webhook da Kiwify → segredo → idempotência pela transação → atribuição por link rastreável ou por e-mail/telefone → notificação.

### Sync Google

Contatos: jobs incrementais com `syncToken` e escrita sequencial com `etag` ([Google People API](google-people.md)). Agenda: leitura incremental por membro.

## Requisitos não funcionais

- Webhook responde em menos de 2 s e processa em job; nada é perdido se um job falhar.
- Todo webhook e job é idempotente; toda consulta filtra `workspace_id`.
- A caixa funciona no navegador do celular.
- Tokens cifrados com AES-256-GCM; senha com Argon2id ([ADR-111](../decisions/adr-111-architecture.md)).

## Riscos

- App Review da Meta e verificação do Google atrasam o go-live.
- WAHA não é API oficial: risco de bloqueio do número.
- Cota da YouTube Data API limita uploads por dia.
- O parâmetro de rastreio da Kiwify precisa ser confirmado na documentação.

## Relações

- governado_por: [ADR-111 — Arquitetura, operação e privacidade](../decisions/adr-111-architecture.md)
- depende_de: [Stack](stack.md)
- depende_de: [Modelo de dados](data-model.md)
