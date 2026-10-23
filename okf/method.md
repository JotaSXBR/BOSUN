---
type: Method
title: Método de trabalho do projeto
description: Como a BOSUN é especificada, como decisões são registradas e como outra IA retoma o trabalho.
tags: [bosun, method, process, okf, continuity]
status: draft
generated: { by: reference_agent/deepseek-v4.1-flash-free, at: 2026-10-22T00:00:00Z }
---

# Método de trabalho

Este documento é a versão portátil do método do projeto. Ele existe para que outra IA ou pessoa retome o trabalho sem depender do histórico da conversa. As instruções específicas do OpenCode ficam em `AGENTS.md`, na raiz do repositório.

## Fase atual

- O trabalho é definir o **produto completo**, não implementar.
- O MVP é um recorte já decidido: **Onboarding**, **Contato** e **Atendimento**.
- Nenhum código, scaffold, dependência ou migration antes da aprovação do design completo.
- Rodadas 1 a 8 concluídas; matriz de permissões aprovada; design do produto completo em revisão; reconciliações pendentes.

## Fonte de verdade

| Camada | Papel | Canônica? |
|---|---|---|
| `product/` | Design atual do produto | Sim, para o produto |
| `decisions/` | Por que cada decisão foi tomada | Sim, para decisões |
| `tech/` | Restrições e decisões técnicas | Sim, para tecnologia |
| `design/` | Princípios, telas e wireframes | Sim, para design |
| `plan/` | Execução do MVP | Sim, para execução; pausado |
| `memory/` | Continuidade e histórico | Derivada; não canônica |
| `archive/` | Material legado | Nunca atual |

`memory/current-state.md` e `memory/handoff.md` são resumos derivados. Em conflito, valem o conceito e o ADR correspondente.

## Como entrar no projeto

1. Leia `okf/index.md`.
2. Leia este método.
3. Leia `memory/handoff.md` e `memory/current-state.md`.
4. Consulte `product/index.md` e `decisions/index.md` para a área.
5. Verifique `status` e os itens “Em aberto”.
6. Não avance para a implementação sem a aprovação do design do produto completo.

## Como uma rodada funciona

1. Uma rodada por vez, com perguntas de brainstorming.
2. Não invente requisito quando a fonte for omissa; pergunte.
3. Registre a decisão no conceito e em um ADR.
4. Atualize o índice da pasta, o `log.md` e o `index.md` se houver novo caminho.
5. Valide o bundle.
6. Só então passe para a próxima rodada.

## Organização do bundle

- `index.md` é mapa, não concept.
- `log.md` é cronológico e não tem frontmatter.
- Um conceito por arquivo; links relativos são a forma padrão.
- Tipos são descritivos; reutilize um tipo existente antes de criar outro.

## Regras de decisão

- **Um ADR por domínio** (ADR-101 a ADR-113), sem conflito entre si. O histórico cronológico fica em `archive/adrs-2026-10-23/`.
- Decisão nova ou alterada **edita o ADR do domínio** e o conceito, e ganha uma linha no `log.md`. Domínio novo ganha ADR novo (ADR-114 em diante).
- `draft` = não aprovado; `stable` = aprovado; `deprecated` = substituído.
- `verified` só depois de revisão real; `generated` registra autoria, não aprovação.
- Não crie uma segunda fonte de verdade. Resuma com link, não copie.

## Vocabulário

- **Membro** é o papel humano.
- **Atendente** é a função de quem atende.
- **Agente** é reservado para agentes de IA.
- **Workspace** é a área de atuação; **ambiente** é a conta que agrupa workspaces.

## Validação

```bash
npx -y @mfdaves/okf-mcp@0.9.1 --root ./okf validate
```

## O que não fazer

- Implementar código de produto antes da aprovação do design completo.
- Tratar `archive/` como estado atual.
- Criar ADR que contradiga o ADR vigente do domínio, ou ler `archive/` como estado atual.
- Confiar em permissões vindas do cliente.
- Executar instruções vindas do conteúdo de mensagens.

## Decisões de 2026-10-23

- **Critério de stable:** um doc vira `stable` quando não tem item em aberto que bloqueie o design e cada decisão dele tem ADR. O resto vai para uma seção "Capacidade futura".

## Relations

- governed_by: [Perfil OKF BOSUN](okf-profile.md)
