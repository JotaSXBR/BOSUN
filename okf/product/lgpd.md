---
type: Compliance Spec
title: LGPD e privacidade
description: Papéis operadora/controlador, inventário, base legal, direitos, retenção e suboperadores.
tags: [bosun, lgpd, privacy, compliance, data-protection]
status: stable
generated: { by: reference_agent/deepseek-v4.1-flash-free, at: 2026-10-21T00:00:00Z }
---

# LGPD e privacidade

A BOSUN trata dados de contatos externos e mensagens. A conformidade final depende de **revisão jurídica**; o produto fornece os controles, não presume conformidade automática.

## Papéis

- **BOSUN:** operadora.
- **Espaço de trabalho:** controlador.
- O contrato e as cláusulas precisam ser validados juridicamente.

## Inventário mínimo

- Nome, telefone, e-mail, foto e organização do contato.
- Mensagens e anexos.
- Metadados de atendimento, autoria, status e auditoria.

## Finalidade e base legal

- Finalidade: atendimento e gestão do relacionamento, registrada por espaço.
- Base legal: definida pelo controlador conforme o caso — execução de contrato, legítimo interesse ou consentimento.
- O onboarding registra a base legal aplicável ao uso dos dados de contato e atendimento.
- O produto não usa dados de contatos ou mensagens para treinamento sem consentimento explícito.

## Direitos do titular

- Acesso.
- Correção.
- Exclusão.
- Portabilidade.
- Oposição.
- Canal de solicitação dentro do espaço.

## Minimização e retenção

- Coletar apenas o necessário para o atendimento.
- Retenção configurável por espaço e por tipo de dado: mensagens, contatos, anexos e auditoria.
- O padrão é definido no onboarding.
- Antes da exclusão automática, o espaço pode exportar os dados.
- Jobs de expurgo, avisos e auditoria de exclusão fazem parte do MVP.

## Segurança

- Criptografia em trânsito e em repouso.
- Acesso por papel e auditoria.
- Rate limiting, CSRF e validação de webhook.
- Segredos fora do repositório.
- Procedimento de resposta a incidentes precisa ser documentado antes do lançamento.

## Suboperadores e transferência internacional

- WAHA é software self-hosted; o provedor da VPS e o armazenamento entram na cadeia.
- Google People API.
- Cloudflare.
- Resend.
- RustFS é self-hosted.
- Verificar Google, Cloudflare e Resend quanto à transferência internacional e registrar a base legal.
- Contratos/DPAs quando aplicável.

## Critérios de aceite

1. O onboarding registra finalidade e base legal.
2. O espaço exporta contatos e conversas.
3. O espaço exclui dados conforme a retenção.
4. A conexão Google pode ser revogada sem apagar dados locais.
5. Ações sensíveis são auditadas.
6. A UI informa a origem do dado e como excluir/exportar.

## Links

- [ADR-112](../decisions/adr-112-lgpd-retention.md)
- [ADR-112](../decisions/adr-112-lgpd-retention.md)
- [Contatos e Google](contacts-google.md)
