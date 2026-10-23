---
type: Wireframe
title: Wireframe da caixa de atendimento
description: Três colunas, filtros, FIFO e drawer lateral.
tags: [bosun, wireframe, inbox, whatsapp]
status: stable
generated: { by: reference_agent/deepseek-v4.1-flash-free, at: 2026-10-21T00:00:00Z }
---

# Caixa de atendimento

```text
+----------------------------------------------------------------------------+
| BOSUN  [Inbox] [Contatos] [Configurações]              Admin ▾             |
+--------------+----------------------------------+--------------------------+
| SESSÕES      | [Fila] [Minhas] [Aguardando]     | Ana Souza  ● WhatsApp    |
| ● Principal  | [Resolvidas] [Pendentes]         | Sessão: Principal        |
| ● Vendas     | [ Buscar conversa... ]           | Status: Em andamento     |
| ○ Suporte    | Ordem: espera (FIFO)             | Responsável: Você        |
|              | > Ana Souza          12 min      |                          |
|              |   "Oi, preciso de ajuda..."      | [histórico de mensagens] |
|              | > Carlos Lima         8 min      |                          |
|              |   "Bom dia..."                   |                          |
|              | > Mariana Alves       3 min      | [ Responder...        ]  |
|              |   "Consegue me enviar..."        | [Anexar] [Nota] [Enviar] |
|              |                                  | [Contato] [Ticket]       |
+--------------+----------------------------------+--------------------------+
| Painel do contato/ticket abre em drawer lateral sobre a conversa.          |
| Pendentes fica visível e desabilitado até os agentes de IA.                 |
+----------------------------------------------------------------------------+
```

**Validar:** três colunas; filtros; busca; tempo de espera; assumir conversa; drawer lateral; Pendentes desabilitado.

## Drawer de contato/ticket

```text
+--------------------------------------+
| Ana Souza                     [x]    |
| WhatsApp Principal                   |
| +55 11 99999-0000                    |
| ana@acme.com                         |
| Origem: Google / etiqueta BOSUN      |
| Última sync: 21/10 14:32             |
|                                      |
| [Abrir contato] [Editar]             |
| Status: [Em andamento ▾]             |
| Responsável: [Você ▾]                |
| [Criar follow-up]                    |
+--------------------------------------+
```

## Relations

- details: [Ticket](../../product/ticket.md)
- part_of: [Mapa de telas](../screen-map.md)
