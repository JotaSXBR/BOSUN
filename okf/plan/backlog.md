---
type: Backlog
title: Backlog
description: Checklist do MVP e ondas futuras.
tags: [bosun, backlog, mvp, roadmap]
status: draft
generated: { by: reference_agent/deepseek-v4.1-flash-free, at: 2026-10-21T00:00:00Z }
---

# Backlog

## MVP

- [ ] Espaço multiusuário com papéis e permissões granulares.
- [ ] Onboarding: contexto, WhatsApp, Google e convite (Google/convite puláveis).
- [ ] Contatos com sync Google por etiqueta **BOSUN**.
- [ ] Caixa de atendimento com múltiplas sessões, busca e drawer lateral.
- [ ] Filtro **Pendentes** visível e desabilitado até os agentes de IA.
- [ ] Fila FIFO por mensagem sem resposta mais antiga.
- [ ] Atribuição de conversa, status de ticket e histórico.
- [ ] Auth usuário/e-mail + senha; alerta + Resend; sessão em tabela `Session` com revogação e trava de inatividade; chave de recuperação no onboarding.
- [ ] Mídia em RustFS (S3-compatível).
- [ ] Testes unitários, integração e E2E crítico.
- [ ] Auditoria, retenção configurável e controles de LGPD.
- [ ] Infra: Coolify, VPS CIS Level 1, Tailscale e Cloudflare Tunnel.
- [ ] Backup diário e teste de restauração mensal.

## Ondas futuras

| Fase | Módulo | Objetivo | Critério de entrada |
|---|---|---|---|
| 2 | Copiloto interno | Resumos, sugestões, próximos passos e respostas sugeridas | Atendimento e contatos estáveis; spec de prompts e avaliação |
| 2 | Follow-ups e etiquetas | Organizar pendências e segmentar conversas | Tickets e contatos |
| 2 | Métricas de atendimento | Volume, tempo de resposta e resolução | Definição dos indicadores |
| 3 | Tarefas e projetos | Transformar conversas em ações e acompanhar progresso | Modelo de tarefas/projetos e permissões |
| 3 | Agenda e Meu dia | Eventos, prazos e visão diária | Integração de calendário |
| 3 | Documentos e conhecimento | Notas, documentos e base pesquisável | Busca e permissões |
| 3 | Hábitos e objetivos | Recorrências, metas e progresso | Modelo de hábitos/metas |
| 3 | Busca global e notificações | Encontrar tudo e alertar o necessário | Índice e permissões |
| 4 | E-mail | Caixa de e-mail e tickets | Regras de e-mail e LGPD |
| 4 | Instagram Direct | Canal adicional | API/adaptador e compliance |
| 4 | Mensagens do site | Canal adicional | Widget e antiabuso |
| 5 | Agentes de IA | Agentes por módulo com ferramentas e acessos | Modelo de ferramentas, auditoria e aprovação |
| 5 | Colaboração entre organizações | Compartilhamento entre espaços | Modelo de parceria e segurança |
| 5 | Ações externas aprovadas | Executar ações fora da BOSUN | Política de aprovação e rollback |
| 5 | Offline, apps nativos e assinatura | Evolução de plataforma | Requisitos próprios |

## Pendências de definição

- Matriz de permissões final.
- Política de reutilização de senha.
- Provedor de IA do copiloto.
- Provedor da VPS, domínio e destino do backup.
- Expiração de sessão e hash de senha.
- Critérios de aceite detalhados por fase.

## Links

- [Plano](plan.md)
- [Roadmap](../product/roadmap.md)
- [Escopo do MVP](../product/mvp-scope.md)
