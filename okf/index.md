---
okf_version: "0.2"
---

# BOSUN

Sistema operacional pessoal, web-first e multiusuário. O trabalho atual é definir o **produto completo**; o MVP é um recorte com **Onboarding**, **Contatos/Google People API** e **Atendimento por WhatsApp**.

## Comece aqui

- [Perfil OKF BOSUN](okf-profile.md) - Regra de escrita do bundle e do validador.
- [Método de trabalho](method.md) - Como o projeto é conduzido, como decisões são registradas e como retomar.
- [Handoff para produto completo](memory/handoff.md) - Estado após as rodadas 1 a 8; aprovações e reconciliação pendentes.
- [Estado atual](memory/current-state.md) - O que está decidido, aberto e qual é o próximo passo.
- [Produto](product/index.md) - Mapa do produto completo, agrupado por domínio.
- [Decisões](decisions/index.md) - ADRs por domínio de leitura.

## Trilhas de leitura

- **Produto completo:** [Visão](product/vision.md) → [Ambiente e workspaces](product/product-model.md) → [Papéis e permissões](product/roles-permissions.md) → [Conteúdo](product/content-model.md) → [Trabalho](product/tasks-projects.md) → [Tempo](product/calendar.md) → [Social e atendimento](product/social.md) → [Publicações](product/publications.md) → [Atendimento](product/service.md) → [Automação e agentes](product/automations.md) → [Inteligência](product/copilot-ai.md) → [Planos](product/plans.md) → [Mapa de capacidades](product/roadmap.md) → [Critérios de sucesso](product/success-criteria.md) → [Anti-goals](product/anti-goals.md).
- **MVP:** [Escopo](product/mvp-scope.md) → [Onboarding](product/onboarding.md) → [Contatos/Google](product/contacts-google.md) → [Caixa/WhatsApp](product/inbox-whatsapp.md) → [Plano](plan/plan.md).
- **Decisões:** [Índice temático](decisions/index.md) → ADR da área. A numeração é cronológica; a ordem do índice é de leitura.

## Áreas

- [Produto](product/index.md) - Visão, escopo, onboarding, contatos, atendimento, publicações, LGPD e roadmap.
- [Tecnologia](tech/index.md) - Arquitetura, stack, dados, auth, integrações, mídia, testes e deploy.
- [Decisões](decisions/index.md) - ADRs de produto, arquitetura, segurança e operações.
- [Design](design/index.md) - Princípios, telas e wireframes.
- [Plano e backlog](plan/index.md) - Execução em fases e checklist do MVP.
- [Memória](memory/index.md) - Estado, decisões históricas, pesquisa e log da sessão.

## Histórico

- [Log de atualizações](log.md) - Registro cronológico das mudanças do bundle.

## Regras de leitura

- Carregue apenas o documento necessário para a tarefa.
- Se precisar de contexto amplo, leia `memory/handoff.md`, `memory/current-state.md` e `product/index.md`.
- `plan/plan.md` é o plano do MVP e **não deve ser executado** antes da definição do produto completo.
- `archive/legacy-2026-10-21/` preserva o prompt mestre e o histórico; use como fonte da visão original, não como estado atual.
- O termo **Agente** é reservado para agentes de IA. O papel humano é **Membro**; Atendente é função.
