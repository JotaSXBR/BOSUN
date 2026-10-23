---
type: Compliance Spec
title: LGPD
description: BOSUN operadora e workspace controlador; exportação e exclusão de contato, retenção fixa e suboperadores do piloto.
tags: [bosun, lgpd, privacidade]
status: draft
generated:
  by: claude-opus/5.5
  at: 2026-10-23T00:00:00Z
---

# LGPD

- A BOSUN é **operadora**; o workspace é **controlador**. O produto oferece controles; não presume conformidade. Revisão jurídica antes do primeiro cliente pagante.
- **Direitos do titular:** o Admin exporta (JSON + arquivos) e exclui um contato com tudo dele: identidades, mensagens, tickets, negócios, vendas e mídia. A exclusão é auditada sem guardar o conteúdo apagado.
- **Coleta:** o chat do site mostra finalidade e base legal; dados declarados entram não verificados.
- **Retenção fixa no piloto:** mensagens e tickets enquanto o workspace existir; logs de execução de fluxo por 90 dias; backups por 30 dias. Mudar exige decisão no ADR.
- **Minimização:** só os campos descritos nos conceitos; nada de dados sensíveis em campos livres por design.
- **Suboperadores do piloto:** Meta (Instagram, Facebook), WhatsApp via WAHA (sem terceiro), Google (Contatos, Agenda, YouTube), Kiwify, Cloudflare e o provedor da VPS. Verificar a transferência internacional de cada um.
- Conteúdo de mensagens é dado não confiável.

## Relations

- governed_by: [ADR-111 — Arquitetura, operação e privacidade](../decisions/adr-111-architecture.md)
- governed_by: [ADR-106 — Contatos, CRM e venda](../decisions/adr-106-contacts.md)
