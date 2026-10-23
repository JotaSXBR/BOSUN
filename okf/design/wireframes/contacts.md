---
type: Wireframe
title: Wireframe de contatos
description: Lista, detalhe, sync e conflitos.
tags: [bosun, wireframe, contacts, google]
status: draft
generated: { by: reference_agent/deepseek-v4.1-flash-free, at: 2026-10-21T00:00:00Z }
---

# Contatos

```text
+--------------------------------------------------------------+
| Contatos > Ana Souza                                         |
+--------------------------------------------------------------+
| [Foto]  Ana Souza                                            |
|         Telefone: +55 11 99999-0000  (principal)             |
|         E-mail: ana@acme.com                                 |
|         Origem: Google People API / etiqueta BOSUN           |
|         Última sync: 21/10/2026 14:32                        |
|                                                              |
| [Editar] [Sincronizar] [Exportar] [Excluir]                  |
+--------------------------------------------------------------+
| Histórico de atendimentos                                    |
| - 21/10 14:20  WhatsApp Principal  Em atendimento            |
| - 20/10 09:10  WhatsApp Vendas     Resolvido                 |
+--------------------------------------------------------------+
| Conflito de identidade? [Revisar]                            |
| Etiqueta BOSUN removida? [Manter] [Arquivar] [Excluir]       |
+--------------------------------------------------------------+
```

**Validar:** identidade por telefone; origem do dado; ações de sync; conflito e etiqueta removida.

## Lista

```text
+--------------------------------------------------------------+
| Contatos                              [ + Novo contato ]     |
| [ Buscar nome, telefone ou e-mail... ]                       |
+--------------------------------------------------------------+
| Ana Souza        @anasouza    +55 11 99999-0000   Sincronizado|
| Carlos Lima      —            +55 21 98888-1111   Pendente    |
| Mariana Alves    @mari.alves  +55 31 97777-2222   Conflito    |
+--------------------------------------------------------------+
```

## Relations

- details: [Contato](../../product/contact.md)
- part_of: [Mapa de telas](../screen-map.md)
