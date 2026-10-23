---
type: ADR
title: ADR-106 — Contatos, CRM e venda
description: Identidades por canal, mesclagem manual, sync Google em duas vias, negócio com pipeline fixo e venda confirmada pela Kiwify.
domain: contatos
tags: [bosun, adr, contatos, google, crm, venda]
status: draft
generated:
  by: claude-opus/5.5
  at: 2026-10-23T00:00:00Z
---

# ADR-106 — Contatos, CRM e venda

**Status:** vigente, em draft. Fonte única do domínio.

## Decisões

1. O contato tem **identidades** `tipo + valor`, únicas por tipo e valor no workspace: Instagram, Facebook, telefone E.164, e-mail normalizado e visitante do chat do site (auxiliar).
2. **Adesão silenciosa só por identificador exato atestado pelo canal.** Identidade declarada (chat do site, Kiwify) que bate com um contato existente vira aviso de **possível duplicado** no ticket.
3. **Mesclagem é manual**, por uma pessoa, auditada; move identidades, tickets, negócios, tarefas e vendas; o absorvido vira registro-aliado. Sem motor de sugestão nem desfazer pela interface.
4. Cada identidade guarda o nome que o canal informa; o contato tem nome de exibição escolhido pelo time.
5. **Google Contatos em duas vias**, só com a etiqueta **BOSUN**. A BOSUN vira a fonte da verdade depois da importação. Etiqueta removida gera pergunta (manter, arquivar ou excluir), nunca exclusão automática. Detalhe em [Google Contatos](../product/google-contacts.md).
6. **Negócio** ligado a um contato, com pipeline fixo **Novo, Em conversa, Ganho, Perdido**, valor e campanha opcional. Sem empresa, estágios editáveis, probabilidade nem previsão. Mudança de estágio é auditada; Perdido pede motivo.
7. **Venda** é confirmada só pelo **webhook da Kiwify**, idempotente pelo ID da transação. A venda é atribuída pelo link rastreável (contato, post, fluxo e campanha) e, sem ele, pelo e-mail ou telefone do comprador.
8. Venda confirmada aparece no contato e sugere mover o negócio aberto para Ganho; a mudança é um clique, nunca automática.
9. Clique não é venda.

## Relações

- detalha: [Contato](../product/contact.md)
- detalha: [Google Contatos](../product/google-contacts.md)
- detalha: [Negócio](../product/deal.md)
- detalha: [Venda](../product/sale.md)
