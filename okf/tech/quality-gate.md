---
type: Quality Gate
title: Padrão de qualidade
description: Limites de lint, complexidade, tamanho, cobertura, duplicação, segurança, dependências e licenças que o CI exige e uma auditoria externa confere.
tags: [bosun, qualidade, oxlint, auditoria, ci]
status: draft
generated:
  by: claude-opus/5.5
  at: 2026-10-23T00:00:00Z
sources:
  - id: oxlint-rules
    resource: https://oxc.rs/docs/guide/usage/linter/rules.html
    title: Oxlint rules
  - id: oxlint-config
    resource: https://oxc.rs/docs/guide/usage/linter/config
    title: Oxlint configuration
  - id: tsgolint
    resource: https://github.com/oxc-project/tsgolint
    title: tsgolint (type-aware linting for Oxlint)
  - id: oxlint-complexity
    resource: https://socket.dev/npm/package/oxlint-plugin-complexity/overview/2.1.6
    title: oxlint-plugin-complexity
  - id: sonar-gate
    resource: https://docs.sonarsource.com/sonarqube-server/2026.4/quality-standards-administration/managing-quality-gates/introduction-to-quality-gates
    title: SonarQube quality gates (Sonar way)
  - id: asvs
    resource: https://owasp.org/www-project-asvs/
    title: OWASP ASVS 5.0
  - id: due-diligence
    resource: https://www.blackduck.com/resources/ebooks/software-due-diligence.html
    title: Black Duck M&A software due diligence checklist
  - id: ts7-api
    resource: https://dev.to/gabrielanhaia/typescript-7-has-no-stable-compiler-api-yet-thats-why-typescript-eslint-wont-install-4pa
    title: TypeScript 7 has no stable compiler API yet
  - id: next-ts7
    resource: https://nextjs.org/docs/app/api-reference/config/typescript
    title: Next.js TypeScript configuration
---

# Padrão de qualidade

O que o CI exige em todo pull request e o que uma auditoria externa (due diligence técnica, revisão de segurança) costuma conferir. Os números são **propostas** baseadas em padrões de mercado e só valem depois de aprovados. É o `CONSTRAINTS.md` do agent-skills (`/agent-skills:constraints`), guardado no OKF.

## Em que se baseia

- **Auditoria técnica** costuma olhar: complexidade, duplicação, cobertura de testes, índice de manutenção, arquivos gigantes, acoplamento, vulnerabilidades conhecidas, SBOM e licenças (com atenção a GPL/AGPL embutidas)[^due-diligence].
- **Sonar way**, o gate padrão do SonarQube: nenhum problema novo, cobertura de 80% e no máximo 3% de duplicação no código novo[^sonar-gate]. O perfil padrão do Sonar usa 15 como limite de complexidade cognitiva por função.
- **OWASP ASVS 5.0 nível 2**, o nível indicado para SaaS que trata dados de clientes[^asvs].

## Linguagem e lint

- **TypeScript 7** (compilador nativo), estrito. O TS 7 ainda não tem a API programática do compilador, por isso o typescript-eslint não roda nele[^ts7-api]. O Next.js usa o `tsc` com `experimental.useTypeScriptCli`[^next-ts7].
- **Oxlint** com o tsgolint para as regras que precisam de tipos[^tsgolint], configurado em `.oxlintrc.json`[^oxlint-config]. No CI, `oxlint --deny-warnings`: aviso também reprova.
- Categorias: `correctness` e `suspicious` como erro; `perf` como aviso; regras de `pedantic`, `restriction` e `style` só as listadas abaixo.

| Regra | Limite | Por quê |
|---|---|---|
| `complexity` (ciclomática) | 10 por função | Métrica clássica de auditoria |
| complexidade cognitiva (`oxlint-plugin-complexity`)[^oxlint-complexity] | 15 por função | O mesmo limite do Sonar way |
| `max-lines` | 300 linhas por arquivo, sem contar brancas e comentários | Arquivo gigante é sinal de alerta em auditoria |
| `max-lines-per-function` | 60 | Função cabe numa tela |
| `max-depth` | 4 | Aninhamento legível |
| `max-params` | 4 | Acima disso, um objeto |
| `max-nested-callbacks` | 3 | |
| `typescript/no-explicit-any` | erro | Tipagem é a primeira linha de defesa |
| `typescript/no-floating-promises`, `no-misused-promises` | erro | Promessa solta perde erro e dado |
| `import/no-cycle` | erro | Módulos sem dependência circular ([Engenharia](engineering.md)) |
| `no-console` | erro | Log só pelo logger, sem dado sensível |
| `no-eval`, `no-implied-eval`, `no-new-func` | erro | Segurança |
| `eqeqeq` | erro | |

