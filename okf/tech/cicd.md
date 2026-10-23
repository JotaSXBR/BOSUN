---
type: Pipeline Design
title: CI/CD
description: Pipeline enxuto no GitHub Actions — checagens do padrão de qualidade, imagem única por commit, beta automático, stable por tag e rollback por tag.
tags: [bosun, cicd, github-actions, coolify, supply-chain]
status: draft
generated:
  by: claude-opus/5.5
  at: 2026-10-23T00:00:00Z
sources:
  - id: gha-hardening
    resource: https://medium.com/@jordanritter/security-hardening-github-workflows-at-scale-d291a33774e1
    title: Security hardening GitHub workflows at scale
  - id: gha-best
    resource: https://devtoollab.com/blog/github-actions-best-practices
    title: GitHub Actions best practices
  - id: gha-attest
    resource: https://docs.github.com/en/actions/how-tos/secure-your-work/use-artifact-attestations/use-artifact-attestations
    title: GitHub artifact attestations
  - id: gha-pricing
    resource: https://github.blog/changelog/2025-12-16-coming-soon-simpler-pricing-and-a-better-experience-for-github-actions/
    title: GitHub Actions pricing update
  - id: docker-gha-cache
    resource: https://docs.docker.com/build/cache/backends/gha/
    title: Docker build cache GitHub Actions backend
  - id: coolify-compose
    resource: https://coolify.io/docs/knowledge-base/docker/compose
    title: Coolify Docker Compose
  - id: coolify-api
    resource: https://coolify.io/docs/api-reference/authorization
    title: Coolify API authorization
  - id: trivy-incident
    resource: https://www.aikido.dev/blog/trivy-alternatives
    title: Trivy alternatives (incidente de 2026)
  - id: trivy-grype
    resource: https://appsecsanta.com/trivy-vs-grype
    title: Trivy vs Grype
---

# CI/CD

Desenhado do zero para a BOSUN: um app Next.js, uma imagem, um compose no Coolify, beta e stable no mesmo servidor ([ADR-111](../decisions/adr-111-architecture.md)). Os limites que o CI cobra estão no [padrão de qualidade](quality-gate.md). O CI/CD do CRMv2 **não** é portado.

## Princípios

1. **Uma imagem por commit, gerada uma vez no CI.** O servidor nunca compila.
2. **Promover não recompila:** o stable recebe o **mesmo digest** que passou no beta, só com outra tag.
3. **Menor privilégio:** `permissions: contents: read` no topo; escrita só no job que precisa; segredos de deploy só no workflow de release[^gha-hardening].
4. **Ações fixadas por SHA** de 40 caracteres, com comentário da versão; o Dependabot atualiza[^gha-best].
5. **Sem `pull_request_target`**, build e publicação em jobs separados, cache só de branches confiáveis. Foi exatamente esse conjunto de falhas que permitiu os ataques de cache e de token em 2026[^gha-hardening][^trivy-incident].
6. **Enxuto:** um repositório só (sem Turbo), dois workflows, cabe nos 2.000 minutos mensais do plano gratuito para repositório privado[^gha-pricing].

## Workflow `ci.yml` (pull request e push na `main`)

`concurrency` cancela a execução anterior do mesmo PR. Jobs em paralelo:

| Job | Passos | Bloqueia? |
|---|---|---|
| `check` | Node pelo `.nvmrc`; `pnpm install --frozen-lockfile` com cache do setup-node; `tsc` (TS 7); `oxlint --deny-warnings`; Vitest com cobertura e limites; jscpd; `./scripts/validate.sh ./okf` | sim |
| `integration` | Postgres e RustFS como `services`; `prisma migrate deploy`; testes de integração (webhooks com fixtures reais, sync Google, filas) | sim |
| `e2e` | build de produção + Playwright, com serviços externos falsos | sim |
| `security` | gitleaks (segredos); osv-scanner no `pnpm-lock.yaml`; Semgrep CE (TypeScript + OWASP Top 10) | sim, para achado alto ou crítico |

Estimativa: de 8 a 12 minutos por execução.

## Workflow `release.yml`

### Beta (push na `main`, depois do CI verde)

1. **build:** `docker/build-push-action` com cache `type=gha,mode=max`[^docker-gha-cache]; publica `ghcr.io/<dono>/bosun:sha-<commit>`.
2. **sbom e scan:** Syft gera o SBOM CycloneDX; Grype varre a imagem e reprova em alto ou crítico. Grype no lugar do Trivy por causa do comprometimento do Trivy em 2026[^trivy-incident][^trivy-grype].
3. **deploy-beta:** pela API do Coolify (token só com permissão de deploy)[^coolify-api], atualiza a variável `IMAGE_TAG` do recurso beta e dispara o deploy. O compose lê `image: ghcr.io/<dono>/bosun:${IMAGE_TAG}`[^coolify-compose].
4. **smoke:** espera `/api/health` do beta responder com a versão nova; se falhar, o job falha e o stable não é afetado.

### Stable (tag `vX.Y.Z`)

1. Confere que o commit da tag já tem a imagem `sha-<commit>` com scan verde.
2. Cria a tag `vX.Y.Z` **no mesmo digest** (`docker buildx imagetools create`), sem rebuild.
3. Atualiza `IMAGE_TAG=vX.Y.Z` no recurso stable, faz o deploy e o smoke test.
4. Publica a release no GitHub com o SBOM e o digest.

A tag de release é a aprovação humana: as regras de aprovação de ambiente do GitHub não existem em repositório privado no plano gratuito.

### Rollback

`workflow_dispatch` com o campo `tag`: aponta o stable para uma tag anterior e faz o deploy. Funciona porque as migrations seguem expandir/contrair.

## Migrations no deploy

- O compose tem um serviço `migrate` de execução única (`prisma migrate deploy`), do qual `web` e `worker` dependem (`service_completed_successfully`).
- Só o `migrate` recebe a credencial de dono do banco. `web` e `worker` usam um papel sem permissão de DDL.

## Manutenção

- **Dependabot** semanal e agrupado para npm, GitHub Actions (atualiza os SHAs) e a imagem base do Docker.
- **Fora do piloto:** attestations de proveniência do GitHub, porque em repositório privado exigem Enterprise Cloud[^gha-attest]. Assinatura com cosign keyless também fica de fora, porque grava o nome do repositório no log público do Sigstore. O SBOM e o digest na release cobrem a auditoria por enquanto.

## A conferir na Fatia 0

- Os endpoints exatos da API do Coolify para atualizar variável de um recurso compose e disparar o deploy, na versão instalada.
- O SHA atual de cada ação usada.
- O consumo real de minutos depois das primeiras semanas.

[^gha-hardening]: Security hardening GitHub workflows at scale
[^gha-best]: GitHub Actions best practices
[^gha-attest]: GitHub artifact attestations
[^gha-pricing]: GitHub Actions pricing update
[^docker-gha-cache]: Docker build cache GitHub Actions backend
[^coolify-compose]: Coolify Docker Compose
[^coolify-api]: Coolify API authorization
[^trivy-incident]: Trivy alternatives (incidente de 2026)
[^trivy-grype]: Trivy vs Grype

## Relations

- governed_by: [ADR-111 — Arquitetura, operação e privacidade](../decisions/adr-111-architecture.md)
- depends_on: [Padrão de qualidade](quality-gate.md)
- details: [Deploy e operação](deployment.md)
