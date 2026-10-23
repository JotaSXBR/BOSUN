---
type: ADR
title: ADR-103 — Onboarding e primeiro acesso
description: Wizard adaptativo por trilhas de ativação e setup curto do convidado.
tags: [bosun, adr, onboarding, activation, invite]
status: draft
generated: { by: agent/claude-opus-5-5, at: 2026-10-23T00:00:00Z }
---

# ADR-103 — Onboarding e primeiro acesso

**Status:** vigente; consolidado em 2026-10-23 e sujeito à aprovação do design completo. Este ADR é a única fonte de decisão do domínio: decisão nova **edita este arquivo**.

## Wizard

1. **Quatro telas fixas, sem conexão:** contexto, chave de recuperação, intenções, convite.
2. Intenções múltiplas — atender clientes, publicar conteúdo, tocar projetos, guardar conhecimento — e **"só explorar" exclusivo**.
3. Cada intenção vira **trilha de ativação**: checklist de até quatro itens com motivo, **evento de ativação** observado e data. Trilhas coexistem.
4. A intenção **roteia, não tranca**: define área inicial, preset de partida e ordem do checklist; nenhum módulo é escondido.
5. O wizard termina no **primeiro item aberto da trilha principal** (para atendimento, o pareamento do WhatsApp).
6. Eventos de ativação: primeira mensagem recebida, primeiro post publicado, primeiro projeto com tarefas atribuídas, primeiro documento na Base. A ativação é registrada quando acontece, mesmo sem checklist.
7. Depois da ativação, o checklist recolhe para **Primeiros passos**. Admin/Manager acrescentam, religam ou desligam trilhas; desligar nunca apaga dado; tudo auditado.
8. **Sem dados de exemplo.**

## Convidado

9. Quem entra por convite **não passa pelo wizard**: setup curto, uma vez — senha no aceite, perfil, notificações, opt-in da área pessoal e uma frase de contexto (papel e time).
10. Nada pergunta o que o convite já sabe. A entrada é **derivada** da trilha principal + papel + time.
11. Setup interrompível e retomável; reexecutável em Perfil, que é a mesma tela para todos.
12. Tutorial de uso: adiado; quando vier, curto, sobre dados reais, pulável e nunca antes da primeira tarefa real.

## Origem

Consolida os antigos 016, 058, 059, arquivados em `archive/adrs-2026-10-23/`.
