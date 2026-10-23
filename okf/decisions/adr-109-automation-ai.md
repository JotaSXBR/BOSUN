---
type: ADR
title: ADR-109 — Automação e IA
description: Motor de fluxos, automação social, Copiloto, Observer, agentes, autonomia, prontidão e provedor.
tags: [bosun, adr, automation, ai, agents, copilot, observer]
status: draft
generated: { by: agent/claude-opus-5-5, at: 2026-10-23T00:00:00Z }
---

# ADR-109 — Automação e IA

**Status:** vigente; consolidado em 2026-10-23 e sujeito à aprovação do design completo. Este ADR é a única fonte de decisão do domínio: decisão nova **edita este arquivo**.

## Dois motores

1. **Automação determinística** inicia e conduz funis; **agente de IA** é reativo e não inicia conversa. Ordem: **fluxo primeiro, agente como fallback, pessoa por último**.

## Automação social

2. Primeiro ciclo: **Instagram** (comentário em post/reels/carrossel, resposta de story, menção) e **Facebook** (comentário, Messenger). TikTok quando houver API viável; **Kwai fora**.
3. Fluxo nasce de **receita pronta** e é editado no canvas. Até **30 fluxos ativos** por workspace e **50 blocos** por fluxo. Admin e Manager publicam.
4. Palavra-chave sem diferenciar caixa e acento. Deduplicação: contato + família de post + palavra, uma vez para sempre.
5. **Um evento dispara no máximo um fluxo**: ganha o mais específico (post + palavra → palavra → resposta padrão); empate pela ordem manual do Admin; a tela avisa disputa.
6. Sem DM fria; respeita a janela da Meta.
7. Templates: comentário → DM → entrega, boas-vindas, recuperação, agendamento, confirmação e lembrete, pós-venda, reativação.
8. Link único rastreável por fluxo/post; venda confirmada por **webhook da Kiwify** ou webhook genérico. Conversão principal = venda confirmada.

## Copiloto

9. Escreve **com confirmação**, com as permissões do usuário, nunca com conteúdo pessoal de outro membro, sempre citando a fonte.
10. **Propõe estrutura, não cria**: até três perguntas, proposta em números (o que cria e o esforço), consulta a agenda, só cria após aceite. Um projeto por prazo/dono/lote; etapas por atividade; campanha só com oferta.

## Observer e agentes

11. **Observer só sugere**; opt-in por workspace e canal; retenção de 90 dias.
12. Agentes de execução são identidades de serviço configuradas pelo Admin; não herdam permissões.
13. Catálogo: SDR, Suporte, Agendador, Recuperação de carrinho, Onboarding de aluno, Cobrança, Assistente interno (único no template Pessoal).
14. Autonomia em três níveis — **livre, aprovação, proibido** — **por ferramenta**. Checkout livre só da oferta publicada.
15. **Ferramentas internas tipadas**; MCP externo só configurado pelo Admin, com lista permitida; dry-run por padrão em escrita; toda chamada auditada.
16. **Precedência:** política do workspace > instrução do fluxo > artigo da Base > prompt do agente. Ambiguidade é gatilho de handoff. Resposta marcada como ruim vira caso do scorecard.
17. **Prontidão:** 80% das 30 perguntas cobertas pela Base, 20 conversas revisadas, 10 objeções, 90% em 30 casos dourados, modo sombra de 7 dias ou 50 conversas, aprovação do Admin.
18. Handoff nos seis gatilhos ([ADR-107](adr-107-service-social.md)). Aviso de IA na primeira mensagem; CPF, cartão, endereço e dados bancários são redigidos antes do provedor.

## Provedor

19. **BYOK obrigatório**: camada multi-provedor (Vercel AI SDK: Anthropic, OpenAI, Google, OpenRouter) e modelo por agente. Sem chave, agentes e Copiloto ficam desligados.
20. Custo estimado por agente e workspace, alertas em 50/80/100%, sem bloqueio automático.

## Origem

Consolida os antigos 011, 035, 041, 045, 047, 052, arquivados em `archive/adrs-2026-10-23/`.
