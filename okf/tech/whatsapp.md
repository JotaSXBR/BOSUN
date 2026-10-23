---
type: Integration Spec
title: WhatsApp via WAHA/GOWS
description: Sessões, endpoints, webhooks, idempotência, mídia e limites do GOWS.
tags: [bosun, whatsapp, waha, gows, integration]
status: stable
generated: { by: reference_agent/deepseek-v4.1-flash-free, at: 2026-10-21T00:00:00Z }
sources:
  - resource: https://waha.devlike.pro/docs/engines/gows/
    title: WAHA — GOWS engine
  - resource: https://waha.devlike.pro/docs/how-to/receive-messages/
    title: WAHA — Receive messages
  - resource: https://waha.devlike.pro/docs/how-to/send-messages/
    title: WAHA — Send messages
---

# WhatsApp via WAHA/GOWS

## Decisão

- **WAHA self-hosted** com engine **GOWS**.
- REST para envio; webhooks para recebimento.
- WAHA roda em container separado da BOSUN.
- Adaptador `WhatsAppProvider` isola o domínio.

## Configuração

Variáveis mínimas:

- `WAHA_BASE_URL`
- `WAHA_API_KEY`
- `WAHA_SESSION` (quando aplicável)
- URL de webhook da BOSUN

O webhook deve ser autenticado/verificado e **idempotente**.

## Sessões

- Criar, iniciar, parear por QR/código, consultar status, reconectar e desconectar.
- Status: `connected`, `disconnected`, `waiting_qr`, `starting`, `error`.
- Sessão nomeada; múltiplas sessões por espaço.
- A sessão precisa sobreviver a reinícios e reconexões.
- Exibir último QR e data/hora.

## Endpoints principais

- `POST /api/sessions` — criar sessão.
- `GET /api/sessions` — listar.
- `GET /api/sessions/{name}` — status.
- `GET /api/{session}/auth/qr` — QR.
- `POST /api/sendText` — texto.
- Endpoints de mídia suportados pela engine.
- Webhook por sessão.

> GOWS **não** suporta `GET /api/messages` nem `forwardMessage`. A BOSUN depende de webhooks e dos endpoints suportados.

## Webhook

- Evento `message` para recebimento.
- Validar origem/segredo.
- Idempotência por `external_id`; eventos repetidos não duplicam mensagens ou tickets.
- `chatId` no formato `123@c.us`; `@s.whatsapp.net` aparece em `_data` e deve ser convertido.
- Persistir `raw_payload` para depuração, sujeito à retenção.
- Processar em job quando o payload exigir mídia ou operações demoradas.

## Envio

1. Gravar mensagem otimista.
2. Chamar WAHA.
3. Atualizar status com resultado/ack.
4. Auditar.

## Mídia

- Baixar mídia recebida e armazenar no RustFS.
- Metadados em `MediaAsset`.
- URLs assinadas para exibição.
- Limitar tamanho e validar MIME.
- Expurgo alinhado à retenção.

## Riscos e limites

- Não é API oficial da Meta; risco de bloqueio/banimento.
- Usar número dedicado e evitar disparos em massa.
- GOWS não cobre todos os recursos de outras engines.
- Histórico sincronizado pode ser grande; limitar a sincronização inicial.
- Mudanças no WhatsApp Web podem quebrar a engine.

## Critérios de aceite

1. Criar sessão e parear por QR.
2. Receber inbound e exibir na caixa.
3. Responder e a mensagem chegar ao WhatsApp.
4. Reconectar sem perder histórico local.
5. Exibir status da conexão.
6. Webhook repetido não duplica mensagem.
7. Mídia recebida fica acessível por URL assinada.

## Relations

- governed_by: [ADR-107 — Canais e atendimento](../decisions/adr-107-service.md)
- details: [Canal](../product/channel.md)
