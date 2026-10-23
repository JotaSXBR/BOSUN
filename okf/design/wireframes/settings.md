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

## Relations

- details: [Papéis](../../product/role.md)
- part_of: [Mapa de telas](../screen-map.md)
