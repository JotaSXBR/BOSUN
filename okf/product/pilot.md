---
type: Success Criteria
title: Piloto
description: Golden path de nove passos, ciclo de uma campanha real + 30 dias e a evidência que prova cada passo.
tags: [bosun, piloto, golden-path, sucesso]
status: draft
generated:
  by: claude-opus/5.5
  at: 2026-10-23T00:00:00Z
---

# Piloto

Piloto: uma founder de infoprodutos, com um ou dois ajudantes. Ela não paga.

## Golden path

Uma campanha real atravessa, em um workspace:

1. **Post**: ela cria a campanha, escreve o post, anexa a mídia e agenda; a BOSUN publica no Instagram, no Facebook e no YouTube Shorts ([Post](post.md), [Campanha](campaign.md)).
2. **Comentário**: alguém comenta a palavra-chave no post ([Canal](channel.md)).
3. **Automação**: a BOSUN responde em público e manda a DM com o link rastreável e o material ([Automação](automation.md)).
4. **Atendimento**: a pessoa responde fora do fluxo ou chama no WhatsApp ou no chat do site; o ticket vai para a fila; alguém assume e responde ([Ticket](ticket.md)).
5. **CRM**: o contato, já unificado, ganha um negócio ligado à campanha ([Contato](contact.md), [Negócio](deal.md)).
6. **Venda**: a Kiwify confirma a compra por webhook; a venda é atribuída ao post, ao fluxo e à campanha ([Venda](sale.md)).
7. **Tarefa**: a entrega ou o follow-up vira tarefa com responsável e prazo, opcionalmente num projeto ([Tarefa](task.md)).
8. **Calendário**: a tarefa aparece no calendário ao lado do Google Agenda dela ([Calendário](calendar.md)).
9. **Meu dia**: no dia seguinte, a conversa pendente, a tarefa e os eventos estão no Meu dia ([Meu dia](my-day.md)).

Cada passo deixa **evidência**: registro, status, horário ou auditoria. Passo sem evidência não conta.

## Ciclo

**Uma campanha real + 30 dias corridos** de uso. O ciclo termina quando a piloto declara que não abriu ferramenta paralela para as funções cobertas (agendador de posts, ferramenta de automação de DM, planilha de leads, lista de tarefas) e que manteria a BOSUN.

## Evidência

- Todo ticket tem contato; toda venda tem atribuição ou motivo de não ter; toda tarefa tem dono; todo post tem status por destino.
- Nenhuma mensagem perdida, nenhum post duplicado, nenhuma DM repetida para o mesmo contato e post.
- Painel da campanha com o funil comentários → DMs → tickets → negócios → vendas.
- Backup restaurado com sucesso antes do go-live.

## Relações

- governado_por: [ADR-101 — Produto, piloto e escopo](../decisions/adr-101-product.md)
- depende_de: [Post](post.md)
- depende_de: [Automação](automation.md)
- depende_de: [Ticket](ticket.md)
- depende_de: [Venda](sale.md)
- depende_de: [Meu dia](my-day.md)
