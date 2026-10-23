---
type: Roadmap
title: Mapa de capacidades do produto completo
description: Capacidades, dependências e critérios de completo; não é um cronograma de lançamento.
tags: [bosun, roadmap, capabilities, dependencies, completeness]
status: draft
generated: { by: reference_agent/deepseek-v4.1-flash-free, at: 2026-10-22T00:00:00Z }
---

# Mapa de capacidades

Este documento **não é um plano de lançamento nem um cronograma**. Ele descreve o produto completo como um mapa de capacidades, dependências e critérios de completo. A ordem de construção é consequência das dependências, não de uma data.

> O produto é completo quando o [golden path e o ciclo real](success-criteria.md) passam. As fronteiras estão em [Anti-goals](anti-goals.md). O MVP é o recorte de Fundação + Conversas; seus critérios estão em [Escopo do MVP](mvp-scope.md).

## Camadas

| Camada | O que cobre | Depende de | Completo quando |
|---|---|---|---|
| **Fundação** | Ambiente, workspaces, templates, auth, papéis/permissões, times, auditoria, Item, mídia, busca, notificações, retenção e exportação | — | Um workspace é criado, convidado, permissionado, auditado e exportado; a busca respeita dono e visibilidade; pessoal e workspace ficam separados. |
| **Conversas** | Contatos/Google, WhatsApp, e-mail, chat do site, Telegram, inbox, ticket, SLA, CSAT, métricas, notas e menções | Fundação; adaptadores de canal | Cada canal cria ticket; a conversa é atribuída, respondida, encerrada e medida, com histórico e auditoria. |
| **Aquisição** | Social, Instagram/Facebook/TikTok/Kwai, automação, fluxos, handoff, venda atribuída, dashboard social | Conversas, contatos, CRM, Publicações, automação | Um comentário real dispara o fluxo, vira DM, faz handoff, é atendido e gera venda confirmada atribuída ao post/fluxo. |
| **Publicações** | Time editorial, campanha, calendário, compositor, fila, aprovação, publicação API/assistida, analytics, reciclagem, post → automação | Fundação, mídia, conexões, IA de texto | Um time e uma campanha são criados; um post é planejado, aprovado, publicado ou assistido nas seis plataformas, medido e ligado a um fluxo. |
| **CRM e vendas** | Contatos, empresas, negócios, pipeline, atividades, confirmação de venda | Contatos, conversas, webhooks | Um lead vira negócio quando há intenção, percorre o pipeline e a venda é confirmada e atribuída — sem pipeline obrigatório. |
| **Trabalho e tempo** | Tarefas, projetos, visões, dependências, calendário, time blocking, Meu dia, hábitos, objetivos/OKR, documentos, notas, gamificação | Fundação, busca, notificações | Captura → tarefa/projeto → agenda → conclusão → Meu dia; hábitos e objetivos progridem; documentos e notas ficam vinculados por intenção. |
| **Inteligência** | Base de Conhecimento, Copiloto, Observer, agentes, autonomia, prontidão, handoff, custo e auditoria | Fundação, Base, conversas, trabalho, CRM | A Base sustenta o Copiloto; um agente passa o gate de prontidão, atende com handoff e tem cada ação auditada. |
| **Operação** | Instalação, backup, monitoramento, atualização, exportação/retenção, offline/PWA/nativo, resumos, cobrança e administração | Todas | Instalação, backup, restauração, atualização e exportação têm runbook; um segundo workspace funciona sem código sob medida. |

## Fluxos que provam a integração

1. **Lançamento** — Publicações → post → comentário → automação → Atendimento → CRM → venda → tarefa → calendário → Meu dia.
2. **Conhecimento** — Base → Copiloto → agente → conversa → handoff.
3. **Trabalho** — captura → nota → tarefa → projeto → calendário → Meu dia → hábito/objetivo.
4. **Publicação** — campanha → ideia → rascunho → revisão → agendado → publicado/assistido → analytics → reciclagem.
5. **Administração** — convite → papel → permissão → auditoria → exportação.

Cada fluxo tem um [critério de sucesso](success-criteria.md) e uma evidência. A integração existe para fazer o trabalho atravessar; não para acoplar módulos.

## Dependências duras

- **Item e mídia** antes de notas, tarefas, documentos, busca e Publicações.
- **Contatos** antes de conversas, CRM, automação e venda atribuída.
- **Canais** antes de inbox, Social e Atendimento.
- **Biblioteca de Documentos** antes de Publicações.
- **Base de Conhecimento** antes de Copiloto e agentes.
- **Permissões e auditoria** antes de qualquer módulo multiusuário.
- **Automação determinística** antes de agentes de execução; fluxo primeiro, agente como fallback.
- **Publicações** antes de post → automação → venda.
- **Busca e notificações** são transversais e entram com a Fundação, não no fim.

## Critério de priorização

Sem datas, a prioridade segue três perguntas:

1. **Dependência**: sem essa capacidade, qual fluxo não fecha?
2. **Dor da piloto**: isso remove trabalho manual ou só adiciona módulo?
3. **Risco**: o que pode inviabilizar o produto se ficar para depois (segurança, perda de dados, canal, API)?

A resposta não é uma fase de lançamento; é a próxima peça que destrava um fluxo real.

## O que não é uma fase

- Não há “fase de lançamento” neste documento.
- Não há promessa de data.
- Não há módulo “v1” pela metade: cada capacidade tem um critério de completo.
- O MVP continua sendo um recorte preservado, não o produto inteiro.

## Links

- [Critérios de sucesso do produto completo](success-criteria.md)
- [Anti-goals e fronteiras](anti-goals.md)
- [Publicações e planejamento editorial](publications.md)
- [Escopo do MVP](mvp-scope.md)
- [Plano do MVP](../plan/plan.md)
- [ADR-101 — Produto completo e critérios de sucesso](../decisions/adr-101-product-structure.md)
