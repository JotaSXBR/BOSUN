---
type: Data Model
title: Modelo de dados
description: Entidades, relações, índices e restrições do MVP.
tags: [bosun, data-model, prisma, postgres, schema]
status: stable
generated: { by: reference_agent/deepseek-v4.1-flash-free, at: 2026-10-21T00:00:00Z }
---

# Modelo de dados

O modelo abaixo foi aprovado como base em 2026-10-21. Mudanças estruturais exigem novo ADR.

> **Nota 2026-10-22 — ADR-101:** cada cliente tem uma instalação dedicada, com banco próprio. `workspace_id` continua obrigatório para separar workspaces dentro da instalação; o isolamento entre clientes é físico. Entidades de automação, agentes, Observer, sugestões e ledger de ações entram na reconciliação técnica.

> **Nota 2026-10-22 — ADR-104:** `Task` deixa de ser tabela solta e passa a ser `item` + `tarefa_detalhe`, com comentários, vínculos, menções e auditoria apontando para `item.id`. A reescrita faz parte da reconciliação do modelo de dados e **não foi aplicada** neste documento, que continua descrevendo o MVP.

> **Nota 2026-10-22 — ADR-102:** `User.session_version` é aposentado e entra a tabela `Session`: `id` (sid), `user_id`, `active_workspace_id`, `device_label`, `user_agent`, `ip`, `created_at`, `last_seen_at`, `last_auth_at`, `expires_at`, `revoked_at`, `revoked_reason`. Aplicada em 2026-10-23.

> **Nota 2026-10-22 — ADR-106:** `Contact` perde a identidade única por telefone e ganha `ContactIdentity` (`contact_id`, tipo, valor, nome no canal, origem, verificado), com unicidade por tipo e valor no workspace, mais `merged_into_id` para o registro-aliado. A reconciliação ainda **não foi aplicada**.

## Entidades

### Workspace

- `id`, `name`, `slug`, `timezone`, `locale`, `created_at`.

### User

- `id`, `workspace_id`, `name`, `email`, `username`, `password_hash`.
- `must_change_password`, `role_id`, `status`, `created_at`.

### Role

- `id`, `workspace_id`, `key` (`admin`, `manager`, `attendant`, `viewer`), `name`, `is_system`.

### Permission

- `id`, `resource`, `action`.

### RolePermission

- `role_id`, `permission_id`, `allowed`.

### Invite

- `id`, `workspace_id`, `token_hash`, `email`, `role_id`, `expires_at`, `max_uses`, `used_count`, `created_by`.

### Contact

- `id`, `workspace_id`, `display_name`, `organization`, `photo_url`.
- `google_resource_name`, `google_sync_state`, `created_at`, `updated_at`.

### ContactMethod

- `id`, `contact_id`, `type` (`phone`/`email`), `value`, `normalized_value`, `is_primary`, `source`.

### WhatsAppSession

- `id`, `workspace_id`, `name`, `phone_number`, `waha_session`, `status`, `last_qr_at`.

### Conversation

- `id`, `workspace_id`, `contact_id`, `session_id`, `status_id`, `assigned_user_id`.
- `last_message_at`, `last_inbound_at`, `unread_count`.

### Message

- `id`, `conversation_id`, `direction`, `body`, `media_id`, `external_id`, `status`, `sent_at`, `received_at`, `raw_payload`.

### MediaAsset

- `id`, `workspace_id`, `storage_key`, `mime_type`, `size_bytes`, `checksum`, `created_at`.

### TicketStatus

- `id`, `workspace_id`, `name`, `color`, `order`, `is_resolved`, `is_default`, `is_system`.

### Task

- `id`, `workspace_id`, `contact_id`, `conversation_id`, `title`, `status`, `due_at`, `assigned_user_id`.

### AuditLog

- `id`, `workspace_id`, `actor_user_id`, `action`, `resource_type`, `resource_id`, `metadata`, `created_at`.

### GoogleSyncState

- `id`, `workspace_id`, `sync_token`, `last_sync_at`, `status`.

### RetentionPolicy

- `id`, `workspace_id`, `data_type`, `days`.

### PasswordChangeRequest

- `id`, `user_id`, `status`, `requested_at`, `approved_by`.

### AuthSession

Substituída por `Session` (ADR-102): `id` (sid), `user_id`, `active_workspace_id`, `device_label`, `user_agent`, `ip`, `created_at`, `last_seen_at`, `last_auth_at`, `expires_at`, `revoked_at`, `revoked_reason`. O JWT carrega o `sid`.

## Esboço do produto completo (2026-10-23, draft)

Só nomes e relações principais, para orientar a reconciliação; campos e índices virão depois. Toda entidade tem `workspace_id`.

- **Estrutura:** `Environment` → `Workspace` (template Pessoal, Empresa, Produto, Curso ou Serviços); `Team`, `TeamMember`; `Session` (ADR-102).
- **Item (ADR-104):** `Item` (inbox/processado/arquivado) com `Note`, `Task` (`project_id` anulável, ADR-105), `Document`, `Link` (categoria e visibilidade, ADR-104); `Comment`, `Mention`, `ItemLink`.
- **Trabalho e tempo:** `Project`, `Dependency`, `Event`, `TimeBlock`, `Habit`, `HabitCheckin`, `Objective`, `KeyResult`, `Checkin`.
- **Contatos e atendimento:** `Contact` (`company_id`, ADR-106), `ContactIdentity` (ADR-106), `MergeSuggestion`, `Company`, `Deal`, `Channel`, `Ticket` (por thread, ADR-107), `Message`.
- **Publicações:** `SocialAccount` (várias por rede, ADR-108), `Post` (modelo em aberto), `Campaign`.
- **Automação e IA:** `Flow`, `FlowRun`, `Agent`, `AgentRun`, `KnowledgeArticle`, `Embedding`.
- **Transversais:** `Notification`, `Milestone` (gamificação, ADR-110), `MediaAsset`, `AuditLog`.

## Relações principais

- Workspace 1:N User, Contact, WhatsAppSession, Conversation, TicketStatus, AuditLog.
- User N:1 Role; Role N:N Permission via RolePermission.
- Contact 1:N ContactMethod, Conversation, Task.
- WhatsAppSession 1:N Conversation.
- Conversation 1:N Message, Task.
- Message N:1 MediaAsset (opcional).
- Conversation N:1 TicketStatus, User (responsável).
- Workspace 1:1 GoogleSyncState.
- Workspace 1:N RetentionPolicy.

## Índices e restrições

- `ContactMethod.normalized_value` único por workspace e tipo.
- `Message.external_id` único por conversa/sessão para idempotência.
- `Invite.token_hash` único.
- `Conversation` indexado por `workspace_id`, `status_id`, `assigned_user_id`, `last_message_at` e `last_inbound_at`.
- `Message` indexado por `conversation_id`, `sent_at` e `received_at`.
- `AuditLog` indexado por `workspace_id`, `created_at`, `actor_user_id`.
- Toda tabela multi-tenant tem `workspace_id` e consultas sempre filtram por ele.

## Regras

- A fila FIFO usa `last_inbound_at` (mensagem sem resposta mais antiga).
- `last_inbound_at` é um campo derivado, indexado para performance.
- Exclusões lógicas são preferidas para contatos e conversas; expurgo físico segue a retenção.
- `raw_payload` de webhook é mantido para auditoria/depuração, sujeito à retenção.
- Revogação por linha em `Session` (ADR-102); `session_version` aposentado.

## Links

- [Arquitetura](architecture.md)
- [ADR-111](../decisions/adr-111-architecture-operations.md)
- [Auth](auth.md)
