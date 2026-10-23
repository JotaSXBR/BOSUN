---
type: ADR
title: ADR-111 — Arquitetura e operação
description: Stack, infraestrutura, deploy por instalação, backup, armazenamento, testes e modelo de dados.
tags: [bosun, adr, architecture, stack, deploy, backup, storage]
status: draft
generated: { by: agent/claude-opus-5-5, at: 2026-10-23T00:00:00Z }
---

# ADR-111 — Arquitetura e operação

**Status:** vigente; consolidado em 2026-10-23 e sujeito à aprovação do design completo. Este ADR é a única fonte de decisão do domínio: decisão nova **edita este arquivo**.

## Stack

1. Next.js full-stack + TypeScript + PostgreSQL + Prisma + Auth.js + Tailwind/shadcn + pg-boss; mídia em **RustFS** (S3-compatível).

## Infraestrutura e deploy

2. VPS por cliente com **CIS Level 1**, **Coolify**, Tailscale para SSH e Cloudflare Tunnel para entrada. Containers: BOSUN, PostgreSQL, WAHA, RustFS.
3. **Imagem Docker versionada** com canais estável e beta; implantação pelo Coolify por cliente.
4. Migrations Prisma em **expandir/contrair**: nenhuma versão quebra a anterior.
5. Heartbeat opt-in (versão, saúde, último backup) para o operador; nenhum dado de cliente sai da VPS.
6. Operação gerenciada: hospedagem, backup, atualização e monitoramento fazem parte da assinatura. Crescimento de armazenamento = upgrade de VPS.

## Backup e armazenamento

7. Backup diário de Postgres, volumes do WAHA e RustFS, criptografado para storage externo; retenção de 30 dias; restauração testada todo mês.
8. Cota padrão **50 GB** por instalação, configurável; **100 MB por arquivo**; **1 GB para vídeo** de Publicações; alertas em 80% e 100%, nunca apaga sozinho.

## Dados e qualidade

9. Toda consulta filtra `workspace_id`; webhooks e jobs são idempotentes; ação sensível é auditada.
10. Mudança estrutural no modelo de dados exige atualizar este ADR e `tech/data-model.md`.
11. Testes unitários, de integração e E2E dos fluxos críticos: auth, RBAC, webhooks, sync Google, atendimento e publicação.
12. Docs técnicos na ordem do golden path: broker de OAuth + Meta, motor de automação, e-mail IMAP, sync de calendário, agentes, busca, push (Web Push/VAPID).

## Em aberto

- **Hash de senha e criptografia em repouso.** Proposta: Argon2id; disco criptografado na VPS; AES-256-GCM em tokens e segredos, com chave fora do banco. O usuário pediu explicação antes de decidir.

## Origem

Consolida os antigos 007, 010, 013, 014, 017, 020, 042, arquivados em `archive/adrs-2026-10-23/`.
