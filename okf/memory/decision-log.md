---
type: Decision Log
title: Log de decisões D1–D59
description: Histórico compacto das decisões da sessão de planejamento.
tags: [bosun, memory, decisions, history]
status: stable
generated: { by: reference_agent/deepseek-v4.1-flash-free, at: 2026-10-21T00:00:00Z }
---

# Log de decisões

> Histórico. A fonte de verdade atual é o bundle OKF. Decisões superadas ficam registradas para contexto.

| ID | Decisão | Status | Referência |
|---|---|---|---|
| D1 | MVP construído de uma vez com Superpowers; módulos futuros só planejados. | Ativa | [Plano](../plan/plan.md) |
| D2 | MVP com três pilares: Atendimento, Contato, Onboarding. | Ativa | [ADR-001](../decisions/adr-101-product-structure.md) |
| D3 | Após onboarding, cair na caixa e responder uma conversa. | Ativa | [Escopo](../product/mvp-scope.md) |
| D4 | WhatsApp Web via WAHA/GOWS, REST + webhooks, adaptador. | Ativa | [ADR-003](../decisions/adr-107-service-social.md) |
| D5 | Onboarding termina com espaço, WhatsApp, Google e LGPD registrados. | Ativa | [Onboarding](../product/onboarding.md) |
| D6 | MVP multiusuário com convites, papéis e auditoria. | Ativa | [ADR-002](../decisions/adr-101-product-structure.md) |
| D7 | Primeiro usuário vira Admin; demais entram por convite. | Ativa | [Papéis](../product/roles-permissions.md) |
| D8 | Permissões granulares; papéis são presets ajustáveis. | Refinada por D56 | [ADR-006](../decisions/adr-102-identity-access.md) |
| D9 | Google em duas vias; campos nome, e-mail, telefone, foto, organização. | Ativa | [ADR-004](../decisions/adr-106-contacts-crm.md) |
| D10 | Stack ainda não escolhida. | Superada | — |
| D11 | Planejar módulos futuros e agentes de IA por módulo. | Ativa | [Roadmap](../product/roadmap.md) |
| D12 | Admin não cria papéis; ajusta presets. | Ativa | [ADR-006](../decisions/adr-102-identity-access.md) |
| D13 | Sync Google automático ao salvar + manual; BOSUN é fonte da verdade. | Ativa | [Contatos](../product/contacts-google.md) |
| D14 | VPS CIS, Coolify, Tailscale, Cloudflare Tunnel. | Ativa | [ADR-007](../decisions/adr-111-architecture-operations.md) |
| D15 | Agentes de IA; MVP sem construtor; fase histórica substituída pelo ADR-049. | Ativa | [ADR-011](../decisions/adr-109-automation-ai.md) |
| D16 | LGPD: BOSUN operadora; workspace controlador (provisório). | Confirmada em D20 | [LGPD](../product/lgpd.md) |
| D17 | Desenvolvimento por uma pessoa + IA; minimizar serviços. | Ativa | [Plano](../plan/plan.md) |
| D18 | Pronto = fluxo completo + Google + permissões; sem prazo. | Ativa | [Plano](../plan/plan.md) |
| D19 | Importar só contatos com etiqueta BOSUN. | Ativa | [ADR-004](../decisions/adr-106-contacts-crm.md) |
| D20 | LGPD confirmada: operadora/controlador. | Ativa | [ADR-008](../decisions/adr-112-lgpd-retention.md) |
| D21 | Base TypeScript/React/Next.js + PostgreSQL. | Complementada | [Stack](../tech/stack.md) |
| D22 | Identidade por E.164; fallback e-mail/resourceName. | Ativa | [Contatos](../product/contacts-google.md) |
| D23 | Múltiplas sessões de WhatsApp por espaço. | Ativa | [Inbox](../product/inbox-whatsapp.md) |
| D24 | Status padrão Novo, Em andamento, Aguardando, Resolvido; personalizáveis. | Ativa | [Inbox](../product/inbox-whatsapp.md) |
| D25 | Auth usuário/e-mail + senha; Resend ao Admin. | Ativa | [ADR-005](../decisions/adr-102-identity-access.md) |
| D26 | Sessões visíveis por padrão; Admin pode restringir; fila FIFO. | Ativa | [ADR-012](../decisions/adr-107-service-social.md) |
| D27 | Stack recomendada ainda não aprovada. | Superada | — |
| D28 | Criar BACKLOG, ARCHITECTURE, DESIGN, DECISIONS e PLAN. | Concluída | [Plano](../plan/plan.md) |
| D29 | Retenção configurável por espaço e tipo de dado. | Ativa | [ADR-009](../decisions/adr-112-lgpd-retention.md) |
| D30 | Admin define e-mail; convite cria usuário/senha; senha temporária força troca. | Ativa | [Auth](../tech/auth.md) |
| D31 | Fila FIFO apenas ordena; atribuição manual. | Ativa | [ADR-012](../decisions/adr-107-service-social.md) |
| D32 | Backup diário; retenção 30 dias; teste mensal. | Ativa | [ADR-013](../decisions/adr-111-architecture-operations.md) |
| D33 | Modelo de dados aprovado como base; mudança estrutural exige ADR. | Ativa | [ADR-014](../decisions/adr-111-architecture-operations.md) |
| D34 | Wireframes criados; aguardam revisão. | Superada por D49 | — |
| D35 | Comparação de stacks; decisão pendente. | Superada | — |
| D36 | Admin define e-mail; convidado cria usuário/senha. | Ativa | [Auth](../tech/auth.md) |
| D37 | STACK e WIREFRAMES adicionados aos docs auxiliares. | Concluída | — |
| D38 | Stack A aprovada: Next.js + Prisma + Auth.js + shadcn + pg-boss. | Ativa | [ADR-010](../decisions/adr-111-architecture-operations.md) |
| D39 | Inbox em três colunas; filtros Fila, Minhas, Aguardando, Resolvidas, Pendentes. | Ativa | [ADR-015](../decisions/adr-107-service-social.md) |
| D40 | Onboarding em quatro etapas. | Ativa | [ADR-016](../decisions/adr-103-onboarding.md) |
| D41 | Storage S3; candidatos RustFS e MinIO AIStor. | Superada por D47 | — |
| D42 | Alerta interno + Resend para troca de senha. | Ativa | [ADR-005](../decisions/adr-102-identity-access.md) |
| D43 | Wireframes atualizados; aguardam revisão. | Superada por D49 | — |
| D44 | Auth.js Credentials sem sessão em banco; opções em aberto. | Superada por D46 | — |
| D45 | Pendentes = fila de agentes de IA; visível e desabilitado. | Ativa | [ADR-019](../decisions/adr-107-service-social.md) |
| D46 | JWT + session_version; expiração curta; revogação por incremento. | Superada em parte pelo ADR-057 | [ADR-018](../decisions/adr-102-identity-access.md) |
| D47 | RustFS escolhido para mídia. | Ativa | [ADR-017](../decisions/adr-111-architecture-operations.md) |
| D48 | Política de reutilização de senha fica para o plano. | Resolvida por D58 | [ADR-021](../decisions/adr-102-identity-access.md) |
| D49 | Wireframes aprovados com ajustes menores. | Ativa | [Wireframes](../design/wireframes/index.md) |
| D50 | Testes unitários + integração + E2E crítico. | Ativa | [ADR-020](../decisions/adr-111-architecture-operations.md) |
| D51 | Painel de contato/ticket em drawer lateral. | Ativa | [ADR-015](../decisions/adr-107-service-social.md) |
| D52 | Matriz de permissões em tabela por recurso/ação. | Ativa | [Papéis](../product/roles-permissions.md) |
| D53 | Pendentes visível e desabilitado no MVP. | Ativa | [ADR-019](../decisions/adr-107-service-social.md) |
| D54 | Google e convite podem ser pulados no onboarding. | Ativa | [ADR-016](../decisions/adr-103-onboarding.md) |
| D55 | Ajustes aprovados: Inbox, Onboarding, Contatos, Configurações, Login/senha. | Ativa | [Wireframes](../design/wireframes/index.md) |
| D56 | Papéis humanos: Admin, Manager, Atendente, Viewer; Agente é IA. | Atualizada pelo ADR-036: Atendente vira função; papel humano passa a ser Membro | [ADR-036](../decisions/adr-102-identity-access.md) |
| D57 | Matriz revisada com quatro papéis; aguarda aprovação final. | Pendente | [Papéis](../product/roles-permissions.md) |
| D58 | Reutilização: rejeitar nova senha igual à atual; sem histórico no MVP. | Ativa | [ADR-021](../decisions/adr-102-identity-access.md) |
| D59 | O produto completo é definido antes da implementação do MVP; implementação pausada. | Ativa | [ADR-023](../decisions/adr-101-product-structure.md) |

## Links

- [Estado atual](current-state.md)
- [Pesquisa](research.md)
- [Sessão](session-log.md)
