---
type: ADR
title: ADR-101 — Produto, estrutura e escopo
description: Instalação dedicada, ambiente, workspaces, templates, área pessoal, produto completo e anti-goals.
tags: [bosun, adr, product, workspace, templates, scope, anti-goals]
status: draft
generated: { by: agent/claude-opus-5-5, at: 2026-10-23T00:00:00Z }
---

# ADR-101 — Produto, estrutura e escopo

**Status:** vigente; consolidado em 2026-10-23 e sujeito à aprovação do design completo. Este ADR é a única fonte de decisão do domínio: decisão nova **edita este arquivo**.

## Estrutura

1. **Uma instalação por cliente**, em VPS dedicada; o isolamento entre clientes é físico. Não há instalação compartilhada.
2. **Ambiente** é a conta da instalação e a unidade de cobrança; agrupa identidade e membros.
3. **Workspace** é o contexto de um produto ou negócio e a unidade de isolamento de dados; `workspace_id` é obrigatório em toda consulta. Produto novo = workspace novo.
4. Multiusuário desde o MVP: convite por link, papéis e permissões granulares ([ADR-102](adr-102-identity-access.md)).

## Templates

5. Cinco templates: **Pessoal, Empresa, Produto, Curso e Serviços**. Definem módulos, navegação, presets de permissão, vocabulário e dados iniciais.
6. Template é **só ponto de partida**; depois da criação a configuração pertence ao workspace. Não há tipo rígido.
7. **Serviços**: Atendimento, agenda de clientes, CRM e tarefas; vocabulário cliente, serviço, agendamento. Agendamento online público fica para depois.

## Área pessoal

8. Itens pessoais nascem **privados**; Admin/Manager libera a vida pessoal **por membro**.
9. Liberada, inclui **workspace pessoal** e **módulos pessoais privados** em workspaces compartilhados. Ninguém vê, nem Admin/Manager.
10. O workspace pessoal pertence ao membro: ele exporta e exclui; o Admin só administra o acesso.

## Produto completo e MVP

11. O produto completo é definido **antes** de implementar; a implementação fica pausada até o design ser aprovado.
12. **MVP** = Fundação + Conversas: Onboarding, Contatos/Google e Atendimento por WhatsApp. É recorte, não o produto.
13. O roadmap é **mapa de capacidades e dependências**, sem datas, em oito camadas: Fundação, Conversas, Aquisição, Publicações, CRM e vendas, Trabalho e tempo, Inteligência e Operação.
14. O produto está completo quando passam o **golden path** (post → comentário → automação → atendimento → CRM → venda → tarefa → calendário → Meu dia → inteligência) e **um lançamento + 30 dias** de uso real sem ferramenta paralela.
15. Piloto: uma founder de infoprodutos.

## Integração e anti-goals

16. **Integração por fluxo, não por acoplamento**: vínculo explícito, opcional e auditável; cada módulo funciona sozinho. Nova integração só entra se conecta um fluxo real.
17. **Anti-goals permanentes:** Notion/Drive; processador de pagamento; mobile-first; colaboração entre organizações; data broker/adtech.
18. **Invariantes:** CRM opcional, sem pipeline automático; captura não vira execução automática; automação opt-in e escopada; IA com escopo, aprovação e auditoria; Publicações não gera imagem/vídeo; campanha não é projeto; gamificação sem pontos/ranking; sem disparo frio ou marketing em massa; sem rede social/comunidade.

## Capacidade futura

- Resumos inteligentes, convidados externos, Segundo Cérebro, offline/apps nativos, templates personalizados.

## Origem

Consolida os antigos 001, 002, 023, 024, 025, 042, 049, 050, 068, arquivados em `archive/adrs-2026-10-23/`.
