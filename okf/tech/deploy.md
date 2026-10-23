---
type: Operations Guide
title: Deploy e operação
description: Coolify, VPS CIS, Tailscale, Cloudflare Tunnel, containers, backup e rollback.
tags: [bosun, deploy, coolify, vps, operations]
status: stable
generated: { by: reference_agent/deepseek-v4.1-flash-free, at: 2026-10-21T00:00:00Z }
sources:
  - resource: https://coolify.io/docs/
    title: Coolify documentation
  - resource: https://tailscale.com/kb/
    title: Tailscale documentation
  - resource: https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/
    title: Cloudflare Tunnel documentation
  - resource: https://www.cisecurity.org/cis-benchmarks
    title: CIS Benchmarks
---

# Deploy e operação

## Topologia

> **Nota 2026-10-22 — ADR-101:** uma VPS por cliente, com hospedagem, backup e licença gerenciados. Cada instalação tem banco, arquivos e chaves próprios; não há banco compartilhado entre clientes. O provisionamento e a atualização por instância precisam de automação e runbook.

- VPS com **CIS Level 1** aplicado.
- **Coolify:latest** para deploy, variáveis, volumes e containers.
- **Tailscale** para SSH privado; SSH não exposto publicamente.
- **Cloudflare Tunnel** para entrada pública sem abrir portas no host.
- TLS terminado no Cloudflare/Tunnel.

## Containers

- **BOSUN** (Next.js standalone).
- **PostgreSQL**.
- **WAHA** (GOWS).
- **RustFS** (S3).
- Jobs pg-boss rodam no processo da aplicação ou em worker separado, conforme carga.

## Volumes

- PostgreSQL data.
- WAHA sessions.
- RustFS data.
- Uploads temporários, se necessários.

## Variáveis e segredos

- Segredos ficam nas variáveis do Coolify, nunca no repositório.
- `DATABASE_URL`
- `AUTH_SECRET`
- `WAHA_BASE_URL`, `WAHA_API_KEY`
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- `RESEND_API_KEY`
- `S3_ENDPOINT`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`, `S3_BUCKET`
- `APP_URL`
- Chaves de IA do cliente (**BYOK**) por instalação, no cofre.
- Rotação de segredos documentada.

## Deploy

1. Build da imagem.
2. Rodar migrations do Prisma.
3. Subir containers.
4. Health check da app, banco, WAHA e RustFS.
5. Smoke test: login, webhook e envio.
6. Rollback para a imagem anterior se o health check falhar.

## Banco

- Migrations versionadas.
- Backup antes de migrations destrutivas.
- Nunca rodar migration sem backup recente.
- Conexão com pool adequado ao VPS.

## Backup

- **Diário**: PostgreSQL, volumes WAHA e objetos RustFS.
- Retenção: **30 dias**.
- Teste de restauração: **mensal**.
- Destino externo ao VPS.
- Criptografia do backup.
- Runbook de restauração documentado.

## Observabilidade

- Logs estruturados.
- Métricas de fila, webhooks, erros e latência.
- Alertas para app down, banco down, WAHA desconectado e falha de backup.
- Painel simples de saúde.

## Segurança operacional

- Firewall: apenas portas necessárias.
- SSH via Tailscale.
- Atualizações de segurança do host.
- Containers sem root quando possível.
- Rate limiting no app.
- Validação de webhook.
- Backup e restore testados.

## Pendências

- Provedor da VPS.
- Domínio público.
- Destino do backup.
- Worker separado para jobs ou não.
- Política de retenção de logs.
- Automação de provisionamento por cliente (VPS, DNS, TLS, banco, backup).
- Política de upgrade/downgrade de VPS e janela de manutenção.
- Runbook de restauração por instalação.

## Decisões de 2026-10-23

- **Imagem Docker versionada** com canais estável e beta; implantação pelo Coolify por cliente.
- Migrations Prisma em **expandir/contrair**.
- Heartbeat opt-in (versão, saúde, último backup); nenhum dado de cliente sai da VPS.
- Backup diário criptografado para storage externo, restauração testada todo mês.
- **Cota padrão 50 GB** por instalação, configurável; **100 MB por arquivo** e **1 GB para vídeo** de Publicações; alertas em 80% e 100%; OCR depois.

## Links

- [ADR-111](../decisions/adr-111-architecture-operations.md)
- [ADR-111](../decisions/adr-111-architecture-operations.md)
- [ADR-101 — Instalação dedicada por cliente](../decisions/adr-101-product-structure.md)
- [Planos, hospedagem e cobrança](../product/plans.md)
- [Stack](stack.md)
- [Mídia/RustFS](media-rustfs.md)
