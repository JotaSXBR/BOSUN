---
type: Product Spec
title: Contato
description: Pessoa atendida, com identidades por canal, adesão por identificador exato e mesclagem manual auditada.
tags: [bosun, contato, identidade, mesclagem]
status: draft
generated:
  by: claude-opus/5.5
  at: 2026-10-23T00:00:00Z
---

# Contato

O contato é o centro do fio: o comentarista do Instagram, quem chama no WhatsApp e quem compra na Kiwify são a mesma pessoa.

## Campos

- Nome de exibição, foto, observações, origem (primeiro canal) e datas.
- **Identidades** `tipo + valor`, únicas por tipo e valor no workspace: `instagram` (ID do usuário), `facebook` (PSID), `phone` (E.164), `email` (normalizado) e `site_visitor` (auxiliar). Cada identidade guarda o nome que o canal informa e se foi **atestada** pelo canal ou **declarada** pelo titular.
- Estado de sincronização com o Google ([Google Contatos](google-contacts.md)).

## Regras

- A primeira identidade cria o contato; as seguintes se anexam.
- **Adesão silenciosa só por identificador exato e atestado** (mesmo ID do Instagram, mesmo telefone vindo do WhatsApp).
- Identidade **declarada** (chat do site, compra na Kiwify) que bate com um contato existente não adere sozinha: o ticket mostra **possível duplicado** com o contato candidato.
- **Mesclar** é manual: uma pessoa escolhe o contato principal; identidades, tickets, negócios, tarefas e vendas passam para ele; o outro vira registro-aliado. A mesclagem é auditada e não tem desfazer pela interface.
- A ficha do contato tem a linha do tempo: tickets, negócios, vendas e tarefas.

## Critérios de aceite

1. O mesmo ID do Instagram em dois comentários resulta em um contato.
2. Um telefone já existente vindo do WhatsApp anexa a conversa ao contato.
3. Um e-mail declarado no chat que bate com um contato gera aviso, não mesclagem.
4. Mesclar move tudo e deixa auditoria.

## Relações

- governado_por: [ADR-106 — Contatos, CRM e venda](../decisions/adr-106-contacts.md)
- depende_de: [Workspace](workspace.md)
