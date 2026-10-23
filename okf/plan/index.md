# Plano

Fatias verticais, na ordem em que entregam valor à piloto. Cada fatia vai ao ar na VPS dela quando passa o critério de aceite. Como trabalhar em cada fatia: [Guia de trabalho com IA](../howto/ai-workflow.md).

Status: **draft**, aguardando a aprovação do usuário. A Fatia 0 espera a revisão da stack e do deploy (ver [Estado atual](../memory/current-state.md)). As fatias são enriquecidas uma por vez, com o usuário, via `/spec` e `/plan`.

- [Fatia 0 — Fundação](slice-00-foundation.md) - Scaffold, login, papéis, workspace, CI e VPS com backup restaurado.
- [Fatia 1 — Caixa com WhatsApp](slice-01-whatsapp-inbox.md) - Primeiro valor: atender o WhatsApp pela BOSUN.
- [Fatia 2 — Contatos e Google Contatos](slice-02-google-contacts.md) - Ficha, mesclagem e sync pela etiqueta BOSUN.
- [Fatia 3 — Instagram e Facebook na caixa](slice-03-meta-inbox.md) - Conexão da Meta, DMs e comentários como tickets.
- [Fatia 4 — Automação de comentário](slice-04-comment-automation.md) - Comentário → resposta → DM → entrega, com handoff.
- [Fatia 5 — Campanha e venda](slice-05-campaign-sale.md) - Kiwify, atribuição e painel do funil.
- [Fatia 6 — Negócio, tarefa e projeto](slice-06-deal-task.md) - Pipeline, tarefa do ticket e projeto em lista e quadro.
- [Fatia 7 — Calendário, Meu dia e push](slice-07-calendar-my-day.md) - Agenda, Google Agenda só leitura e push.
- [Fatia 8 — Publicações](slice-08-publishing.md) - Documentos e publicação no Instagram, Facebook e YouTube Shorts.
- [Fatia 9 — Chat do site](slice-09-site-chat.md) - Widget com identificação, em tempo real.
- [Fatia 10 — Piloto pronto](slice-10-pilot-ready.md) - Setup, busca, LGPD e o golden path de ponta a ponta.

## Dependências

```text
0 → 1 → 2
    1 → 3 → 4 → 5 → 6 → 7 → 8 → 10
        3 → 9 ────────────────────→ 10
```

A fatia 2 pode correr em paralelo com a 3. A 9 pode correr em paralelo com as 4 a 8.
