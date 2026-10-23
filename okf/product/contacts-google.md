---
type: Integration Spec
title: Contatos e Google People API
description: Contato como entidade central, sincronização em duas vias e regras da etiqueta BOSUN.
tags: [bosun, contacts, google, people-api, sync]
status: stable
generated: { by: reference_agent/deepseek-v4.1-flash-free, at: 2026-10-21T00:00:00Z }
sources:
  - resource: https://developers.google.com/people/v1/contacts
    title: Google People API — Contacts
---

# Contatos e Google

O contato é a entidade central do atendimento. Ele conecta pessoas, conversas, tickets, tarefas e o histórico do relacionamento.

## Campos do MVP

- Nome.
- Organização.
- Foto.
- Telefone.
- E-mail.
- Origem do dado.
- Estado de sincronização com o Google.

## Sincronização em duas vias

- A BOSUN **importa** contatos do Google e **envia** ao Google as alterações feitas no espaço, conforme permissão.
- A sincronização é automática ao salvar e também pode ser disparada manualmente.
- A **BOSUN é a fonte da verdade** depois da importação inicial. Mudanças no Google não sobrescrevem campos já existentes na BOSUN.
- Apenas contatos com a etiqueta **BOSUN** no Google são importados. Contatos sem a etiqueta são ignorados.
- A BOSUN pode criar e gerenciar a etiqueta BOSUN via `contactGroups`, com consentimento do usuário.
- A conexão é opcional e pode ser revogada. Revogar interrompe a sincronização sem apagar os dados locais.

## Identidade

Ver [ADR-106](../decisions/adr-106-contacts-crm.md).

- O contato tem **identidades por canal**: telefone (E.164), e-mail normalizado, Instagram, Telegram, Facebook e visitante de chat. Cada identidade é única por tipo e valor dentro do workspace.
- A primeira identidade cria o contato e define a **origem**; as demais se anexam.
- **Adesão silenciosa só por identificador exato e atestado pelo canal.** Toda outra aproximação — inclusive identidade declarada pelo titular — é **sugestão de mesclagem**, com motivos, sempre confirmada por uma pessoa.
- O **nome de exibição** é escolhido pelo time; cada identidade guarda o nome que o canal informa.
- Mesclar move identidades, conversas, tickets, negócios, tarefas e notas, deixa um **registro-aliado** e é auditado; não há desfazer pela UI na primeira versão.
- Conflito de identidade não é mesclado automaticamente: a UI mostra os registros, os motivos e pede uma escolha.
- Se um contato perder a etiqueta BOSUN, a BOSUN pergunta se deve **manter, arquivar ou excluir**. Nunca exclui automaticamente.

No MVP a identidade prática é o telefone; o modelo acima é o do produto completo.

## Regras técnicas

- Leitura incremental com `syncToken`; token expirado força sincronização completa.
- Atualizações e exclusões usam `etag` para evitar sobrescrever alterações concorrentes.
- Mutações do mesmo usuário são enviadas em sequência; lotes têm limite de 200 contatos.
- Escritas podem demorar minutos para propagar; o sync incremental não serve para read-after-write.
- "Other Contacts" do Google são somente leitura. Para editar, o contato precisa ser copiado para "Meus Contatos".
- O escopo `https://www.googleapis.com/auth/contacts` é sensível e pode exigir verificação OAuth do app antes de produção.

## Critérios de aceite

1. Contato com etiqueta BOSUN é importado.
2. Contato sem etiqueta é ignorado.
3. Edição na BOSUN é refletida no Google.
4. Contato com etiqueta removida gera pergunta, não exclusão.
5. Conflito de identidade é apresentado ao usuário.
6. Revogar a conexão interrompe o sync e preserva os dados locais.
7. Identidade repetida anexa a conversa ao contato existente, sem perguntar.
8. Contato parecido é **sugerido** com motivos, e só é mesclado após confirmação.

## Links

- [Google People API](../tech/google-people.md)
- [Modelo de dados](../tech/data-model.md)
- [Wireframe de contatos](../design/wireframes/contacts.md)
- [ADR-106](../decisions/adr-106-contacts-crm.md)
