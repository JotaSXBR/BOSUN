---
type: Product Model
title: Ambiente, workspaces e áreas
description: Hierarquia Ambiente → Workspace, templates iniciais e área pessoal por membro.
tags: [bosun, product, workspace, environment, templates, privacy]
status: draft
generated: { by: reference_agent/deepseek-v4.1-flash-free, at: 2026-10-21T00:00:00Z }
---

# Ambiente, workspaces e áreas

## Hierarquia

- **Instalação** é a VPS dedicada de um cliente. Cada cliente tem a própria instalação, com banco, arquivos, chaves e backup próprios; não há compartilhamento de dados entre clientes.
- **Ambiente** é a conta que agrupa workspaces dentro da instalação. Reúne identidade, membros e cobrança. Um workspace nunca existe fora de um ambiente.
- **Workspace** é o contexto de um produto ou negócio: um produto, uma empresa, um curso ou a vida pessoal de um membro. É a unidade de isolamento de dados, membros, permissões, canais, agentes e configurações. Produto novo = workspace novo.
- **Membro** é um usuário com acesso a um workspace. Admin/Manager autoriza quem trabalha em cada workspace e com qual papel. O papel vale por workspace, não para o ambiente inteiro.

O produto começa com **uma única usuária, a criadora solo** que motivou o projeto e organiza várias áreas de atuação. A equipe entra depois, por convite, sem mudar a estrutura. O desenvolvedor é o operador da instalação; a usuária é a dona do ambiente.

## Templates de workspace

No lançamento existem quatro templates: **Pessoal**, **Empresa**, **Produto** e **Curso**. Uma barbearia ou salão usa a lógica de **Empresa** (agenda, profissionais, serviços e comandas); um infoproduto usa **Produto/Curso**. **Serviços** é o quinto template, próprio ([ADR-101](../decisions/adr-101-product-structure.md)).

Um template define:

- os módulos ativos;
- a navegação e a tela inicial;
- os presets de permissão;
- o vocabulário das entidades (projeto, produto, curso, cliente);
- as estruturas e os dados iniciais.

O template é **apenas o ponto de partida**. Depois da criação, ele deixa de governar o workspace: o Admin ativa ou desativa módulos e ajusta a configuração livremente. Não existem tipos rígidos de workspace; existe a configuração que o workspace herdou e passou a possuir.

## Área pessoal

- Itens pessoais nascem **privados**.
- O Admin/Manager libera ou bloqueia a vida pessoal **por membro**, na criação ou depois.
- Quando liberada, a vida pessoal pode assumir duas formas: um **workspace pessoal separado** e **módulos pessoais privados** dentro de workspaces compartilhados.
- O conteúdo pessoal não é visível a outros membros por padrão, inclusive Admin/Manager.

## Tela inicial

- O padrão é um dashboard com foco no dia, no espírito do “Meu dia”.
- Um dashboard operacional separado para Admin/Manager segue em avaliação na rodada de atendimento e relatórios.

## Em aberto

- Pertencer a workspaces de ambientes diferentes.
- Dono do workspace pessoal e poderes do Admin sobre ele.
- Templates personalizados pelo Admin.
- O que acontece com os dados pessoais quando a vida pessoal é bloqueada.
- Módulos e vocabulário do template Serviços.
- Reconciliação do modelo de dados e do deploy com a instalação dedicada por cliente (ADR-101).

## Decisões de 2026-10-23

- Template **Serviços**: Atendimento, agenda de clientes, CRM e tarefas; vocabulário cliente, serviço, agendamento. Agendamento online público fica para depois.

## Links

- [Visão](vision.md)
- [Papéis e permissões](roles-permissions.md)
- [Planos, hospedagem e cobrança](plans.md)
- [ADR-101 — Ambiente, workspaces e templates](../decisions/adr-101-product-structure.md)
- [ADR-101 — Área pessoal por membro](../decisions/adr-101-product-structure.md)
- [ADR-101 — Instalação dedicada por cliente](../decisions/adr-101-product-structure.md)
