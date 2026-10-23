---
type: Pipeline Design
title: CI/CD
description: Pipeline enxuto no GitHub Actions — checagens do padrão de qualidade, imagem única por commit, beta automático, stable por tag e rollback por tag.
tags: [bosun, cicd, github-actions, coolify, supply-chain]
resource: .github/workflows
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
  - id: gha-billing
    resource: https://docs.github.com/en/billing/concepts/product-billing/github-actions
    title: GitHub Actions billing (repositórios públicos)
  - id: gha-environments
    resource: https://docs.github.com/en/actions/how-tos/deploy/configure-and-manage-deployments/manage-environments
    title: GitHub deployment environments
  - id: gha-fork-pr
    resource: https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/control-workflow-runs
    title: Workflows de pull request vindos de fork
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
5. **Sem `pull_request_target`**, build e publicação em jobs separados, cache só de branches confiáveis: o PR só lê o cache (`actions/cache/restore`); só a `main` grava. Foi exatamente esse conjunto de falhas que permitiu os ataques de cache e de token em 2026[^gha-hardening][^trivy-incident].
6. **Enxuto:** um repositório só (sem Turbo), dois workflows. O repositório é **público**: os runners padrão do GitHub não cobram minutos[^gha-billing].
7. **Repositório público:** nada de domínio, IP, URL do Coolify ou dado da piloto no código ou no `okf/`; tudo isso fica em segredos e variáveis do ambiente. PR de fork roda o `ci.yml` sem segredos e com token só de leitura[^gha-fork-pr]; runner self-hosted nunca.

## Workflow `ci.yml` (pull request e push na `main`)

`concurrency` cancela a execução anterior do mesmo PR (na `main` não cancela). Jobs em paralelo; a integração roda dentro do `check`, sem job próprio:

| Job | Passos | Bloqueia? |
|---|---|---|
| `check` | Setup comum em `.github/actions/setup` (Node pelo `.nvmrc`, pnpm, `pnpm install --frozen-lockfile`); Postgres pelo `compose.dev.yml` (mesma imagem fixada por digest do dev); self-tests dos scripts; `pnpm verify` (`tsc`, `oxlint --deny-warnings`, exceções do oxlint com motivo e teto, Vitest unitário e de integração com cobertura e limites, jscpd, `./scripts/validate.sh ./okf`) | sim |
| `e2e` | build de produção + Playwright, com serviços externos falsos | sim |
| `security` | gitleaks (segredos, histórico inteiro) e osv-scanner no `pnpm-lock.yaml`, cada um por imagem oficial fixada por digest em `.github/<ferramenta>/Dockerfile`, que o Dependabot renova, com o código montado só para leitura (o gitleaks também sem rede); sem a `gitleaks-action`, que tem licença comercial (reprova qualquer severidade; exceção com prazo no `osv-scanner.toml`) | sim |

Estimativa: de 8 a 12 minutos por execução. No repositório público também entram, de graça, o **CodeQL** (`security-extended`, a análise estática de segurança do projeto; o Semgrep saiu porque as regras do registro não têm versão fixa), o **secret scanning com push protection** e os alertas do Dependabot.

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

A tag de release é a aprovação humana, e o job de deploy do stable usa o **environment `stable` com revisor obrigatório** (disponível no plano gratuito para repositório público)[^gha-environments]. Os segredos do Coolify ficam nos environments `beta` e `stable`, não no nível do repositório.

### Rollback

`workflow_dispatch` com o campo `tag`: aponta o stable para uma tag anterior e faz o deploy. Funciona porque as migrations seguem expandir/contrair.

## Migrations no deploy

- O compose tem um serviço `migrate` de execução única (`prisma migrate deploy`), do qual `web` e `worker` dependem (`service_completed_successfully`).
- Só o `migrate` recebe a credencial de dono do banco. `web` e `worker` usam um papel sem permissão de DDL.

## Manutenção

- **Dependabot** semanal e agrupado para npm, GitHub Actions (atualiza os SHAs) e a imagem base do Docker.
- **Proveniência:** `actions/attest-build-provenance` e a attestation do SBOM em cada imagem, disponíveis em repositório público[^gha-attest]. O deploy confere a attestation (`gh attestation verify`) antes de mudar a tag. Isso substitui o cosign.

## A conferir na Fatia 0

- Os endpoints exatos da API do Coolify para atualizar variável de um recurso compose e disparar o deploy, na versão instalada.
- O SHA atual de cada ação usada.
- Se o `gh attestation verify` roda no job de deploy sem permissão extra.

[^gha-hardening]: Security hardening GitHub workflows at scale
[^gha-best]: GitHub Actions best practices
[^gha-attest]: GitHub artifact attestations
[^gha-pricing]: GitHub Actions pricing update
[^docker-gha-cache]: Docker build cache GitHub Actions backend
[^coolify-compose]: Coolify Docker Compose
[^coolify-api]: Coolify API authorization
[^gha-billing]: GitHub Actions billing (repositórios públicos)
[^gha-environments]: GitHub deployment environments
[^gha-fork-pr]: Workflows de pull request vindos de fork
[^trivy-incident]: Trivy alternatives (incidente de 2026)
[^trivy-grype]: Trivy vs Grype

## Relations

- governed_by: [ADR-111 — Arquitetura, operação e privacidade](../decisions/adr-111-architecture.md)
- depends_on: [Padrão de qualidade](quality-gate.md)
- details: [Deploy e operação](deployment.md)
