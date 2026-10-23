---
type: Wireframe
title: Wireframes de configurações
description: Matriz de permissões e status de atendimento.
tags: [bosun, wireframe, settings, permissions, ticket-status]
status: draft
generated: { by: reference_agent/deepseek-v4.1-flash-free, at: 2026-10-21T00:00:00Z }
---

# Configurações

## Permissões

```text
+------------------------------------------------------------------+
| Configurações > Permissões                                       |
+------------------------------------------------------------------+
| Recurso             Admin  Manager  Membro     Viewer            |
| Contatos             [x]     [x]      [x]       [R]              |
| Conversas            [x]     [x]      [x]       [R]              |
| Canais/WhatsApp      [x]     [x]      [x]       [R]              |
| Membros/convites     [x]     [x]      [ ]       [R]              |
| Configurações        [x]     [x]      [ ]       [R]              |
| Auditoria            [x]     [x]      [ ]       [ ]              |
| Relatórios           [x]     [x]      [x]       [R]              |
| Tarefas/follow-ups   [x]     [x]      [x]       [R]              |
|                                                                  |
| [Salvar]  Os quatro papéis são presets; não é possível criar novos.|
| [x] editar/admin  [R] somente leitura                            |
+------------------------------------------------------------------+
```

**Validar:** tabela editável por recurso/ação; granularidade; presets; leitura por papel; explicação de permissão negada.

> A matriz acima é a proposta revisada e aguarda aprovação final.

## Status de atendimento

```text
+--------------------------------------------------------------+
| Configurações > Status de atendimento                        |
+--------------------------------------------------------------+
| Ordem  Status           Cor       Conta como resolvido?      |
|  1     Novo             Azul      [ ]                        |
|  2     Em andamento    Amarelo   [ ]                         |
|  3     Aguardando      Laranja   [ ]                         |
|  4     Resolvido       Verde     [x]                         |
|                                                              |
| [+ Novo status]   [Renomear] [Reordenar]                     |
+--------------------------------------------------------------+
| Status padrão do sistema não podem ser excluídos, só editados.|
+--------------------------------------------------------------+
```

**Validar:** personalização; ordem; status resolvedor; exclusão segura.

## Links

- [Papéis e permissões](../../product/roles-permissions.md)
- [Caixa de atendimento](../../product/inbox-whatsapp.md)
- [Índice de wireframes](index.md)
