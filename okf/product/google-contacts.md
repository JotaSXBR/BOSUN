---
type: Product Spec
title: Google Contatos
description: Sincronização em duas vias com o Google Contatos, limitada à etiqueta BOSUN, com a BOSUN como fonte da verdade.
tags: [bosun, google, contatos, sync]
status: draft
generated:
  by: claude-opus/5.5
  at: 2026-10-23T00:00:00Z
---

# Google Contatos

Mantém os contatos da BOSUN no celular da piloto, para que o WhatsApp mostre os nomes. Detalhe técnico em [Google People API](../tech/google-people.md).

## Regras

- A conexão é opcional, feita pelo Admin, por workspace, e pode ser revogada. Revogar interrompe o sync sem apagar os dados locais.
- Só contatos com a etiqueta **BOSUN** no Google são importados; os outros são ignorados. A BOSUN cria e gerencia a etiqueta via `contactGroups`.
- A BOSUN **importa** os contatos etiquetados e **envia** ao Google o que muda nela: nome, telefones e e-mails.
- Depois da importação, a **BOSUN é a fonte da verdade**: mudança feita no Google não sobrescreve campo que já existe na BOSUN.
- Sync automático ao salvar e manual por botão.
- Contato que perde a etiqueta gera a pergunta **manter, arquivar ou excluir**; nunca exclusão automática.
- Conflito de identidade (um telefone do Google que pertence a outro contato) aparece para uma pessoa resolver.

## Critérios de aceite

1. Contato com a etiqueta BOSUN é importado; sem a etiqueta, é ignorado.
2. Edição na BOSUN aparece no Google.
3. Etiqueta removida gera pergunta, não exclusão.
4. Conflito de identidade é mostrado ao usuário.
5. Revogar a conexão para o sync e preserva os dados locais.

## Relações

- governado_por: [ADR-106 — Contatos, CRM e venda](../decisions/adr-106-contacts.md)
- depende_de: [Contato](contact.md)
- detalha: [Contato](contact.md)
