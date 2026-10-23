---
type: Product Spec
title: Gamificação discreta
description: Progresso e marcos pessoais, sem pontos, ranking ou perda de sequência.
tags: [bosun, product, gamification, habits, tasks, milestones]
status: draft
generated: { by: reference_agent/deepseek-v4.1-flash-free, at: 2026-10-22T00:00:00Z }
---

# Gamificação discreta

A gamificação da BOSUN é **progresso, não competição**. Ela reforça consistência e conclusão sem transformar a rotina em um jogo de pontos ou em pressão social. A personalidade calma e precisa continua valendo: nada de urgência artificial, ranking ou perda de sequência.

## Princípios

- **Sem pontos, XP ou moedas.** Não existe economia paralela.
- **Sem ranking**, individual ou de equipe.
- **Sem perda**: um dia ruim não zera histórico nem remove marco conquistado.
- **Privado por padrão**: o dono vê; o workspace vê apenas progresso agregado.
- **Explicável**: o usuário entende por que recebeu um marco.
- **Silencioso**: marcos não viram notificação de comparação.

## O que existe

- **Score de consistência** de hábitos, com janela flexível (já definido em Hábitos).
- **Marcos** de hábitos e tarefas pessoais: primeira semana, 30 check-ins, projeto concluído, sequência de tarefas etc.
- **Badges privados** ligados a marcos, permanentes.
- **Progresso agregado do workspace**: conclusão, SLA e andamento de projetos, sem identificar pessoas em ranking.

## O que não existe

- Leaderboard, pódio ou comparação entre membros.
- XP, níveis, moedas, loja ou recompensa por pontos.
- Streak que zera ou badge que expira.
- Notificação que cobra o usuário (“você está atrasado”, “fulano está na frente”).
- Gamificação de atendimento por volume de mensagens; isso premia quantidade, não qualidade.

## Escopo

- **Hábitos** e **tarefas pessoais**.
- O workspace vê **progresso agregado** (projetos, SLA, conclusão), nunca o marco individual de outro membro.
- O usuário pode ocultar os marcos na interface; a preferência é local à conta.
- Compartilhar um marco é uma ação explícita, não um broadcast.

## Atualização 2026-10-23

A gamificação passa a incentivar o uso de **todos os módulos**, é **individual**, e Admin/Manager acompanham os seus liderados; continua sem ranking, pontos ou perda. A área pessoal continua privada — ponto a confirmar ([ADR-110](../decisions/adr-110-notifications-gamification-apps.md)). Nesse ponto, "privado por padrão" e "só agregado" acima ficam substituídos.

## Em aberto

- Quem é "liderado" (time ou papel) e catálogo de marcos por módulo.

- Janela do score (30, 60 ou 90 dias).
- Catálogo inicial de marcos e badges.
- Como o usuário oculta ou desliga a gamificação.
- Gamificação de OKR: fora do escopo inicial.
- Marcos de equipe: fora do escopo; se voltarem, serão opt-in e sem ranking.

## Decisões de 2026-10-23

- **Confirmado:** o Manager vê a adoção por módulo (usou ou não, marcos) dos membros dos seus times; **nunca vê conteúdo nem a área pessoal**. Admin vê todos. Liderado = membro de time em que a pessoa é Manager. Sem ranking.

## Links

- [Hábitos](habits.md)
- [Tarefas e projetos](tasks-projects.md)
- [Meu dia](my-day.md)
- [Visão e personalidade](vision.md)
- [ADR-110 — Gamificação discreta](../decisions/adr-110-notifications-gamification-apps.md)