Todas as 871 regras do Oxlint estão na referência oficial[^oxlint-rules]. Arquivos gerados (Prisma client, migrations) ficam fora do lint.

## Exceções

- Desligar uma regra numa linha exige `// oxlint-disable-next-line <regra> -- <motivo>`. Sem motivo, o CI reprova.
- O CI conta as exceções; o número só sobe com aprovação no pull request.
- Baixar um limite desta página é decisão: edite esta página e o ADR-111.

## Testes e cobertura

- Vitest com cobertura V8: **80% de linhas e ramos** no código novo e no total.
- **90% de ramos** nos módulos críticos: `identity` (auth e autorização), webhooks, `automation`, `crm` (venda e atribuição) e cifra.
- Teste que falha não é apagado nem pulado sem aprovação.
- Detalhe em [Estratégia de testes](test-strategy.md).

## Duplicação

- **jscpd**: no máximo 3% de linhas duplicadas, o mesmo limite do Sonar way.

## Segurança e dependências

- **Semgrep CE** com as regras de TypeScript e OWASP Top 10: achado alto ou crítico reprova.
- **gitleaks** no CI e no pre-commit, mais o secret scanning com push protection do GitHub: nenhum segredo no repositório, que é público.
- **CodeQL** (JavaScript/TypeScript) em todo PR: alerta alto ou crítico reprova.
- **osv-scanner** no lockfile e **Grype** na imagem: nenhuma vulnerabilidade alta ou crítica sem exceção registrada com prazo. Trivy fica de fora pelo comprometimento de 2026 ([CI/CD](cicd.md)).
- **SBOM CycloneDX** (Syft) gerado a cada release e guardado com a imagem.
- **Licenças**: só MIT, Apache-2.0, BSD, ISC e semelhantes nas dependências embutidas na imagem da BOSUN; GPL e AGPL reprovam. Serviços que rodam em container separado (WAHA, RustFS) têm a licença conferida e registrada no ADR-111.
- Fluxos com auth, sessão, autorização, cifra ou logs seguem o checklist do ASVS nível 2 no `/review`.

## Ordem no CI

Detalhe dos workflows em [CI/CD](cicd.md).

1. `tsc` (TS 7, sem emitir).
2. `oxlint --deny-warnings`.
3. Testes com cobertura.
4. jscpd.
5. Semgrep, CodeQL, gitleaks, osv-scanner.
6. Build da imagem, SBOM e conferência de licenças.
7. `./scripts/validate.sh ./okf`.

## A conferir na Fatia 0

Conferido na T1 (2026-10-23):

- `max-lines` e `max-lines-per-function` aceitam `skipBlankLines` e `skipComments`; testado.
- O `oxlint-plugin-complexity` 4.0.0 roda como `jsPlugin` com a regra `complexity/complexity`, mas precisa de `"minLines": 0`: o padrão (10) ignora funções curtas. A ciclomática usa a regra nativa `complexity`.
- Prisma 7.10.1 e Next.js 16.4.2 com TS 7.0.2 passam juntos; sem volta ao TS 6.

[^oxlint-rules]: Oxlint rules
[^oxlint-config]: Oxlint configuration
[^tsgolint]: tsgolint (type-aware linting for Oxlint)
[^oxlint-complexity]: oxlint-plugin-complexity
[^sonar-gate]: SonarQube quality gates (Sonar way)
[^asvs]: OWASP ASVS 5.0
[^due-diligence]: Black Duck M&A software due diligence checklist
[^ts7-api]: TypeScript 7 has no stable compiler API yet
[^next-ts7]: Next.js TypeScript configuration

## Relations

- governed_by: [ADR-111 — Arquitetura, operação e privacidade](../decisions/adr-111-architecture.md)
- details: [Engenharia](engineering.md)
- depends_on: [Stack](stack.md)
