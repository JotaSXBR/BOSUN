---
type: Role Matrix
title: Papéis, permissões e times
description: Quatro presets, exceções por membro, times por módulo, visibilidade híbrida e matriz do produto completo.
tags: [bosun, rbac, roles, permissions, teams, visibility]
status: stable
generated: { by: reference_agent/deepseek-v4.1-flash-free, at: 2026-10-22T00:00:00Z }
---

# Papéis, permissões e times

> **Aprovação:** a matriz do produto completo foi aprovada em **2026-10-22**, incluindo as sete linhas de Publicações/campanhas. A matriz fina do MVP será reconciliada como recorte.

## Papéis humanos

O produto completo tem quatro presets:

- **Admin** — configura o workspace, canais, membros, permissões, integrações e agentes de IA.
- **Manager** — acompanha operação, equipes, relatórios, auditoria e configurações.
- **Membro** — executa o trabalho nos módulos do seu time; atende, cria, edita e conclui conforme o preset.
- **Viewer** — somente leitura.

> **Atendente** deixa de ser papel e passa a descrever a **função** de quem atende. **Agente** continua reservado para os agentes de IA. A decisão está no ADR-102, que atualiza o nome do papel do ADR-102.

**Agentes de IA não são papéis humanos.** O **Observer** é um agente de sugestão, sem ações concretas. Os **agentes de execução** são identidades de serviço configuradas pelo Admin, com escopo explícito, e **não herdam** as permissões de quem os criou. A decisão está no ADR-109.

## Visibilidade híbrida

- **Projetos, CRM e Publicações** são visíveis ao **time** do membro; Manager e Admin veem tudo.
- **Base de Conhecimento** é aberta ao workspace; o **calendário do workspace** é compartilhado e o **calendário pessoal** é privado do dono.
- **Documentos** têm biblioteca compartilhada do workspace e biblioteca pessoal.
- **Itens pessoais, hábitos e calendário pessoal** são privados do dono; nem Admin/Manager veem.
- **Viewer** vê o que o time vê, sem editar.

## Times por módulo

- Um membro pode estar no time de **atendimento**, **vendas**, **projetos** e **publicações**, com composições diferentes.
- O time define visibilidade, filas e atribuição; no caso de Publicações, também a propriedade do post e da campanha.
- Manager e Admin podem ver todos os times.
- Times não criam papéis; continuam valendo os quatro presets.

## Exceções por membro

- O Admin ajusta o preset de cada papel.
- O Admin também pode **liberar ou negar ações para um membro específico**.
- A exceção é explícita, auditada e não altera o preset dos demais.
- O Admin não cria papéis novos.

## Matriz do produto completo

Legenda: **do time** = o membro vê e age sobre o que pertence ao seu time ou foi compartilhado com ele. **Tudo** inclui criar, editar, excluir, exportar e configurar quando aplicável. A matriz é o **preset padrão**, editável pelo Admin.

| Recurso | Admin | Manager | Membro | Viewer |
|---|---|---|---|---|
| Workspace e configurações | tudo | ver, editar | ver | ver |
| Membros e convites | tudo | ver, convidar, remover, alterar papel (exceto Admin) | ver | ver |
| Papéis e permissões | tudo | ver | — | — |
| Times | tudo | tudo | ver o próprio time | ver |
| Auditoria | ver, exportar | ver | — | — |
| Contatos | tudo | tudo | ver, criar, editar, sincronizar (do time) | ver (do time) |
| Empresas | tudo | tudo | ver, criar, editar (do time) | ver (do time) |
| Negócios | tudo | tudo | ver, criar, editar (do time) | ver (do time) |
| Conversas e mensagens | tudo | ver, responder, atribuir, encerrar, excluir | ver, responder, assumir, encerrar (do time) | ver (do time) |
| Canais e sessões | tudo | ver, conectar, desconectar | ver, conectar, desconectar (do time) | ver |
| Social (comentários, stories, menções e DMs) | tudo | ver, responder, assumir, promover, publicar automação | ver, responder, assumir (do time) | ver (do time) |
| Publicações (posts e calendário) | tudo | tudo | ver, criar, editar, publicar se aprovação desligada (do time) | ver (do time) |
| Campanhas de publicação | tudo | tudo | ver, criar, editar (do time) | ver (do time) |
| Aprovação de publicação | aprovar, rejeitar | aprovar, rejeitar | — | — |
| Conexões de publicação | tudo | ver, conectar, desconectar | ver | ver |
| Fila e reciclagem | tudo | tudo | ver | ver |
| Analytics de publicação | ver, exportar | ver, exportar | ver (do time) | ver (do time) |
| Post → automação/checkout | tudo | criar, editar, publicar | — | — |
| Automações e fluxos | tudo | ver, criar, editar, publicar, pausar, arquivar | — | — |
| Dashboard social | ver, exportar | ver, exportar | ver (do time) | ver (do time) |
| Caixa de e-mail (IMAP) | tudo | ver, conectar, desconectar, responder | ver, responder (do time) | ver (do time) |
| Tickets e status | tudo | ver, editar tickets | ver, editar tickets (do time) | ver (do time) |
| Tarefas | tudo | tudo | ver, criar, editar, concluir, atribuir (do time) | ver (do time) |
| Projetos | tudo | tudo | ver, criar, editar (do time) | ver (do time) |
| Documentos | tudo | tudo | ver, criar, editar, excluir (os seus/do time), enviar no atendimento | ver (do time) |
| Itens compartilhados | tudo | tudo | ver, criar, editar (do time) | ver (do time) |
| Itens pessoais | — | — | tudo do próprio | tudo do próprio |
| Base de Conhecimento | tudo, publicar, aprovar | ver, criar, editar, publicar, aprovar | ver, criar, editar, revisar se designado | ver publicados |
| Calendário do workspace | tudo | tudo | ver, criar, editar (do workspace) | ver |
| Calendário pessoal | — | — | tudo do próprio | tudo do próprio |
| Objetivos e OKR | tudo | tudo | ver, criar, editar, check-in (pessoais/do time) | ver (do time) |
| Hábitos | — | — | tudo do próprio | tudo do próprio |
| Relatórios e métricas | ver, exportar | ver, exportar | ver (do time) | ver (do time) |
| Integrações | tudo | ver, conectar, desconectar | ver | ver |
| Copiloto | usar | usar | usar | usar (somente leitura) |
| Observer | ver sugestões, aplicar | ver sugestões | — | — |
| Agentes de IA (execução) | tudo (configurar, habilitar, auditar) | ver | — | — |

