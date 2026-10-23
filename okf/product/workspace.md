---
type: Product Spec
title: Workspace
description: Unidade de isolamento de dados da instalação; um por infoproduto ou cliente, todos com o mesmo seed.
tags: [bosun, workspace, multi-tenant]
status: draft
generated:
  by: claude-opus/5.5
  at: 2026-10-23T00:00:00Z
---

# Workspace

- Uma **instalação** (VPS dedicada) atende um cliente. Dentro dela, o **Ambiente** agrupa usuários e existe só no modelo.
- **Workspace** isola os dados: contatos, tickets, posts, fluxos, tarefas e documentos pertencem a um workspace; toda consulta filtra `workspace_id`.
- A piloto começa com um workspace e pode criar outros, por exemplo um para um novo infoprodutor que ela atenda. Canais e integrações são conectados por workspace.
- O usuário pode participar de vários workspaces, com um papel em cada; o seletor de workspace fica no menu da conta.
- Todo workspace nasce com o mesmo seed: estágios do pipeline, status de tarefa e fuso `America/Sao_Paulo`. Não há templates.
- Criar workspace: só o Admin de um workspace existente ou o operador pela CLI.

## Relações

- governado_por: [ADR-101 — Produto, piloto e escopo](../decisions/adr-101-product.md)
- parte_de: [Piloto](pilot.md)
