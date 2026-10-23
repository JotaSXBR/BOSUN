---
type: Execution Plan
title: Plano de execução
description: Fases, pré-condições, aceite e riscos do MVP.
tags: [bosun, plan, phases, execution]
status: draft
generated: { by: reference_agent/deepseek-v4.1-flash-free, at: 2026-10-21T00:00:00Z }
---

# Plano de execução

> **Status: pausado.** Este plano cobre apenas o MVP. A definição do produto completo precede a execução; não execute esta fase até o design do produto completo ser aprovado.

## Pré-condições

- [ ] Design do produto completo aprovado.
- [ ] Plano do MVP revisado após o design do produto completo.
- [x] Stack aprovada.
- [x] Modelo de dados aprovado como base.
- [x] Fluxo de conta/senha definido.
- [x] Backup e retenção definidos.
- [x] Wireframes aprovados com ajustes menores.
- [x] Matriz de permissões aprovada em 2026-10-22.
- [ ] Plano aprovado.
- [x] Política de reutilização de senha definida: bloquear apenas a senha atual (ADR-102).

## Modelo de execução

- Uma pessoa + IA.
- Superpowers: brainstorming → plano → execução.
- TDD antes de implementação de comportamento.
- `systematic-debugging` antes de corrigir bugs.
- `verification-before-completion` antes de declarar pronto.
- Commits pequenos e verificáveis.
- Sem prazo fixo; marcos e aceite por fase.

## Fase 0 — Fundação

**Objetivo:** repositório, ambiente e infraestrutura mínima.

- [ ] Criar repositório e estrutura do projeto.
- [ ] Docker Compose local: app, PostgreSQL, WAHA e RustFS.
- [ ] Configurar Coolify, VPS, Tailscale e Cloudflare Tunnel.
- [ ] Configurar variáveis, segredos e backups iniciais.
- [ ] Pipeline mínimo: lint, tipos, Vitest e Playwright.

**Aceite:** app sobe localmente e em staging, com banco e WAHA acessíveis.

## Fase 1 — Contas, espaço e permissões

**Objetivo:** multiusuário com RBAC e convites.

- [ ] Cadastro/login usuário/e-mail + senha.
- [ ] Criação do espaço; primeiro usuário Admin.
- [ ] Convite por link com papel e validade.
- [ ] Quatro presets e permissões granulares.
- [ ] Guardas de autorização por recurso/ação.
- [ ] Solicitação de troca de senha via alerta interno + Resend.
- [ ] Rejeitar nova senha igual à atual; sem histórico no MVP.
- [ ] Sessão em tabela `Session`, com revogação por dispositivo, expiração absoluta e reautenticação para ação sensível.
- [ ] Chave de recuperação exibida no onboarding, com hash e uso único.
- [ ] Auditoria de ações sensíveis.

**Aceite:** Admin cria espaço, convida outra pessoa e cada papel respeita a matriz.

## Fase 2 — Onboarding e WhatsApp

**Objetivo:** wizard que deixa o espaço pronto para atender.

- [ ] Wizard de contexto.
- [ ] Criação de sessão WAHA e pareamento por QR/código.
- [ ] Status da sessão e reconexão.
- [ ] Múltiplas sessões por espaço.
- [ ] Etapas de Google e convite, puláveis.
- [ ] Link de convite ao final.

**Aceite:** uma pessoa conclui o wizard e vê a caixa com a sessão conectada.

## Fase 3 — Contatos e Google People API

**Objetivo:** contatos sincronizados por etiqueta BOSUN.

- [ ] CRUD de contatos e métodos de contato.
- [ ] Identidade por telefone E.164.
- [ ] OAuth Google com escopo `contacts`.
- [ ] Etiqueta BOSUN via `contactGroups`.
- [ ] Sync completo inicial e incremental com `syncToken`.
- [ ] Envio de alterações com `etag`.
- [ ] Conflito de identidade e etiqueta removida: perguntar.
- [ ] Exportação e exclusão.

**Aceite:** contato com etiqueta BOSUN é importado, editado na BOSUN e refletido no Google; contato sem etiqueta é ignorado.

## Fase 4 — Caixa de atendimento

**Objetivo:** receber, responder e organizar conversas.

- [ ] Webhook WAHA idempotente.
- [ ] Normalização de telefone e vínculo com contato.
- [ ] Conversas, mensagens e anexos em RustFS.
- [ ] Múltiplas sessões e filtros, incluindo **Pendentes** desabilitado.
- [ ] Busca na lista e drawer lateral de contato/ticket.
- [ ] Fila FIFO por mensagem sem resposta mais antiga.
- [ ] Assumir/atribuir conversa.
- [ ] Status de ticket padrão e personalizáveis.
- [ ] Notas internas e follow-ups básicos.

**Aceite:** mensagem inbound aparece na fila; resposta chega ao WhatsApp; status e responsável são registrados.

## Fase 5 — Configurações, auditoria e relatórios

**Objetivo:** controlar o espaço e enxergar a operação.

- [ ] Configurações do espaço.
- [ ] Membros, convites e permissões em tabela editável.
- [ ] Sessões WhatsApp e Google.
- [ ] Status de ticket.
- [ ] Retenção por tipo de dado.
- [ ] Auditoria filtrável.
- [ ] Relatórios mínimos: volume, primeira resposta, resolvidas, fila.

**Aceite:** Admin ajusta o espaço e vê auditoria; Manager vê relatórios conforme permissão.

## Fase 6 — Endurecimento e aceite

**Objetivo:** segurança, LGPD, backup e validação ponta a ponta.

- [ ] Unitários, integração e E2E dos fluxos críticos.
- [ ] Rate limiting, CSRF e validação de webhook.
- [ ] Criptografia de tokens e segredos.
- [ ] Backup do PostgreSQL, WAHA e RustFS; teste de restauração.
- [ ] Expurgo por retenção e exportação.
- [ ] Acessibilidade e responsividade.
- [ ] Observabilidade e alertas.
- [ ] Roteiro de aceite do MVP.

**Aceite:** fluxo completo + Google + permissões, com dados de teste e restauração validada.

## Riscos

- Integração Auth.js JWT + RBAC + revogação.
- Verificação OAuth do Google pode atrasar a Fase 3.
- WAHA/GOWS pode mudar ou bloquear números.
- RustFS é jovem; backup dos objetos precisa ser validado.
- Multiusuário + RBAC + convites aumenta a Fase 1.
- Uma pessoa + IA exige testes e documentação contínuos.

## Definição de pronto do MVP

- Fluxo completo de onboarding, contato e atendimento.
- Google People API funcionando.
- Permissões granulares aplicadas.
- Ao menos dois usuários no espaço.
- Backup e restauração validados.
- Testes críticos verdes.

## Links

- [Backlog](backlog.md)
- [Escopo do MVP](../product/mvp-scope.md)
- [Papéis e permissões](../product/roles-permissions.md)
- [Estado atual](../memory/current-state.md)
