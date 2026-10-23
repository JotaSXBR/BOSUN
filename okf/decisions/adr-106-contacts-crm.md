---
type: ADR
title: ADR-106 — Contatos e CRM
description: Identidade multicanal, mesclagem, chat identificado, sync Google e CRM leve.
tags: [bosun, adr, contacts, identity, crm, google]
status: draft
generated: { by: agent/claude-opus-5-5, at: 2026-10-23T00:00:00Z }
---

# ADR-106 — Contatos e CRM

**Status:** vigente; consolidado em 2026-10-23 e sujeito à aprovação do design completo. Este ADR é a única fonte de decisão do domínio: decisão nova **edita este arquivo**.

## Identidade

1. O contato tem **várias identidades** `tipo + valor` — telefone E.164, e-mail normalizado, Instagram, Telegram, Facebook, visitante de chat —, únicas por tipo e valor no workspace. No MVP a prática é o telefone.
2. **Adesão silenciosa só por identificador exato atestado pelo canal.** Identidade declarada (formulário) não adere sozinha a contato com histórico: pede confirmação.
3. Cada identidade guarda o nome que o canal informa; o contato tem nome de exibição escolhido pelo time.
4. **Mesclagem é sugerida com motivos e confirmada por uma pessoa**; move identidades, conversas, tickets, negócios, tarefas e notas; o absorvido vira registro-aliado; auditada; sem desfazer pela UI. Sugestão recusada não volta.

## Chat do site

5. Exige **nome, e-mail e telefone** antes da primeira mensagem; não há conversa anônima. Finalidade e base legal aparecem na coleta.
6. Dado declarado entra **não verificado**; não autoriza envio proativo. O identificador de sessão é só identidade auxiliar.

## Google

7. Sync em duas vias **só com a etiqueta BOSUN**; a BOSUN vira fonte da verdade após a importação; etiqueta removida → perguntar.

## CRM

8. CRM leve e opcional: contato, **empresa simples** e **negócio** com pipeline Novo, Qualificado, Proposta, Ganho, Perdido. Sem probabilidade nem previsão.
9. Contato tem **no máximo uma empresa atual**; troca guarda histórico e pode ser sugerida por sinais observados, sempre confirmada.
10. Mudança de estágio, valor ou dono vira **evento auditado**; Ganho e Perdido pedem motivo.
11. **Membro vê os negócios do seu time**; Admin e Manager veem todos.
12. Duplicidade de empresa usa a mesma sugestão de mesclagem dos contatos.

## Origem

Consolida os antigos 004, 033, 060, 061, 064, arquivados em `archive/adrs-2026-10-23/`.
