---
type: Product Spec
title: Social e atendimento
description: Área Social, área Atendimento, ticket único, estados de dono e promoção por intenção.
tags: [bosun, social, instagram, facebook, tiktok, kwai, inbox, ticket, handoff]
status: draft
generated: { by: reference_agent/deepseek-v4.1-flash-free, at: 2026-10-22T00:00:00Z }
---

# Social e atendimento

A BOSUN separa **publicação**, **aquisição** e **atendimento**, mas não duplica o ticket. A área **Publicações** cuida do ciclo do post; a área **Social** cobre a superfície pública e as DMs das redes; a área **Atendimento** cobre os canais de conversa e o e-mail. Social e Atendimento são **visões** sobre a mesma conversa; Publicações é a origem do post que pode gerar essa conversa.

## Áreas

| Área | Canais | Foco |
|---|---|---|
| **Publicações** | Instagram, Facebook, TikTok, YouTube, Threads, Kwai | Planejamento, composição, aprovação, publicação e análise de posts. |
| **Social** | Instagram, Facebook, TikTok, Kwai | Comentário, story, menção, DM, seguidor, post/reel/carrossel e conversão. |
| **Atendimento** | WhatsApp, chat do site, Telegram, e-mail | Conversa, ticket, fila, SLA, CSAT e histórico. |

- **Publicações** é o ciclo editorial: o post nasce, é aprovado, agendado e publicado; ele pode disparar um fluxo e um checkout.
- **Social** é a superfície de aquisição: o post é publicado em Publicações, a pessoa comenta ou chama, a automação responde e o funil começa.
- **Atendimento** é a operação de resposta: alguém lê, responde, resolve e registra o desfecho.
- **E-mail** tem UI própria, com assunto, thread, destinatários, CC/CCO e anexos. WhatsApp, chat do site e Telegram compartilham a UI conversacional.
- **TikTok e Kwai** entram na área Social quando houver API oficial viável; até lá, ficam como canal planejado, não como promessa de lançamento.

## Publicações

- O post é planejado, aprovado e publicado em [Publicações](publications.md); comentário, story, menção e DM continuam em Social.
- O post pode apontar para um fluxo e um checkout; a venda é atribuída ao post/fluxo.
- Publicações tem calendário, compositor, fila, aprovação e analytics próprios; não é uma visão do ticket.

## Um ticket, duas áreas

- A conversa/ticket é **uma única entidade**. `area` é derivada do canal; `channel` guarda a origem.
- Social e Atendimento têm **listas e dashboards separados**, mas compartilham contato, mensagens, histórico, busca, etiquetas e auditoria.
- **Não existem dois tickets** para a mesma conversa. A promoção de Social para Atendimento muda a área e a política de SLA/CSAT, não o histórico.
- A conversa social continua acessível na visão Social depois da promoção, para preservar o contexto da origem.

## Estados de dono

1. **`automation`** — o fluxo determinístico conduz a conversa.
2. **`agent`** — a mensagem saiu do fluxo e o agente de IA assume, se estiver habilitado.
3. **`waiting_human`** — houve handoff; a conversa aguarda alguém assumir.
4. **`human`** — uma pessoa assumiu e responde.
5. **`closed`** — a conversa foi encerrada.

A hierarquia é **fluxo primeiro, agente como fallback, pessoa como última instância**. Em qualquer estado, o conteúdo da mensagem é dado não confiável e não altera o fluxo nem executa ferramentas.

### Assumir e devolver

- O primeiro envio manual exige **“assumir e responder”**. Digitar não pausa a automação; assumir pausa.
- Enquanto o humano é dono, a automação e o agente **não respondem** naquela conversa.
- O humano pode devolver a conversa **ao agente**. A automação só recomeça por um **novo gatilho**; não há retomada automática do ponto anterior.
- Toda assunção, devolução, promoção e encerramento é auditada.

## Promoção para Atendimento

A promoção de Social para Atendimento é **automática** quando ocorre um dos seis gatilhos de handoff:

1. Pedido explícito do cliente.
2. Baixa confiança ou pergunta fora da base.
3. Reclamação, reembolso ou tema jurídico.
4. Negociação de preço ou desconto.
5. Duas tentativas sem avanço.
6. Fora do horário comercial.

- A promoção mantém o **mesmo ticket**; a área muda e o SLA/CSAT do Atendimento passa a valer.
- Antes do handoff, o Social **não tem SLA nem CSAT**; mede funil e conversão.
- O handoff vai para a **fila do time**. A atribuição continua **manual**: a fila apenas ordena.
- Se ninguém assumir dentro do SLA, o sistema **apenas notifica**; não redistribui nem escala automaticamente.
- O resumo do handoff leva o caminho do fluxo, os dados coletados e as últimas mensagens.

## Dashboard social

- **Audiência**: comentários, DMs, respostas de story, menções, seguidores e alcance.
- **Funil**: entradas, conclusões, vendas, receita e conversão por post e por fluxo.
- **Venda confirmada** é a conversão principal, atribuída por link único por fluxo/post e webhook da Kiwify; um webhook genérico cobre outros checkouts.
- O dashboard social não substitui as métricas de atendimento; cada área vê o seu recorte.

## Limites da Meta

- **Não é possível iniciar** conversa no Instagram ou Messenger; só responder.
- O funil comentário → DM usa **resposta privada a comentário**, dentro da janela permitida.
- A janela de conversa das redes é de **7 dias**; reiniciar fora dela depende do aplicativo.
- O token de conexão expira a cada **60 dias** e precisa ser renovado.
- A verificação de seguidor é **best effort**: usa a API oficial quando disponível e, se não houver, pede para seguir e entrega com registro.
- Instagram e Facebook exigem conta comercial e página vinculada; a conexão é feita pelo **Admin ou Manager**.

## Permissões

- **Admin** configura canais, automações, agentes e dashboards; vê e audita tudo.
- **Manager** opera a área, assume conversas, publica automações e vê os dashboards do workspace.
- **Membro** vê e responde o que é do seu time; pode assumir conversas da fila.
- **Viewer** lê o que o time vê, sem responder nem configurar.
- Times de Social e de Atendimento podem ser diferentes; a visibilidade segue o time e a área.

## Em aberto

- Viabilidade de comentários, DM e verificação de seguidor no TikTok e no Kwai.
- Múltiplas contas por rede no mesmo workspace.
- Métricas de alcance e seguidores que a API não entrega de forma estável.
- Revisão dos falsos positivos da promoção automática.
- Regra de qual time assume cada fila social.
- Limite de mensagens por fluxo e por janela de canal.

## Links

- [Atendimento multicanal](service.md)
- [Publicações e planejamento editorial](publications.md)
- [Automações e fluxos](automations.md)
- [Copiloto, Observer e agentes de IA](copilot-ai.md)
- [Papéis e permissões](roles-permissions.md)
- [Integrações externas](integrations.md)
- [ADR-107 — Social e atendimento em um ticket único](../decisions/adr-107-service-social.md)
- [ADR-109 — Automação social e atribuição de venda](../decisions/adr-109-automation-ai.md)
- [ADR-108 — Área de Publicações](../decisions/adr-108-publications.md)
