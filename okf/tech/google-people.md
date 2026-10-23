---
type: Integration Spec
title: Google People API
description: OAuth, etiqueta BOSUN, sync incremental, etag, lotes e tratamento de erros.
tags: [bosun, google, people-api, oauth, sync]
status: stable
generated: { by: reference_agent/deepseek-v4.1-flash-free, at: 2026-10-21T00:00:00Z }
sources:
  - resource: https://developers.google.com/people/v1/contacts
    title: Google People API — Contacts
  - resource: https://developers.google.com/people/api/rest/v1/people/createContact
    title: Google People API — createContact
  - resource: https://developers.google.com/people/api/rest/v1/people/batchUpdateContacts
    title: Google People API — batchUpdateContacts
---

# Google People API

## OAuth

- OAuth 2.0 com escopos mínimos.
- Leitura e escrita: `https://www.googleapis.com/auth/contacts`.
- Somente leitura: `https://www.googleapis.com/auth/contacts.readonly`.
- "Other Contacts": `https://www.googleapis.com/auth/contacts.other.readonly` (somente leitura).
- O escopo `contacts` é sensível e pode exigir **verificação OAuth** do app pelo Google antes de produção.
- A conexão é opcional e pode ser revogada.
- Revogar interrompe o sync e preserva os dados locais.

## Etiqueta BOSUN

- A BOSUN pode criar e gerenciar a etiqueta **BOSUN** via `contactGroups`, com consentimento.
- Se a etiqueta não existir, criar.
- Apenas contatos no grupo BOSUN entram no sync.
- Remover a etiqueta no Google não exclui o contato local: a BOSUN pergunta se deve manter, arquivar ou excluir.

## Sync inicial

1. Autenticar com OAuth.
2. Localizar/criar o grupo BOSUN.
3. Listar conexões com `people.connections.list`.
4. Pedir `requestSyncToken=true` e `personFields` necessários.
5. Filtrar por participação no grupo BOSUN.
6. Mapear nome, e-mail, telefone, foto e organização.
7. Normalizar telefone para E.164.
8. Criar/atualizar contatos locais.

## Sync incremental

- Usar `syncToken` retornado pelo Google.
- Token expirado força sincronização completa.
- Mudanças no Google não sobrescrevem campos já existentes na BOSUN.
- A BOSUN é a fonte da verdade após a importação inicial.
- Alterações locais são enviadas ao Google com `etag`.

## Escrita

- Criar: `people.createContact`.
- Atualizar: `people.updateContact` com `updatePersonFields` e `person.etag`.
- Excluir: com `etag`/pré-condição para evitar sobrescrever alterações concorrentes.
- Lotes: `people.batchUpdateContacts`, limite de **200** contatos.
- Mutações do mesmo usuário são enviadas em sequência.
- Escritas podem demorar minutos para propagar; não usar sync incremental para read-after-write.

## Other Contacts

- "Other Contacts" são somente leitura.
- Para editar, copiar o contato para "Meus Contatos" e então sincronizar.
- A UI deve deixar essa limitação explícita.

## Identidade e conflitos

- Identidade principal: telefone E.164.
- Fallbacks: e-mail e `resourceName`.
- Telefone ausente ou ambíguo: pedir confirmação.
- Conflito de identidade: mostrar registros e pedir escolha; não mesclar automaticamente.
- Conflito de campo: a BOSUN prevalece; se o Google mudou, o usuário decide.

## Erros e resiliência

- `401`: renovar token ou pedir reconexão.
- `403`: verificar escopo/verificação do app.
- `404`: contato removido no Google; tratar como exclusão remota.
- `409`/`412`: conflito de `etag`; reler e pedir decisão.
- `429`/`5xx`: backoff exponencial e job de retry.
- Registrar falhas de sync em `GoogleSyncState` e exibir status na UI.

## Critérios de aceite

1. OAuth conecta e cria/seleciona a etiqueta BOSUN.
2. Contato com etiqueta é importado.
3. Contato sem etiqueta é ignorado.
4. Edição local é enviada ao Google.
5. Sync incremental funciona; token expirado força sync completo.
6. Conflito de etag não sobrescreve alteração concorrente.
7. Etiqueta removida gera pergunta ao usuário.

## Relations

- governed_by: [ADR-106 — Contatos, CRM e venda](../decisions/adr-106-contacts.md)
- details: [Google Contatos](../product/google-contacts.md)
