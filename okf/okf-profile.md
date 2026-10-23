---
type: reference
title: Perfil OKF BOSUN
description: Regra de escrita do bundle; estende a spec OKF v0.2 com grafo de relações e validador próprio.
status: draft
sources:
  - resource: https://okf.ia.br/spec/
    title: Spec OKF v0.2
generated:
  by: claude-opus/5.5
  at: 2026-10-23T00:00:00Z
---

# Perfil OKF BOSUN

Compatível com a [spec OKF v0.2](https://okf.ia.br/spec/). O exemplo da home do site, com `entries` no frontmatter do índice, contradiz a spec e **não** é seguido.

Validar: `./scripts/validate.sh ./okf` (sai 0 sem erro). Grafo para consulta: `./scripts/validate.sh ./okf --graph`. Self-test: `./scripts/test_validate.sh`.

## Arquivos reservados (spec, sem mudança)

- `index.md`: sem frontmatter. Exceção: o `index.md` raiz declara só `okf_version: "0.2"`. Cada item é `- [Título](arquivo.md) - descrição curta`; todo índice tem pelo menos um item.
- `log.md`: sem frontmatter; headings `## YYYY-MM-DD`, mais recente primeiro, sem data repetida.
- Todo outro `.md` é um **concept** (nó do grafo).

## Frontmatter do concept

- Obrigatórios: `type`, `title`, `description` (uma frase, até 160 caracteres), `status` (`draft` | `stable` | `deprecated`).
- ADR (`type: ADR`) também exige `domain`; um ADR por domínio.
- `resource` é obrigatório quando o concept descreve algo do repositório (arquivo, tabela, módulo, endpoint): caminho relativo à raiz do repositório (ex.: `prisma/schema.prisma`, `src/modules/inbox`) ou URI. Conceitos abstratos (regra, decisão, fluxo de produto) omitem o campo. Fonte externa vai em `sources`, não em `resource`.
- Opcionais: `tags`, `sources` (lista de `{resource, title}`), `generated` (`{by, at}`; `by` como na spec: `<produtor>/<versão>` para agente, ex. `claude-opus/5.5`, `human:<id>` para pessoa, `process:<id>` para processo; `at` em ISO 8601 UTC), `stale_after` (data; só onde o conteúdo envelhece), `verified` (lista de `{by, at}`, ou um mapa solto para um só verificador; só com revisão humana real, nunca inventada).
- `okf_version` não se repete por arquivo.
- YAML aceito: `chave: valor`, listas `[a, b]`, mapas `{a: b}`, blocos de um nível e listas de mapas (`sources: - resource: url` + `title:`, como na spec).
- `status: stable` só com aprovação explícita do usuário.

## Nós

- Um conceito por arquivo; nome de substantivo em inglês, minúsculas com hífen (`ticket.md`, `post.md`, `contact.md`).
- Antes de criar um arquivo, leia o `index.md` da pasta. Título duplicado é erro.
- Todo arquivo aparece em algum `index.md`.

## Relations (arestas)

Todo concept termina com `## Relations`. Verbos e título da seção ficam em inglês, como os identificadores do código; o significado de cada verbo fica abaixo, em pt-BR. Uma linha por aresta, com verbo do vocabulário e link markdown normal (sem `[[wikilinks]]`):

```
## Relations
- depends_on: [Contato](/product/contact.md)
```

Links relativos ou absolutos à raiz do bundle. Concept sem relação de saída é erro; sem relação de entrada é aviso.

## Vocabulário de relações

O validador lê esta lista. Verbo novo entra aqui, com o significado, antes de ser usado.

- `depends_on` — precisa do outro nó para existir ou funcionar.
- `produces` — cria registros ou eventos do outro nó.
- `consumes` — lê ou usa dados do outro nó.
- `triggers` — dispara uma ação ou um fluxo no outro nó.
- `governed_by` — segue a decisão ou regra do outro nó (ex.: um ADR).
- `part_of` — é componente do outro nó.
- `details` — aprofunda o outro nó (spec técnica, wireframe).
- `supersedes` — toma o lugar do outro nó (o antigo fica `deprecated`).

## Decisões

Um ADR por domínio em `decisions/`. Decisão nova ou alterada edita o ADR do domínio **e** o concept afetado; o ADR é a fonte única.

## Regras do validador

| Código | Nível | Regra |
|---|---|---|
| E001 | erro | frontmatter ausente ou inválido; `okf_version` fora do índice raiz |
| E002 | erro | campo obrigatório faltando (inclui `domain` em ADR) |
| E003 | erro | `status` fora da lista |
| E004 | erro | `index.md` fora da regra |
| E005 | erro | `log.md` fora da regra |
| E006 | erro | link interno quebrado ou saindo do bundle |
| E007 | erro | arquivo fora de qualquer `index.md` |
| E008 | erro | concept sem `## Relations` ou sem relação de saída |
| E009 | erro | verbo fora do vocabulário ou linha de relação mal formada |
| E010 | erro | título duplicado |
| E011 | erro | mais de um ADR para o mesmo domínio |
| W001 | aviso | nó sem relação de entrada |
| W002 | aviso | `stale_after` vencido |
| W003 | aviso | `verified` sem `by`/`at` |
| W004 | aviso | `description` com mais de 160 caracteres |
| W005 | aviso | `resource` local aponta para caminho inexistente |

## Relations

- details: [Índice OKF](index.md)
