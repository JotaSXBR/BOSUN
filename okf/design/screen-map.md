---
type: Screen Map
title: Mapa de telas
description: Telas do piloto, navegação, componentes e estados.
tags: [bosun, design, screens, ui]
status: draft
generated: { by: reference_agent/deepseek-v4.1-flash-free, at: 2026-10-21T00:00:00Z }
---

# Mapa de telas

## Autenticação

- Login (usuário/e-mail + senha), com mostrar/ocultar senha e erros claros.
- Criar conta: o Admin define o e-mail; convite cria usuário/senha.
- Aceitar convite por link.
- Solicitar troca de senha (alerta interno ao Admin).
- Alerta de troca de senha (Admin define senha temporária).
- Troca obrigatória no próximo login, com explicação da senha temporária.

## Setup

- Checklist fixo de conexões, na ordem do golden path ([Onboarding](../product/onboarding.md)); cada item pode ser pulado e retomado em Configurações.

## Meu dia

- Três blocos: conversas que esperam por mim, tarefas atrasadas e de hoje, eventos de hoje ([Meu dia](../product/my-day.md)).

## Caixa de atendimento

- Três colunas: canais/sessões, lista de conversas e conversa; drawer lateral do contato.
- Filtros: Fila, Minhas, Automação, Resolvidas e Pendentes (visível e desabilitado sem agente de IA); filtro por canal.
- Ordem pela espera mais longa; busca na lista.
- Ações: assumir, atribuir, resolver, nota interna, criar tarefa, criar negócio.
- Indicadores: não lidas, tempo de espera, responsável, canal, aviso de possível duplicado.

## Contatos

- Lista com busca; ficha com identidades, origem, sync Google e linha do tempo.
- Ações: criar, editar, mesclar, exportar, excluir (LGPD), sincronizar.
- Conflito de identidade e etiqueta BOSUN removida: a pessoa escolhe.

## Golden path (ainda sem wireframe)

- Compositor e calendário de posts; formulário do fluxo; campanha com painel do funil; quadro de negócios; tarefa; projeto em lista e quadro; calendário; biblioteca de documentos. Cada fatia desenha a sua tela antes do código.

## Configurações

- Workspace: nome e fuso; criar e trocar de workspace.
- Membros: lista, papel fixo (Admin, Membro, Viewer), convites, remoção.
- Integrações: Meta, WhatsApp, YouTube, Google Contatos, Google Agenda (por membro), Kiwify, chat do site; estado de cada uma.
- Auditoria: filtros por ator, ação e data.

## Componentes principais

- App shell com sidebar e header.
- Botões primário/secundário/destrutivo.
- Campos de texto, busca, select, checkbox, switch.
- Badge de status, pill de canal, avatar de contato.
- Tabela de membros.
- Drawer/painel de contato.
- Composer de mensagem com anexo.
- Modal de confirmação.
- Toast de feedback.
- Empty state com ação.
- Banner de conexão (Meta, WhatsApp, Google, YouTube).
- Indicador de sync e última atualização.

## Estados

- Loading com skeleton nas listas.
- Empty state com próxima ação.
- Erro com possibilidade de retry.
- Acesso negado explicando o papel necessário.
- Conexão perdida com banner e ação de reconectar.

## Relations

- depends_on: [Princípios](principles.md)
- details: [Ticket](../product/ticket.md)
