---
type: Wireframe
title: Wireframes de configurações
description: Matriz de permissões e status de atendimento.
tags: [bosun, wireframe, settings, permissions, ticket-status]
status: draft
generated: { by: reference_agent/deepseek-v4.1-flash-free, at: 2026-10-21T00:00:00Z }
---

# Configurações

## Membros e papéis

```text
+------------------------------------------------------------------+
| Configurações > Membros                                          |
+------------------------------------------------------------------+
| Nome             E-mail                Papel      Ações          |
| Ana              ana@...               Admin      —              |
| Bruno            bruno@...             Membro ▾   [Remover]      |
| Carla (convite)  carla@...             Viewer ▾   [Reenviar]     |
|                                                                  |
| [Convidar]   Papéis fixos: Admin, Membro, Viewer.                |
+------------------------------------------------------------------+
```

**Validar:** papel fixo por membro, sem editor de permissões; o que cada papel faz está em [Papéis](../../product/role.md).

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

## Relations

- details: [Papéis](../../product/role.md)
- part_of: [Mapa de telas](../screen-map.md)
