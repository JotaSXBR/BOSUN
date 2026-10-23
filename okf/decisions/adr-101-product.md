---
type: ADR
title: ADR-101 — Produto, piloto e escopo
description: Instalação dedicada, workspaces, golden path do piloto, setup inicial, invariantes e o que fica para depois.
domain: produto
tags: [bosun, adr, produto, piloto, escopo]
status: draft
generated:
  by: claude-opus/5.5
  at: 2026-10-23T00:00:00Z
---

# ADR-101 — Produto, piloto e escopo

**Status:** vigente, em draft até a aprovação do plano. Fonte única das decisões do domínio; decisão nova edita este arquivo. Consolida o antigo ADR-103 (onboarding).

## Decisões

1. **Uma instalação por cliente**, em VPS dedicada; o isolamento entre clientes é físico.
2. **Workspace** é a unidade de isolamento de dados; `workspace_id` é obrigatório em toda consulta. A piloto começa com um workspace e pode criar outros, um por infoproduto ou cliente. O Ambiente existe só no modelo, sem tela própria.
3. **Sem templates**: todo workspace nasce com o mesmo seed de infoprodutos.
4. **Piloto**: uma founder de infoprodutos. O produto é o **golden path**: post → comentário → automação → atendimento → CRM → venda → tarefa → calendário → Meu dia ([Piloto](../product/pilot.md)).
5. O piloto está completo com **uma campanha real + 30 dias** de uso sem ferramenta paralela nas funções cobertas.
6. **Setup inicial** é uma tela com checklist fixo: nome do workspace; conectar Instagram/Facebook, WhatsApp, YouTube, Google (Contatos e Agenda) e o webhook da Kiwify; instalar o chat do site; convidar alguém. Itens podem ser pulados e retomados. Sem trilhas, eventos de ativação nem dados de exemplo.
7. Quem entra por convite só define a senha no aceite.
8. **Integração por fluxo, não por acoplamento**: vínculo explícito, opcional e auditável. Integração nova só entra se conecta um passo do golden path.
9. **Anti-goals:** não é Notion/Drive; não é processador de pagamento; não é mobile-first (web responsiva); sem colaboração entre organizações; sem adtech nem venda de dados.
10. **Invariantes:** CRM leve; captura não vira execução automática; automação opt-in e escopada; Publicações não gera imagem nem vídeo; campanha não é projeto; sem DM fria nem disparo em massa.
11. O que foi adiado fica em uma linha no [later.md](../product/later.md). Itens removidos não voltam sem uma decisão nova neste ADR.
12. Removidos em 2026-10-23: templates, hábitos, OKR, gamificação, Observer, scorecard de prontidão, Item como supertype, links favoritos como módulo, revisão por quatro olhos e pacote de encerramento de mídia.

## Relações

- governado_por: [Perfil OKF BOSUN](../okf-profile.md)
- detalha: [Piloto](../product/pilot.md)
