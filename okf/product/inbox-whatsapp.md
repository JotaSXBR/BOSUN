---
type: Product Spec
title: Caixa de atendimento e WhatsApp
description: WAHA/GOWS, múltiplas sessões, fila FIFO, filtros, ticket e drawer de contato.
tags: [bosun, inbox, whatsapp, waha, ticket]
status: stable
generated: { by: reference_agent/deepseek-v4.1-flash-free, at: 2026-10-21T00:00:00Z }
---

# Caixa de atendimento e WhatsApp

O atendimento é um módulo central da BOSUN, não uma integração acessória.

## Canal do MVP

- **WhatsApp Web** via **WAHA self-hosted** com engine **GOWS**.
- WAHA roda como serviço Docker separado.
- A BOSUN usa **REST** para enviar e **webhooks** para receber.
- GOWS usa WebSocket direto com o WhatsApp Web, sem navegador.
- Pareamento por **QR code** ou código, em sessão nomeada.
- O domínio isola o provider em um adaptador `WhatsAppProvider` para permitir troca futura por API oficial.

## Múltiplas sessões

- O espaço pode ter várias sessões de WhatsApp, cada uma com nome, número e status.
- Cada conversa é vinculada à sessão que a recebeu.
- Por padrão, todas as sessões são visíveis para quem tem permissão de atendimento.
- O Admin pode restringir a visibilidade de uma sessão por papel.
- O Admin gerencia as sessões; os demais veem conforme permissão.

## Fila e atribuição

- A fila ordena pela mensagem sem resposta mais antiga (**FIFO**).
- A fila **apenas ordena**; não distribui automaticamente.
- O atendente **assume manualmente** a conversa; a atribuição é registrada.
- O tempo de espera é visível.
- O filtro **Pendentes** é a fila reservada a agentes de IA. No MVP fica **visível e desabilitado**, sem receber itens.

## Layout

- **Três colunas**: sessões, lista de conversas e conversa.
- Inspirado em Chatwoot/WhatsApp Web.
- Busca na lista de conversas.
- Painel de contato/ticket em **drawer lateral sobre a conversa**, sob demanda.
- Filtros: **Fila, Minhas, Aguardando, Resolvidas, Pendentes**.
- Indicadores: não lidas, tempo de espera, responsável, status.
- Ações: assumir, atribuir, mudar status, encerrar, criar follow-up.
- Notas internas e anexos.
- Anexos e mídias ficam no RustFS.

## Ticket

- O atendimento/ticket é a conversa com estado e responsável.
- Ciclo: início (nova conversa ou mensagem), meio (troca de mensagens, contexto, anexos, decisões) e fim (resolução, encerramento e registro mínimo).
- Status padrão: **Novo, Em andamento, Aguardando, Resolvido**.
- O Admin pode criar, renomear e reordenar status.
- Cada status tem nome, cor, ordem e indica se conta como resolvido.
- Status padrão do sistema não podem ser excluídos, só editados.

## Fluxos

### Mensagem recebida

1. WAHA recebe o evento e chama o webhook da BOSUN.
2. A BOSUN valida origem e idempotência pelo `external_id`.
3. Normaliza o telefone e localiza/cria o contato.
4. Localiza/cria a conversa vinculada à sessão.
5. Grava a mensagem e atualiza `last_message_at`/`unread_count`.
6. Insere na fila FIFO se não houver responsável.

### Resposta

1. O atendente escreve e envia.
2. A BOSUN grava a mensagem de forma otimista.
3. Chama `POST /api/sendText` (ou mídia) no WAHA.
4. Atualiza o status com o resultado/ack.
5. Registra auditoria.

## Critérios de aceite

1. Criar uma sessão e parear por QR code.
2. Receber uma mensagem inbound e vê-la na caixa.
3. Responder pela BOSUN e a mensagem chegar ao WhatsApp.
4. Reconectar a sessão sem perder o histórico local.
5. Exibir status da conexão: conectado, desconectado, aguardando QR.
6. Filtrar por sessão e por estado.
7. Assumir uma conversa e registrar o responsável.

## Fora do MVP

- E-mail, Instagram Direct e mensagens do site.
- Distribuição automática de fila.
- Agentes de IA na fila **Pendentes**.
- Automações que enviam mensagens sem aprovação.

## Links

- [WhatsApp/WAHA](../tech/whatsapp-waha.md)
- [Wireframe do inbox](../design/wireframes/inbox.md)
- [ADR-107](../decisions/adr-107-service-social.md)
- [ADR-107](../decisions/adr-107-service-social.md)
