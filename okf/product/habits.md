---
type: Product Spec
title: Hábitos
description: Tipos de hábito, score flexível, check-in e relação com tarefas.
tags: [bosun, product, habits, score, routine]
status: draft
generated: { by: reference_agent/deepseek-v4.1-flash-free, at: 2026-10-21T00:00:00Z }
---

# Hábitos

## Tipos

- **Sim/não** — feito ou não feito.
- **Medida com meta** — valor e unidade, como 8 copos ou 30 minutos.
- **Frequência** — X vezes por semana ou mês.
- **Negativo** — dias evitando um comportamento.
- **Pausa e exceções** — dias de descanso e interrupções planejadas.

## Score

- A sequência é um **score flexível de consistência**, não um streak rígido.
- Um dia ruim não zera o histórico.
- Dias de pausa e exceções não contam contra.
- O histórico mostra calendário, consistência e tendência.

## Relação com tarefas

- Hábito e tarefa recorrente são **modelos separados**.
- Um hábito pode gerar tarefas, mas não é a mesma entidade.
- O check-in do hábito aparece no Meu dia.

## Em aberto

- Janela do score: 30, 60 ou 90 dias.
- Hábito com horário fixo e lembrete.
- Hábito pessoal e hábito de workspace.
- Notas e humor por check-in.
- Gamificação: ver [Gamificação discreta](gamification.md); marcos e consistência, sem pontos.
- Fuso horário e virada do dia.

## Decisões de 2026-10-23

- Score numa **janela móvel de 30 dias**.
- **Hábitos de workspace existem desde o início**, ao lado dos pessoais.

## Links

- [Meu dia](my-day.md)
- [Tarefas e projetos](tasks-projects.md)
- [Gamificação discreta](gamification.md)
- [ADR-105 — Hábitos com score flexível](../decisions/adr-105-work-time.md)
- [ADR-110 — Gamificação discreta](../decisions/adr-110-notifications-gamification-apps.md)
