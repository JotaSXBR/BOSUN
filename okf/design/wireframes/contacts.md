---
type: Wireframe
title: Wireframe de contatos
description: Lista, detalhe, sync e conflitos.
tags: [bosun, wireframe, contacts, google]
status: stable
generated: { by: reference_agent/deepseek-v4.1-flash-free, at: 2026-10-21T00:00:00Z }
---

# Contatos

```text
+--------------------------------------------------------------+
| Contatos > Ana Souza                                         |
+--------------------------------------------------------------+
| [Foto]  Ana Souza                                            |
|         Organização: Acme                                    |
|         Telefone: +55 11 99999-0000  (principal)             |
|         E-mail: ana@acme.com                                 |
|         Origem: Google People API / etiqueta BOSUN           |
|         Última sync: 21/10/2026 14:32                        |
|                                                              |
| [Editar] [Sincronizar] [Exportar] [Excluir]                  |
+--------------------------------------------------------------+
| Histórico de atendimentos                                    |
| - 21/10 14:20  WhatsApp Principal  Em andamento              |
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
| Ana Souza        Acme        +55 11 99999-0000   Sincronizado|
| Carlos Lima      Beta        +55 21 98888-1111   Pendente    |
| Mariana Alves    Gama        +55 31 97777-2222   Conflito    |
+--------------------------------------------------------------+
```

## Links

- [Contatos e Google](../../product/contacts-google.md)
- [Índice de wireframes](index.md)
