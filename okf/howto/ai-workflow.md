---
type: Guide
title: Guia de trabalho com IA
description: Ciclo por fatia (spec, teste, código, verificação, revisão), comandos, definição de pronto, registro de decisão e retomada de sessão.
tags: [bosun, guia, ia, processo]
status: draft
generated:
  by: claude-opus/5.5
  at: 2026-10-23T00:00:00Z
---

# Guia de trabalho com IA

Vale para qualquer ferramenta. Uma pessoa conduz; o agente executa uma fatia por vez.

## Ciclo de uma fatia

1. **Spec.** Leia a fatia em `okf/plan/` e os conceitos e ADRs ligados nela. Complete a seção `## Spec` da fatia com o que a sessão descobriu (rotas, campos, dúvidas resolvidas) e faça o commit antes do código; spec só no chat se perde. Dúvida que muda escopo, dados, segurança ou custo vai para o usuário antes.
2. **Teste.** Escreva primeiro os testes do critério de aceite e veja falhar. Use fixtures com payloads reais gravados para Meta, WAHA, Kiwify e Google; nunca chame a API real nos testes.
3. **Código.** Implemente o mínimo que passa nos testes, no módulo dono do assunto ([Arquitetura](../tech/architecture.md)). Antes de usar uma biblioteca ou API externa, confira a documentação oficial da versão em uso (Context7, se disponível).
4. **Verificação.** Rode lint, typecheck, testes e `./scripts/validate.sh ./okf`. Mostre a saída. Para tela, abra o app e confira à mão o fluxo da fatia.
5. **Revisão.** Releia o diff procurando: consulta sem `workspace_id`, autorização faltando, webhook ou job não idempotente, segredo em log, ação sensível sem auditoria. Se a ferramenta tiver revisão por subagente, use.

Trabalhe em passos pequenos, com um commit por passo que funciona. Uma fatia grande demais para uma sessão vira subtarefas dentro da própria fatia.

## Comandos

```bash
./scripts/validate.sh ./okf          # documentação: sai 0 sem erro
./scripts/validate.sh ./okf --graph  # o que se liga a quê
./scripts/test_validate.sh           # self-test do validador
```

Os comandos da aplicação (instalar, lint, typecheck, testes, migrations, ambiente local) entram no `AGENTS.md` ao fim da Fatia 0.

## Definição de pronto

Fonte única; o `AGENTS.md` aponta para cá.

1. O critério de aceite da fatia passa, com evidência.
2. Lint, typecheck e testes verdes; validador do bundle com 0 erro.
3. Conceitos e ADRs batem com o que foi construído; o `resource` dos conceitos materializados está preenchido.
4. Uma linha no `okf/log.md`.
5. Deploy na VPS da piloto, quando a fatia vai ao ar.
6. O usuário aceitou a fatia.

## Registrar uma decisão

- Decisão nova ou mudança: edite o ADR do domínio (`okf/decisions/`) e o conceito afetado; adicione uma linha no log.
- Não crie ADR novo para um domínio que já tem ADR.
- Item do `later.md` só entra no escopo com decisão registrada.
- Siga a skill `okf-bosun` para qualquer edição em `okf/`.

## Retomar uma sessão

1. Leia `AGENTS.md`, `okf/memory/current-state.md` e o fim do `okf/log.md`.
2. Rode `git log --oneline -10` e `git status`.
3. Abra a fatia em andamento em `okf/plan/` e confira o critério de aceite que falta.
4. Ao encerrar, atualize `current-state.md` (fatia atual, o que falta, bloqueios) e faça o commit.

## Relations

- governed_by: [Perfil OKF BOSUN](../okf-profile.md)
- details: [Plano](../plan/index.md)
