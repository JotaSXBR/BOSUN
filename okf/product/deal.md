---
type: Product Spec
title: Negócio
description: Oportunidade ligada a um contato, com pipeline fixo de quatro estágios, valor e campanha.
tags: [bosun, crm, negócio, pipeline]
status: draft
generated:
  by: claude-opus/5.5
  at: 2026-10-23T00:00:00Z
---

# Negócio

- Ligado a **um contato**; campanha opcional; valor em BRL; responsável.
- Pipeline fixo: **Novo → Em conversa → Ganho / Perdido**. Perdido pede motivo.
- Criado a partir do ticket ou da ficha do contato, com um clique. Conversa não vira negócio sozinha.
- Venda confirmada para o contato sugere mover o negócio aberto para Ganho, com um clique ([Venda](sale.md)).
- Mudança de estágio, valor ou responsável é auditada.
- Visão em quadro por estágio, com filtro por campanha.
- Sem empresa, estágios editáveis, probabilidade nem previsão.

## Relations

- governed_by: [ADR-106 — Contatos, CRM e venda](../decisions/adr-106-contacts.md)
- depends_on: [Contato](contact.md)
- consumes: [Campanha](campaign.md)
