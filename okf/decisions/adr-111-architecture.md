---
type: ADR
title: ADR-111 — Arquitetura, operação e privacidade
description: Stack, uma VPS por cliente, backup testado, criptografia, auditoria e papel de operadora na LGPD.
domain: arquitetura
tags: [bosun, adr, arquitetura, deploy, segurança, lgpd]
status: draft
generated:
  by: claude-opus/5.5
  at: 2026-10-23T00:00:00Z
---

# ADR-111 — Arquitetura, operação e privacidade

**Status:** vigente, em draft. Fonte única do domínio. Consolida o antigo ADR-112 (LGPD).

## Decisões

1. Next.js full-stack + **TypeScript 7** + PostgreSQL + **Prisma 7** + **Better Auth** + Tailwind/shadcn + pg-boss; mídia em **RustFS** (compatível com S3). Dois processos da mesma imagem: `web` e `worker`. Lint com **Oxlint**; limites de qualidade no [Padrão de qualidade](../tech/quality-gate.md). Decidido em 2026-10-23 ([revisão](../tech/stack-review.md)).
2. Uma VPS por cliente com **Coolify**, Cloudflare Tunnel para entrada e Tailscale para SSH. Containers: BOSUN, PostgreSQL, WAHA e RustFS. O hardening CIS Level 1 é um checklist aplicado uma vez.
3. Uma imagem Docker por versão, gerada no CI com tag fixa. A BOSUN entra no Coolify como **um Docker Compose** (`web`, `worker`, `postgres`, `waha`, `rustfs`). **Beta e stable no mesmo servidor, por agora**, como dois recursos com domínios diferentes, bancos separados e **contas de integração separadas** (outro número de WhatsApp, contas de teste da Meta e do Google). Promover = mudar a tag da imagem no stable. Migrations Prisma no modelo expandir/contrair. Sem heartbeat no piloto.
4a. **Configuração mínima no Coolify:** só variáveis geradas pelo próprio Coolify (`SERVICE_URL_*`, `SERVICE_PASSWORD_*`, `SERVICE_HEX_*`): domínio, senha do banco, chave do WAHA, credenciais do RustFS, segredo de sessão e **chave mestra**. Credenciais de integração (Meta, Google, YouTube, Kiwify, VAPID) são configuradas na UI da BOSUN, pelo Admin, e guardadas cifradas no banco. A chave mestra tem backup próprio, separado do backup do banco.
4. Backup diário criptografado de Postgres, volumes do WAHA e RustFS para um storage externo, retido por 30 dias. Restauração testada antes do go-live e depois todo mês.
5. Cota padrão de **50 GB**, **100 MB por arquivo** e **1 GB por vídeo**, com alertas em 80% e 100%. Nada é apagado sozinho.
6. **Senha com Argon2id. Disco da VPS criptografado. Tokens e segredos de integração** (Meta, Google, YouTube, Kiwify, WAHA) **cifrados com AES-256-GCM**, com a chave numa variável de ambiente fora do banco. Decidido em 2026-10-23.
7. Toda consulta filtra `workspace_id`; webhooks e jobs são idempotentes. **Toda ação passa pela camada de serviço**, com autorização e auditoria, para que a UI, os jobs e um futuro servidor MCP (Claude Code como copiloto externo) usem o mesmo caminho.
8. **Auditoria** de: login, mudança de papel, convite e remoção, conexão de canal ou integração, ativação de fluxo, mesclagem, exportação, exclusão e troca de senha.
9. Mudança estrutural no modelo de dados exige atualizar este ADR e o [modelo de dados](../tech/data-model.md). Em 2026-10-23: `ExternalPost` representa todo post publicado numa rede (nativo ou da BOSUN); fluxos, links rastreáveis, vendas e o painel apontam para ele, para que a automação funcione antes da fatia de Publicações.
10. Testes unitários, de integração e E2E dos fluxos críticos: auth, autorização, webhooks (Meta, WAHA, Kiwify), sync Google, roteamento do ticket, fluxo e publicação.
11. **LGPD:** a BOSUN é **operadora**; o workspace é **controlador**. O piloto entrega exportação e exclusão de um contato com todos os dados dele, retenção fixa documentada e a lista de suboperadores ([LGPD](../product/lgpd.md)).
12. Conteúdo de mensagens é dado não confiável.
13. **Risco de calendário:** o App Review da Meta e a verificação do app no Google Cloud (escopos sensíveis de Contatos, Agenda e upload no YouTube) levam semanas e precisam começar antes do código.

## Relations

- details: [Arquitetura](../tech/architecture.md)
- details: [Modelo de dados](../tech/data-model.md)
- details: [LGPD](../product/lgpd.md)
- details: [Estratégia de testes](../tech/test-strategy.md)