**Publicações:** o post e a campanha pertencem a um **time de Publicações**; o Membro vê e edita os do seu time; Admin/Manager veem tudo. O Membro publica quando a aprovação está desligada; com aprovação ligada, submete. O Admin/Manager aprova e pode aprovar o próprio post; o Membro não aprova. Editar texto/mídia/destino/horário volta a aprovação.

## Regras de ouro

- **Privacidade pessoal**: Admin e Manager não veem itens pessoais, hábitos nem calendário pessoal de outro membro.
- **Exportação**: Admin e Manager exportam dados do workspace; o dono exporta os próprios dados pessoais.
- **Auditoria**: Admin vê e exporta; Manager vê. As ações sensíveis são registradas.
- **Desligamento**: projetos, tarefas e CRM passam para o Manager; dados pessoais vão com o membro.
- **Exceções**: toda exceção por membro é auditada.
- **Consultas multi-tenant** sempre filtram `workspace_id`; a autorização é sempre no servidor.

## MVP

O MVP continua com quatro presets e a mesma matriz operacional. O recorte do MVP usa apenas **Fundação, Contatos, Conversas e Atendimento**; as linhas de **Publicações**, **campanhas**, **Social**, **automações**, **agentes** e **CRM** ficam fora do MVP. A matriz fina do MVP precisa ser reconciliada com esta matriz antes do plano. Os ADRs anteriores ao ADR-102 ainda usam **Atendente**; onde aparecer, leia **Membro**.

A matriz agora inclui **Social**, **Publicações**, **campanhas de publicação**, **automações** e **dashboard social**. Ela foi **aprovada em 2026-10-22**; a matriz fina do MVP será reconciliada como recorte antes do plano.

## Em aberto

- Regra de exceção por membro: allowlist ou denylist?
- Times: criação, entrada e saída; quem gerencia cada time; composição do time de Publicações.
- Visibilidade de negócios sensíveis dentro do time de vendas.
- Convidados externos, somente na fase futura.
- Limites de assentos.
- Quem configura e habilita agentes, quem vê sugestões do Observer e qual é a autonomia por agente.
- Quem publica automação quando não há Manager no workspace.
- Visibilidade de conversas social promovidas entre times diferentes.
- Quem publica em Publicações quando a aprovação está desligada.
- Múltiplas contas por rede no mesmo workspace.
- Campos e status da campanha; post em mais de uma campanha.

## Links

- [Integrações externas](integrations.md)
- [Publicações e planejamento editorial](publications.md)
- [ADR-102 — Papéis e permissões do produto completo](../decisions/adr-102-identity-access.md)
- [ADR-105 — Calendário externo por workspace](../decisions/adr-105-work-time.md)
- [ADR-107 — E-mail IMAP e cota de armazenamento](../decisions/adr-107-service-social.md)
- [ADR-102 — Permissões](../decisions/adr-102-identity-access.md)
- [ADR-102 — Atendente e Agente de IA](../decisions/adr-102-identity-access.md)
- [ADR-109 — Automação, Observer e agentes](../decisions/adr-109-automation-ai.md)
- [ADR-108 — Área de Publicações](../decisions/adr-108-publications.md)
- [Planos, hospedagem e cobrança](plans.md)
- [Ambiente, workspaces e áreas](product-model.md)
