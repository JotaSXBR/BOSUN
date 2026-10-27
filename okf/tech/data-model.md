---
type: Data Model
title: Modelo de dados
description: Entidades, relações, índices e restrições do piloto; mudança estrutural exige atualizar o ADR-111.
tags: [bosun, dados, prisma, postgres]
status: draft
generated:
  by: claude-opus/5.5
  at: 2026-10-23T00:00:00Z
---

# Modelo de dados

Nomes em inglês. Toda entidade de negócio tem `id` (UUID v7, `@default(uuid(7))`), `workspace_id`, `created_at` e `updated_at`. Mudança estrutural edita este doc e o [ADR-111](../decisions/adr-111-architecture.md).

## Fundação

- `Environment` (1 por instalação), `Workspace` (`name`, `timezone`).
- `User` (`username` e `email` únicos e em minúsculas, `email_verified`, `two_factor_enabled`, `must_change_password`, `temp_password_expires_at`, `credentials_version` — sobe a cada troca de senha ou senha temporária; o login que leu outra versão não vira sessão —, `two_factor_reset_at` — último `unlock`, para o aviso no setup do 2FA), `Membership` (`user_id`, `workspace_id`, `role`: `admin` | `member` | `viewer`).
- `Invite` (`email`, `role`, `token_hash`, `expires_at`, `accepted_at`).
- `Workspace`, `Membership` e `Invite` são as tabelas `organization`, `member` e `invitation` do plugin `organization` do Better Auth, com os campos extras acima ([ADR-102](../decisions/adr-102-identity.md)).
- Tabelas do `identity` (Better Auth + nossas), [ADR-102](../decisions/adr-102-identity.md):
  - `Account` (`provider_id` = `credential`, `password` com o hash Argon2id; a senha mora aqui, não no `User`).
  - `Session` (`token`, `expires_at` deslizante de 12 h, `ip_address`, `user_agent`, `created_at` para o teto de 7 dias e a sessão recente; revogar apaga a linha).
  - `Verification` (desafios do 2FA, tentativas por desafio e o vínculo `bosun-cv-<id>` com a versão da credencial; vencidos saem na limpeza diária).
  - `TwoFactor` (único por usuário; `secret` e `backup_codes` cifrados pelo plugin com o `BETTER_AUTH_SECRET`, `verified`, `failed_verification_count`, `locked_until`).
  - `AuthThrottle` (`key` em HMAC, `count`, `window_started_at`, `blocked_until`): throttle por conta e por IP.
  - `UsedTotpCode` (`user_id`, `code_hash` em HMAC, `expires_at`; único por usuário e código): uso único do TOTP.
  - `PasswordResetRequest` (`status`: pending | resolved | dismissed; um pendente por usuário, índice parcial).
- `AuditLog` (`actor_type`: user | operator | system, `actor_id`, `action`, `target_type`, `target_id`, `data`, `created_at`). Só inserção; retenção de 6 meses (Marco Civil, art. 15), garantida por trigger e apagada pela limpeza diária.
- `Integration` (`kind`: meta | whatsapp | youtube | google_contacts | google_calendar | kiwify | site_chat, `owner_user_id` opcional, `status`, `encrypted_credentials`, `expires_at`).

## Contatos e venda

- `Contact` (`display_name`, `origin`, `merged_into_id`), `ContactIdentity` (`type`, `value`, `channel_name`, `attested`), `GoogleContactLink` (`resource_name`, `etag`), `GoogleSyncState` (`sync_token`).
- `Deal` (`contact_id`, `campaign_id?`, `stage`, `value_cents`, `owner_id`, `lost_reason`).
- `Sale` (`external_id` único por workspace, `contact_id?`, `campaign_id?`, `external_post_id?`, `flow_id?`, `product`, `value_cents`, `status`, `buyer`, `paid_at`).
- `TrackedLink` (`code` único, `campaign_id?`, `external_post_id?`, `flow_id?`, `contact_id?`, `target_url`), `LinkClick`.

## Canais e atendimento

- `WhatsAppSession` (`name`, `phone`, `status`).
- `Ticket` (`channel`, `channel_account_id`, `external_thread_id`, `contact_id`, `state`: automation | pending_agent | waiting_human | human | resolved, `assignee_id?`, `waiting_since`, `last_message_at`, `unread_count`). Único aberto por `(channel_account_id, external_thread_id)`.
- `Message` (`ticket_id`, `direction`, `external_id`, `body`, `status`, `sent_by_user_id?`). Único por `(channel, external_id)`.
- `InternalNote`, `SiteChatVisitor` (`session_token_hash`, `declared_name`, `declared_email`, `declared_phone`).

## Publicações e automação

- `Campaign` (`name`, `starts_at`, `ends_at`, `status`, `checkout_url`).
- `ExternalPost` (`integration_id`, `external_id` único por integração, `permalink`, `caption`, `published_at`, `campaign_id?`, `post_target_id?`): todo post publicado numa rede, seja nativo (importado pela API) ou publicado pela BOSUN. Fluxos, links, vendas e o painel apontam para ele.
- `Post` (`campaign_id?`, `body`, `scheduled_at`, `status`, `author_id`), `PostMedia` (`document_id`, `position`), `PostTarget` (`integration_id`, `format`, `body?`, `title?`, `status`, `external_id?`, `published_at?`, `attempts`, `last_error`). Ao publicar, o target cria o `ExternalPost` correspondente.
- `Flow` (`name`, `integration_id`, `trigger`, `external_post_id?`, `keywords`, `public_replies`, `dm_body`, `delivery_document_id?`, `handoff_keywords`, `status`, `priority`).
- `FlowRun` (`flow_id`, `event_external_id` único, `contact_id`, `post_external_id`, `keyword`, `result`, `error`). Deduplicação única por `(flow_id, contact_id, post_external_id, keyword)`.

## Trabalho e conteúdo

- `Task` (`title`, `body`, `assignee_id`, `due_at?`, `due_has_time`, `status`, `contact_id?`, `ticket_id?`, `deal_id?`, `campaign_id?`, `project_id?`).
- `Project` (`name`, `body`, `status`, `campaign_id?`).
- `Event` (`title`, `starts_at`, `ends_at`, `timezone`, `contact_id?`, `campaign_id?`), `EventAttendee`.
- `ExternalCalendarEvent` (por `integration_id` do membro; cache de leitura).
- `Document` (`kind`: file | link, `name`, `url?`, `storage_key?`, `size`, `mime`, `tags`).
- `Notification` (`user_id`, `type`, `target_type`, `target_id`, `read_at`), `NotificationPreference`, `PushSubscription`.

## Índices e restrições

- Índice em `workspace_id` em toda tabela de negócio; chaves únicas citadas acima incluem `workspace_id`.
- `ContactIdentity` única por `(workspace_id, type, value)`.
- Índices GIN `tsvector` em português para a [Busca](../product/search.md).
- Exclusão de contato (LGPD) é física e em cascata, com uma linha de auditoria sem conteúdo.

## Relations

- governed_by: [ADR-111 — Arquitetura, operação e privacidade](../decisions/adr-111-architecture.md)
- details: [Arquitetura](architecture.md)
