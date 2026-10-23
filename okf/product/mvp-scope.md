---
type: MVP Scope
title: Escopo do MVP
description: Corte do MVP, jornada, critério de sucesso e o que fica fora.
tags: [bosun, mvp, scope, acceptance]
status: stable
generated: { by: reference_agent/deepseek-v4.1-flash-free, at: 2026-10-21T00:00:00Z }
---

# Escopo do MVP

A primeira versão é **multiusuária**, web-first, somente online e em português. O piloto inicial não paga. A arquitetura deve estar preparada para i18n.

## Corte do MVP

O MVP é um recorte da primeira versão, com três pilares:

1. **Onboarding/Wizard** — configura conta, contexto, WhatsApp, Google e convite.
2. **Contato** — entidade central, com dados, histórico e vínculos.
3. **Atendimento** — caixa de entrada e ticket: conversa, status, pendências e ações.

Dependências técnicas mínimas (auth, persistência, upload, jobs) entram junto se forem indispensáveis.

## Critério de sucesso

Um espaço é criado, configurado, recebe **ao menos dois usuários**, sincroniza contatos do Google pela etiqueta **BOSUN**, aplica permissões granulares e conduz um atendimento do início ao fim.

O critério de pronto exige **fluxo completo + Google People API + permissões granulares**.

## Jornada

1. A primeira pessoa cria o espaço e recebe o papel **Admin**.
2. Passa pelo wizard: **contexto, WhatsApp, Google e convite**. Google e convite podem ser pulados.
3. Cai na **Caixa de Atendimento**, com conversas que exigem resposta.
4. Escolhe uma conversa, lê o histórico, responde e registra o desfecho.
5. Contato e atendimento ficam atualizados.

A primeira ação após o onboarding é **responder uma conversa**.

## Fora do MVP

- Colaboração entre organizações diferentes.
- Ações externas automáticas do copiloto.
- Agentes de IA configuráveis e automações de fluxo.
- E-mail, Instagram e demais canais sociais como canais de atendimento.
- Tarefas/projetos, agenda, documentos, hábitos, objetivos, busca global, Publicações e CRM.
- Modo offline, apps nativos e cobrança automatizada.
- Automações e agentes que enviam mensagens ou executam ações externas.

O MVP corresponde à **fase 1 da escada de autonomia** do ADR-109: visibilidade, alerta e resposta humana. Automação e agentes entram depois, quando houver base de conhecimento e configuração.

## Módulos da primeira versão (pós-MVP)

Captura rápida, documentos, tarefas/projetos, agenda, “Meu dia”, hábitos, objetivos, busca global, notificações, resumos, atendimento multicanal, Publicações, CRM, copiloto, integrações e gamificação discreta.

## Decisões de 2026-10-23

- **Uma matriz de permissões só**: o MVP usa a matriz completa aprovada e esconde recursos que ainda não existem; o seed é gerado dela.

## Links

- [Visão](vision.md)
- [Papéis e permissões](roles-permissions.md)
- [Caixa de atendimento](inbox-whatsapp.md)
- [Planos, hospedagem e cobrança](plans.md)
- [ADR-109 — Automação, Observer e agentes](../decisions/adr-109-automation-ai.md)
- [Plano](../plan/plan.md)
