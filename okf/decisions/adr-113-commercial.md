---
type: ADR
title: ADR-113 — Comercial
description: Modelo de cobrança, preço, suporte, contrato e pagamento.
tags: [bosun, adr, commercial, pricing, contract]
status: draft
generated: { by: agent/claude-opus-5-5, at: 2026-10-23T00:00:00Z }
---

# ADR-113 — Comercial

**Status:** vigente; consolidado em 2026-10-23 e sujeito à aprovação do design completo. Este ADR é a única fonte de decisão do domínio: decisão nova **edita este arquivo**.

## Modelo

1. **Instalação + mensalidade**, sem planos por funcionalidade, sem cobrança por mensagem ou assento. IA (BYOK) e custos de canais são do cliente.
2. Instalação **R$ 3.000** (50% na aprovação, 50% no go-live, até 15 dias úteis): VPS, domínio/SSL, backup, workspace, canais, um fluxo, um agente em dry-run, até 12 h de configuração.
3. Mensalidade **R$ 500**: licença, hospedagem, backup, atualizações, monitoramento e até 3 h de suporte; excedente R$ 200/h. Upgrade de VPS a custo + 20%.
4. A piloto não paga.

## Suporte e contrato

5. Seg–sex, 9h–18h; crítico em 4 h úteis, não crítico em 1 dia útil; restauração em até 8 h úteis.
6. Mensal sem fidelidade, aviso de 30 dias; exportação final CSV/JSON + arquivos + configurações; exclusão após a exportação; backups expiram em 30 dias.

## Pagamento

7. **Asaas** (Pix, boleto, cartão); reajuste anual por IPCA; inadimplência: suspensão em 10 dias, cancelamento em 30.
8. Fora do foco atual, com prazo: **NFS-e e contrato prontos antes do primeiro cliente pagante**.

## Origem

Consolida os antigos 043, 046, arquivados em `archive/adrs-2026-10-23/`.
